import { db } from "@/db/client";
import { chatBotMetadata, sections } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { jwtVerify } from "jose";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error("JWT_SECRET is not set");
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
    }

    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(jwtSecret)
    );
    const widgetId = payload.widgetId as string;

    const [meta] = await db
      .select()
      .from(chatBotMetadata)
      .where(eq(chatBotMetadata.id, widgetId))
      .limit(1);

    if (!meta) {
      return NextResponse.json({ error: "Bot not found" }, { status: 404 });
    }

    // Trust the database for the owner, not the token
    const userSections = await db
      .select({
        id: sections.id,
        name: sections.name,
        source_ids: sections.source_ids,
      })
      .from(sections)
      .where(
        and(
          eq(sections.user_email, meta.user_email),
          eq(sections.status, "active")
        )
      );

    return NextResponse.json({
      // Don't send the owner's email to website visitors
      metadata: {
        id: meta.id,
        color: meta.color,
        welcome_message: meta.welcome_message,
      },
      sections: userSections,
    });
  } catch (error) {
    console.error("Config Fetch Error:", error);
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 401 }
    );
  }
}