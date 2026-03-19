import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

type ChatMessage = {
  role: "user" | "bot";
  text: string;
};

const SUPPORT_SYSTEM_PROMPT = `
You are the VelvetLynk Support Assistant.

Your job is to help users with:
- account login and settings
- profile editing and photos
- posting ads and managing ads
- wallet and credits
- verification
- support tickets
- reporting unsafe content
- privacy, safety, and platform rules

Rules:
- Be helpful, calm, and concise.
- Give practical next steps.
- Do not invent account-specific facts.
- Do not claim you completed actions you cannot actually perform.
- Do not assist with fraud, impersonation, evasion, illegal services, harassment, or exploitative activity.
- When the user needs human help, tell them to use the support ticket form.
- Keep answers short and support-focused.
`;

function sanitizeMessages(messages: unknown): ChatMessage[] {
  if (!Array.isArray(messages)) return [];
  return messages
    .filter(
      (m): m is ChatMessage =>
        !!m &&
        typeof m === "object" &&
        (m as any).role &&
        (m as any).text &&
        ((m as any).role === "user" || (m as any).role === "bot") &&
        typeof (m as any).text === "string"
    )
    .slice(-10);
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not configured." },
        { status: 500 }
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const session = await getServerSession(authOptions);
    const body = await req.json().catch(() => null);

    const message =
      typeof body?.message === "string" ? body.message.trim() : "";
    const history = sanitizeMessages(body?.history);

    if (!message) {
      return NextResponse.json(
        { error: "Message is required." },
        { status: 400 }
      );
    }

    const historyText = history
      .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.text}`)
      .join("\n");

    const userContext = [
      session?.user?.id ? `User is signed in: yes` : `User is signed in: no`,
      session?.user?.email ? `User email is available: yes` : `User email is available: no`,
      session?.user?.userSlug ? `User slug is available: yes` : `User slug is available: no`,
    ].join("\n");

    const response = await openai.responses.create({
      model: process.env.OPENAI_SUPPORT_MODEL || "gpt-4o",
      instructions: SUPPORT_SYSTEM_PROMPT,
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: [
                `Support conversation history:`,
                historyText || "(none)",
                ``,
                `Known user context:`,
                userContext,
                ``,
                `Latest user message:`,
                message,
              ].join("\n"),
            },
          ],
        },
      ],
      temperature: 0.4,
      max_output_tokens: 300,
    });

    const text =
      response.output_text?.trim() ||
      "Sorry — I could not generate a reply right now. Please try again or create a support ticket.";

    return NextResponse.json({ ok: true, reply: text });
  } catch (error) {
    console.error("Support chat AI error:", error);
    return NextResponse.json(
      { error: "Failed to generate support reply." },
      { status: 500 }
    );
  }
}