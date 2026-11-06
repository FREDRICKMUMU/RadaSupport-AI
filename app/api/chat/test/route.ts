import { db } from "@/db/client";
import { knowledge_source } from "@/db/schema";
import { isAuthorized } from "@/lib/isAuthorized";
import {
  openai,
  MODEL,
  countConversationTokens,
  summarizeConversation,
  type ChatMessage,
} from "@/lib/llm";
import { and, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const user = await isAuthorized();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  let messages: ChatMessage[] = (Array.isArray(body.messages) ? body.messages : [])
    .filter(
      (m: any) =>
        (m?.role === "user" || m?.role === "assistant") &&
        typeof m?.content === "string" &&
        m.content.trim().length > 0
    )
    .map((m: any) => ({ role: m.role, content: m.content }));

  const knowledge_source_ids: string[] = Array.isArray(body.knowledge_source_ids)
    ? body.knowledge_source_ids
    : [];

  if (messages.length === 0) {
    return NextResponse.json({ error: "No messages provided" }, { status: 400 });
  }

  try {
    let context = "";

    if (knowledge_source_ids.length > 0) {
      const sources = await db
        .select({ content: knowledge_source.content })
        .from(knowledge_source)
        .where(
          and(
            eq(knowledge_source.user_email, user.email),
            inArray(knowledge_source.id, knowledge_source_ids as any)
          )
        );

      context = sources
        .map((s) => s.content)
        .filter(Boolean)
        .join("\n\n");
    }

    if (countConversationTokens(messages) > 6000) {
      const recentMessages = messages.slice(-10);
      const olderMessages = messages.slice(0, -10);

      if (olderMessages.length > 0) {
        const summary = await summarizeConversation(olderMessages);
        context = `PREVIOUS CONVERSATION SUMMARY:\n${summary}\n\n` + context;
        messages = recentMessages;
      }
    }

    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: context
            ? `You are a helpful assistant. Use the following context when relevant to the user's request:\n\n${context}`
            : "You are a helpful assistant.",
        },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    const reply =
      completion.choices[0]?.message?.content?.trim() ||
      "I'm sorry, I couldn't generate a response.";

    return NextResponse.json({ response: reply });
  } catch (error) {
    console.error("Chat error (Gemini):", error);
    return NextResponse.json(
      { response: "An error occurred while processing your request." },
      { status: 500 }
    );
  }
}