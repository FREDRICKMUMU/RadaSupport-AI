import { db } from "@/db/client";
import { knowledge_source } from "@/db/schema";
import { isAuthorized } from "@/lib/isAuthorized";
import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await isAuthorized();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sources = await db
      .select()
      .from(knowledge_source)
      .where(eq(knowledge_source.user_email, user.email))
      .orderBy(desc(knowledge_source.created_at)); // remove if the table has no created_at

    return NextResponse.json({ sources }, { status: 200 });
  } catch (error) {
    console.error("Error fetching knowledge sources:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}