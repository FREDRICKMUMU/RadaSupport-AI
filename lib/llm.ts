import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

export const MODEL = process.env.GEMINI_MODEL ?? "gemini-3.5-flash-lite";

export type ChatMessage = { role: "user" | "assistant"; content: string };

export const countConversationTokens = (messages: ChatMessage[]) =>
  messages.reduce(
    (total, message) => total + Math.ceil(message.content.length / 4),
    0
  );

export const summarizeConversation = async (messages: ChatMessage[]) => {
  const transcript = messages
    .map((m) => `${m.role === "user" ? "Customer" : "Agent"}: ${m.content}`)
    .join("\n");

  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "system",
        content:
          "Summarize this support conversation in under 150 words. Keep the customer's problem, key facts (names, order numbers, products), and anything already answered or promised.",
      },
      { role: "user", content: transcript },
    ],
    temperature: 0.1,
    max_tokens: 600,
  });

  return completion.choices[0]?.message?.content?.trim() ?? "";
};