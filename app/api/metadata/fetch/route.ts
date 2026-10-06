import { isAuthorized } from "@/lib/isAuthorized";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { metadata as Metadata } from "@/db/schema";

export async function GET() {
  try {
    const user = await isAuthorized();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cookieStore = await cookies();
    const metadataCookie = cookieStore.get("metadata");

    if (metadataCookie?.value) {
      return NextResponse.json(
        {
          exists: true,
          source: "cookie",
          data: JSON.parse(metadataCookie.value),
        },
        { status: 200 }
      );
    }

    const [record] = await db
      .select()
      .from(Metadata)
      .where(eq(Metadata.user_email, user.email));

    if (record) {
      cookieStore.set(
        "metadata",
        JSON.stringify({ business_name: record.business_name }),
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 60 * 24 * 30, // 30 days
          path: "/",
        }
      );

      return NextResponse.json(
        {
          exists: true,
          source: "database",
          data: record,
        },
        { status: 200 }
      );
    }

    return NextResponse.json({ exists: false, data: null }, { status: 200 });
  } catch (error) {
    console.error("Metadata fetch error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}