import { openai, MODEL } from "@/lib/llm";

export { openai };
export { summarizeConversation } from "@/lib/llm";

export async function summarizeMarkdown(markdown: string) {
  try {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      temperature: 0.1,
      max_tokens: 4000, // Gemini "thinking" uses part of this; 2000 words is about 2700 tokens
      messages: [
        {
          role: "system",
          content: `
You are a data summarization engine for an AI chatbot.
Your task:
Convert the input website markdown or text or csv files data into a CLEAN, DENSE SUMMARY for LLM context usage.
STRICT RULES:
Output ONLY plain text (no markdown, no bullet points, no headings).
Write as ONE continuous paragraph.
Remove navigation, menus, buttons, CTAs, pricing tables, sponsors, ads, testimonials, community chats, UI labels, emojis, and decorative content.
Remove repetition and marketing language.
Keep ONLY factual, informational content that helps answer customer support questions.
Do NOT copy sentences verbatim unless absolutely necessary.
Compress aggressively while preserving meaning.
The final output MUST be under 2000 words.
The result will be stored as long-term context for a chatbot.
`,
        },
        { role: "user", content: markdown },
      ],
    });

    return completion.choices[0]?.message?.content?.trim() ?? "";
  } catch (error) {
    console.error("Error in summarizeMarkdown:", error);
    throw error;
  }
}