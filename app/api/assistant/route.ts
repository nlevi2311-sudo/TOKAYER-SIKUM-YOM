import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth/session";
import { KNOWLEDGE, SYSTEM_PROMPT } from "@/lib/ai/knowledge";

/**
 * העוזר של טוקאייר: עונה לשאלות הצוות על סמך האוגדן והלומדה.
 * רץ כ-Netlify Function. ה-AI Gateway של Netlify מזריק את פרטי הגישה ל-Claude.
 * השיחות לא נשמרות בשום מקום.
 */
export const maxDuration = 60;

const bodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(4000),
      }),
    )
    .min(1)
    .max(20),
});

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user || !user.active) return Response.json({ error: "צריך להתחבר מחדש" }, { status: 401 });

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "בקשה לא תקינה" }, { status: 400 });
  const messages = parsed.data.messages;
  if (messages[0].role !== "user" || messages[messages.length - 1].role !== "user") {
    return Response.json({ error: "בקשה לא תקינה" }, { status: 400 });
  }

  if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_BASE_URL) {
    return Response.json({ error: "העוזר עדיין לא מחובר לשירות ה-AI." }, { status: 503 });
  }

  const client = new Anthropic();
  const stream = client.messages.stream({
    model: "claude-opus-5-5",
    max_tokens: 4000,
    output_config: { effort: "low" },
    system: [
      { type: "text", text: SYSTEM_PROMPT },
      { type: "text", text: KNOWLEDGE, cache_control: { type: "ephemeral" } },
    ],
    messages,
  });

  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        const final = await stream.finalMessage();
        if (final.stop_reason === "refusal") {
          controller.enqueue(encoder.encode("\n\nלא אוכל לענות על זה. פנו למנהל התורן."));
        } else if (final.stop_reason === "max_tokens") {
          controller.enqueue(encoder.encode("\n\nהתשובה נקטעה. נסו לשאול שאלה ממוקדת יותר."));
        }
      } catch (error) {
        if (error instanceof Anthropic.RateLimitError) {
          controller.enqueue(encoder.encode("העוזר עמוס כרגע. נסו שוב בעוד דקה."));
        } else {
          console.error("[assistant]", error);
          controller.enqueue(encoder.encode("לא הצלחתי לענות כרגע. נסו שוב, ובמקרה דחוף פנו למנהל התורן."));
        }
      } finally {
        controller.close();
      }
    },
    cancel() {
      stream.abort();
    },
  });

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}
