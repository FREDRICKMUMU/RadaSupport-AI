import { isAuthorized } from "@/lib/isAuthorized";
import { db } from "@/db/client";
import { metadata } from "@/db/schema";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const user = await isAuthorized();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { business_name, website_url, external_links } = await req.json();

    if (!business_name || !website_url) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const metadataResponse = await db
      .insert(metadata)
      .values({
        user_email: user.email,
        business_name,
        website_url,
        external_links,
      })
      .returning();

    const cookieStore = await cookies();
    cookieStore.set("metadata", JSON.stringify({ business_name }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return NextResponse.json({ metadata: metadataResponse }, { status: 201 });
  } catch (error) {
    console.error("Error storing metadata:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}