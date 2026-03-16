import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Resend } from "resend";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { enforceRateLimit, getRequestIp } from "@/lib/rate-limit";
import { rateLimitExceeded } from "@/lib/rate-limit-response";

const resend = new Resend(process.env.RESEND_API_KEY);

const ALLOWED = new Set([
  "SPAM",
  "FAKE",
  "UNDERAGE",
  "HARASSMENT",
  "SCAM",
  "EXPLICIT_CONTENT",
  "WRONG_CATEGORY",
  "DUPLICATE",
  "OTHER",
]);

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ip = getRequestIp(req);

  const rl = await enforceRateLimit({
    action: "report",
    key: `user:${session.user.id}:ip:${ip}`,
    limit: 10,
    windowMs: 60 * 60 * 1000, // 10 per hour
  });

  if (!rl.allowed) {
    return rateLimitExceeded(rl.resetAt);
  }

  const body = await req.json().catch(() => null);

  const adId = typeof body?.adId === "string" ? body.adId.trim() : "";
  const reason = typeof body?.reason === "string" ? body.reason.trim() : "";
  const details = typeof body?.details === "string" ? body.details.trim() : "";
  const reporterEmail =
    typeof body?.reporterEmail === "string" ? body.reporterEmail.trim() : "";

  if (!adId || !ALLOWED.has(reason)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  try {
    const ad = await prisma.ad.findUnique({
      where: { id: adId },
      select: {
        id: true,
        title: true,
        ownerId: true,
      },
    });

    if (!ad) {
      return NextResponse.json({ error: "Ad not found." }, { status: 404 });
    }

    if (ad.ownerId === session.user.id) {
      return NextResponse.json(
        { error: "You cannot report your own ad." },
        { status: 400 }
      );
    }

    const existingPendingReport = await prisma.report.findFirst({
      where: {
        adId,
        reporterId: session.user.id,
        status: "PENDING",
      },
      select: { id: true },
    });

    if (existingPendingReport) {
      return NextResponse.json(
        { error: "You already have a pending report for this ad." },
        { status: 400 }
      );
    }

    await prisma.report.create({
      data: {
        adId,
        reporterId: session.user.id,
        reason: reason as any,
        details: details || null,
        status: "PENDING",
      },
    });

    const adminEmail = process.env.ADMIN_EMAIL;

    if (process.env.RESEND_API_KEY && adminEmail) {
      await resend.emails.send({
        from: "SecretLink <onboarding@resend.dev>",
        to: adminEmail,
        subject: `New Report (${reason}) — Ad ${adId}`,
        text: [
          `New report submitted`,
          ``,
          `Ad ID: ${adId}`,
          `Ad Title: ${ad.title}`,
          `Reason: ${reason}`,
          `Reporter Email: ${reporterEmail || session.user.email || "(not provided)"}`,
          ``,
          `Details:`,
          details || "(none)",
        ].join("\n"),
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Create report error:", error);
    return NextResponse.json(
      { error: "Failed to submit report." },
      { status: 500 }
    );
  }
}