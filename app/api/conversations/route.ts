import { db } from "@/db/client";
import {
  chatBotMetadata,
  conversation,
  messages,
} from "@/db/schema";
import { isAuthorized } from "@/lib/isAuthorized";
import { desc, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";

const parseDbDate = (value?: string | null) => {
  if (!value) return null;
  let s = value.trim().replace(" ", "T");
  if (/[+-]\d{2}$/.test(s)) s += ":00";
  const date = new Date(s);
  return isNaN(date.getTime()) ? null : date;
};

const formatRelative = (date: Date | null) => {
  if (!date) return "";
  const diffMins = Math.max(
    0,
    Math.floor((Date.now() - date.getTime()) / 60000)
  );
  const diffHours = Math.floor(diffMins / 60);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString();
};

export async function GET() {
  try {
    const user = await isAuthorized();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bots = await db
      .select()
      .from(chatBotMetadata)
      .where(eq(chatBotMetadata.user_email, user.email));

    if (bots.length === 0) {
      return NextResponse.json({ conversations: [] });
    }

    const botIds = bots.map((b) => b.id);

    const convs = await db
      .select()
      .from(conversation)
      .where(inArray(conversation.chatbot_id, botIds))
      .orderBy(desc(conversation.created_at))
      .limit(100);

    const data = await Promise.all(
      convs.map(async (c) => {
        const [lastMsg] = await db
          .select()
          .from(messages)
          .where(eq(messages.conversation_id, c.id))
          .orderBy(desc(messages.created_at))
          .limit(1);

        const date = parseDbDate(lastMsg?.created_at ?? c.created_at);

        return {
          id: c.id,
          user: c.name || "Visitor",
          lastMessage: lastMsg?.content || "Started conversation",
          status: "active",
          time: formatRelative(date),
          visitor_ip: c.visitor_ip,
        };
      })
    );

    return NextResponse.json({ conversations: data });
  } catch (error) {
    console.error("Dashboard Conversations Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}