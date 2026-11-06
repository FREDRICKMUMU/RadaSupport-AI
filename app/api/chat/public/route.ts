import { db } from "@/db/client";
import {
  chatBotMetadata,
  conversation,
  knowledge_source,
  messages as messagesTable,
} from "@/db/schema";
import {
  openai,
  MODEL,
  countConversationTokens,
  summarizeConversation,
  type ChatMessage,
} from "@/lib/llm";
import { and, eq, inArray } from "drizzle-orm";
import { jwtVerify } from "jose";
import { NextResponse } from "next/server";

function buildSystemPrompt(context: string): string {
  return context
    ? `You are a helpful assistant. Use the following context when it is relevant to the user's question. If the context does not contain the answer, say so.\n\n${context}`
    : "You are a helpful assistant. Answer the user's questions clearly and accurately.";
}

export async function POST(req: Request) {
  // 1. Verify the session token
  const authHeader = req.headers.get("Authorization");
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return NextResponse.json({ error: "Missing session token" }, { status: 401 });
  }

  let sessionId: string;
  let widgetId: string;

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not set");

    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    sessionId = payload.sessionId as string;
    widgetId = payload.widgetId as string;

    if (!sessionId || !widgetId) {
      throw new Error("Invalid Token Payload");
    }
  } catch (error) {
    console.error("Token Verification Failed:", error);
    return NextResponse.json(
      { error: "Invalid or expired session token" },
      { status: 401 }
    );
  }

  // 2. Read and clean the request body
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

  const lastMessage = messages[messages.length - 1];
  if (!lastMessage || lastMessage.role !== "user") {
    return NextResponse.json({ error: "No new user message" }, { status: 400 });
  }

  // 3. Find who owns this chatbot
  const [chatbot] = await db
    .select({ user_email: chatBotMetadata.user_email })
    .from(chatBotMetadata)
    .where(eq(chatBotMetadata.id, widgetId))
    .limit(1);

  if (!chatbot) {
    return NextResponse.json({ error: "Chatbot not found" }, { status: 404 });
  }

  // 4. Save the conversation and the user's message
  try {
    const [existingConv] = await db
      .select()
      .from(conversation)
      .where(eq(conversation.id, sessionId))
      .limit(1);

    if (!existingConv) {
      const forwardedFor = req.headers.get("x-forwarded-for");
      const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "Unknown IP";

      await db.insert(conversation).values({
        id: sessionId,
        chatbot_id: widgetId,
        visitor_ip: ip,
        name: `#Visitor(${ip})`,
      });

      const previousMessages = messages.slice(0, -1);
      if (previousMessages.length > 0) {
        await db.insert(messagesTable).values(
          previousMessages.map((msg) => ({
            conversation_id: sessionId,
            role: msg.role,
            content: msg.content,
          }))
        );
      }
    }

    await db.insert(messagesTable).values({
      conversation_id: sessionId,
      role: "user",
      content: lastMessage.content,
    });
  } catch (error) {
    console.error("Database Persistence Error (User):", error);
  }

  // 5. Build the context, only from sources owned by this chatbot's owner
  let context = "";
  if (knowledge_source_ids.length > 0) {
    try {
      const sources = await db
        .select({ content: knowledge_source.content })
        .from(knowledge_source)
        .where(
          and(
            eq(knowledge_source.user_email, chatbot.user_email),
            inArray(knowledge_source.id, knowledge_source_ids)
          )
        );

      context = sources
        .map((s) => s.content)
        .filter(Boolean)
        .join("\n\n");
    } catch (err) {
      console.error("RAG Retrieval Error:", err);
    }
  }

  // 6. Shrink long conversations
  try {
    if (countConversationTokens(messages) > 6000) {
      const recentMessages = messages.slice(-10);
      const olderMessages = messages.slice(0, -10);

      if (olderMessages.length > 0) {
        const summary = await summarizeConversation(olderMessages);
        context = `PREVIOUS CONVERSATION SUMMARY:\n${summary}\n\n` + context;
        messages = recentMessages;
      }
    }
  } catch (err) {
    console.error("Summarization Error:", err);
    messages = messages.slice(-10);
  }

  // 7. Ask the model, save and return the reply
  try {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: buildSystemPrompt(context) },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    const reply =
      completion.choices[0]?.message?.content?.trim() ||
      "I'm sorry, I couldn't generate a response.";

    try {
      await db.insert(messagesTable).values({
        conversation_id: sessionId,
        role: "assistant",
        content: reply,
      });
    } catch (error) {
      console.error("Database Persistence Error (AI):", error);
    }

    return NextResponse.json({ response: reply });
  } catch (error) {
    console.error("Gemini Error:", error);
    return NextResponse.json({ response: "An error occurred." }, { status: 500 });
  }
}