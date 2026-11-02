import { db } from "@/db/client";
import {
  chatBotMetadata,
  conversation,
  knowledge_source,
  messages,
  sections,
} from "@/db/schema";
import { isAuthorized } from "@/lib/isAuthorized";
import { count, desc, eq, inArray } from "drizzle-orm";
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

    // Chatbots owned by this user
    const bots = await db
      .select()
      .from(chatBotMetadata)
      .where(eq(chatBotMetadata.user_email, user.email));
    const botIds = bots.map((b) => b.id);

    // Knowledge sources grouped by type
    const ks = await db
      .select({
        type: knowledge_source.type,
        count: count(),
      })
      .from(knowledge_source)
      .where(eq(knowledge_source.user_email, user.email))
      .groupBy(knowledge_source.type);

    const knowledgeStats = { website: 0, uploads: 0, text: 0, total: 0 };

    ks.forEach((k) => {
      if (k.type === "website") knowledgeStats.website += k.count;
      else if (k.type === "text") knowledgeStats.text += k.count;
      else if (k.type === "upload") knowledgeStats.uploads += k.count;
      knowledgeStats.total += k.count;
    });

    // Sections
    const userSections = await db
      .select()
      .from(sections)
      .where(eq(sections.user_email, user.email))
      .orderBy(desc(sections.created_at));

    const sectionStats = {
      total: userSections.length,
      list: userSections.slice(0, 5).map((s) => ({
        name: s.name,
        sourceCount: s.source_ids.length,
        tone: s.tone,
      })),
    };

    // Conversations
    let recentChats: { title: string; snippet: string; time: string }[] = [];
    let totalConversations = 0;

    if (botIds.length > 0) {
      const [total] = await db
        .select({ value: count() })
        .from(conversation)
        .where(inArray(conversation.chatbot_id, botIds));
      totalConversations = total?.value ?? 0;

      const rawConvs = await db
        .select()
        .from(conversation)
        .where(inArray(conversation.chatbot_id, botIds))
        .orderBy(desc(conversation.created_at))
        .limit(5);

      recentChats = await Promise.all(
        rawConvs.map(async (c) => {
          const [lastMsg] = await db
            .select()
            .from(messages)
            .where(eq(messages.conversation_id, c.id))
            .orderBy(desc(messages.created_at))
            .limit(1);

          return {
            title: c.name || "Visitor Chat",
            snippet: lastMsg?.content || "No interactions yet",
            time: formatRelative(
              parseDbDate(lastMsg?.created_at ?? c.created_at)
            ),
          };
        })
      );
    }

    return NextResponse.json({
      botId: botIds[0] || null,
      knowledge: knowledgeStats,
      sections: sectionStats,
      chats: recentChats,
      counts: {
        knowledge: knowledgeStats.total,
        sections: sectionStats.total,
        conversations: totalConversations,
      },
    });
  } catch (error) {
    console.error("Dashboard Overview Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}