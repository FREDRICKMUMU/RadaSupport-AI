import { db } from "@/db/client";
import { knowledge_source } from "@/db/schema";
import { isAuthorized } from "@/lib/isAuthorized";
import { summarizeMarkdown } from "@/lib/openAI";
import { NextRequest, NextResponse } from "next/server";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const TEXT_SUMMARY_THRESHOLD = 500; // only summarize pasted text longer than this

// Normalise summarizeMarkdown's result to a non-empty string.
async function summarize(content: string): Promise<string> {
  const result = (await summarizeMarkdown(content)) as string | undefined;
  if (!result || !result.trim()) {
    throw new Error("Summary came back empty");
  }
  return result;
}

export async function POST(req: NextRequest) {
  try {
    const user = await isAuthorized();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contentType = req.headers.get("content-type") || "";

    // ---------- FILE UPLOAD (multipart) ----------
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const type = String(formData.get("type") ?? "");

      if (type !== "upload") {
        return NextResponse.json({ error: "Invalid source type" }, { status: 400 });
      }

      const file = formData.get("file");
      if (!(file instanceof File)) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
      }
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: "File must be smaller than 10MB" },
          { status: 400 }
        );
      }

      const fileContent = await file.text();
      if (!fileContent.trim()) {
        return NextResponse.json({ error: "File is empty" }, { status: 400 });
      }

      const lines = fileContent.split("\n").filter((line) => line.trim());
      const headers = lines[0]?.split(",").map((h) => h.trim()) ?? [];

      const formattedContent = await summarize(fileContent);

      await db.insert(knowledge_source).values({
        user_email: user.email,
        type: "upload",
        name: file.name,
        status: "active",
        content: formattedContent,
        meta_data: JSON.stringify({
          fileName: file.name,
          fileSize: file.size,
          rowCount: Math.max(lines.length - 1, 0),
          headers,
        }),
      });

      return NextResponse.json(
        { message: "CSV file uploaded successfully" },
        { status: 200 }
      );
    }

    // ---------- WEBSITE + TEXT (JSON) ----------
    const body = await req.json();
    const type = String(body.type ?? "");

    if (type === "website") {
      let target: URL;
      try {
        target = new URL(body.url);
        if (target.protocol !== "http:" && target.protocol !== "https:") {
          throw new Error("bad protocol");
        }
      } catch {
        return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
      }

      const zenUrl = new URL("https://api.zenrows.com/v1/");
      zenUrl.searchParams.set("apikey", process.env.ZENROWS_API_KEY!);
      zenUrl.searchParams.set("url", target.toString());
      zenUrl.searchParams.set("response_type", "markdown");

      const res = await fetch(zenUrl.toString());
      const markdown = await res.text();

      if (!res.ok) {
        return NextResponse.json(
          {
            error: "ZenRows request failed",
            status: res.status,
            body: markdown.slice(0, 500),
          },
          { status: 502 }
        );
      }

      const summary = await summarize(markdown);

      await db.insert(knowledge_source).values({
        user_email: user.email,
        type: "website",
        name: target.hostname,
        source_url: target.toString(), // remove if your table has no source_url column
        status: "active",
        content: summary,
      });

      return NextResponse.json(
        { message: "Website added successfully" },
        { status: 200 }
      );
    }

    if (type === "text") {
      const title = String(body.title ?? "").trim();
      const text = String(body.content ?? "").trim();

      if (!title || !text) {
        return NextResponse.json(
          { error: "Title and content are required" },
          { status: 400 }
        );
      }

      const content =
        text.length > TEXT_SUMMARY_THRESHOLD ? await summarize(text) : text;

      await db.insert(knowledge_source).values({
        user_email: user.email,
        type: "text",
        name: title,
        status: "active",
        content,
      });

      return NextResponse.json(
        { message: "Text added successfully" },
        { status: 200 }
      );
    }

    return NextResponse.json({ error: "Invalid source type" }, { status: 400 });
  } catch (error) {
    console.error("Error in knowledge store:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}