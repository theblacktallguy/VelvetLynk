import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { enforceRateLimit, getRequestIp } from "@/lib/rate-limit";
import { rateLimitExceeded } from "@/lib/rate-limit-response";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const body = await req.json().catch(() => null);

  const subject = typeof body?.subject === "string" ? body.subject.trim() : "";
  const message = typeof body?.message === "string" ? body.message.trim() : "";

  if (!subject || subject.length < 3) {
    return NextResponse.json(
      { error: "Subject must be at least 3 characters." },
      { status: 400 }
    );
  }

  if (!message || message.length < 10) {
    return NextResponse.json(
      { error: "Message must be at least 10 characters." },
      { status: 400 }
    );
  }

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ip = getRequestIp(req);

  const rl = await enforceRateLimit({
    action: "support_ticket",
    key: `user:${session.user.id}:ip:${ip}`,
    limit: 5,
    windowMs: 24 * 60 * 60 * 1000, // 5 per day
  });

  if (!rl.allowed) {
    return rateLimitExceeded(rl.resetAt);
  }

  try {
    // Save ticket in database
    const ticket = await prisma.supportTicket.create({
      data: {
        userId: session.user.id,
        subject,
        message,
        status: "OPEN",
      },
      select: {
        id: true,
        subject: true,
        createdAt: true,
      },
    });

    // Send admin email notification
    const adminEmail = process.env.ADMIN_EMAIL;

    if (process.env.RESEND_API_KEY && adminEmail) {
      await resend.emails.send({
        from: "SecretLink <onboarding@resend.dev>",
        to: adminEmail,
        subject: `New Support Ticket — ${subject}`,
        text: [
          `New support ticket submitted`,
          ``,
          `Ticket ID: ${ticket.id}`,
          `User ID: ${session.user.id}`,
          `User Email: ${session.user.email ?? "(not provided)"}`,
          ``,
          `Message:`,
          message,
        ].join("\n"),
      });
    }

    return NextResponse.json({ ok: true, ticket });
  } catch (error) {
    console.error("Create support ticket error:", error);
    return NextResponse.json(
      { error: "Failed to create support ticket." },
      { status: 500 }
    );
  }
}