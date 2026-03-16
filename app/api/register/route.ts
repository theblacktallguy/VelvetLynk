import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { isValidUserSlug, slugifyUserSlug } from "@/lib/slug";
import { sendVerificationEmailForUser } from "@/lib/send-email-verification";
import { enforceRateLimit, getRequestIp } from "@/lib/rate-limit";
import { rateLimitExceeded } from "@/lib/rate-limit-response";


export async function POST(req: Request) {
  try {
    const ip = getRequestIp(req);

    const rl = await enforceRateLimit({
      action: "register",
      key: `ip:${ip}`,
      limit: 5,
      windowMs: 60 * 60 * 1000, // 5 per hour
    });

    if (!rl.allowed) {
      return rateLimitExceeded(rl.resetAt);
    }
    const body = await req.json();

    const fullName = String(body.fullName ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const usernameRaw = String(body.username ?? "").trim();
    const password = String(body.password ?? "");
    const confirmPassword = String(body.confirmPassword ?? "");

    // Basic validation
    if (!fullName || fullName.length < 2) {
      return NextResponse.json({ ok: false, error: "Full name is required." }, { status: 400 });
    }

    const userSlug = slugifyUserSlug(usernameRaw);
    if (!isValidUserSlug(userSlug)) {
      return NextResponse.json(
        { ok: false, error: "Username must be 3–24 chars, lowercase, may include hyphens only." },
        { status: 400 }
      );
    }

    if (!email.includes("@")) {
      return NextResponse.json({ ok: false, error: "Enter a valid email." }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ ok: false, error: "Password must be at least 8 characters." }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ ok: false, error: "Passwords do not match." }, { status: 400 });
    }

    // Uniqueness checks
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { userSlug }],
      },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json({ ok: false, error: "Email or username already registered." }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name: fullName,
        email,
        userSlug,
        passwordHash,
        verified: false,

        // ✅ create empty related rows so UI always has real data objects
        profile: { create: {} },
        wallet: { create: { credits: 0 } },
      },
      select: { id: true, email: true, userSlug: true, name: true },
    });

    if (user.email) {
      try {
        await sendVerificationEmailForUser({
          userId: user.id,
          email: user.email,
        });
      } catch (error) {
        console.error("Failed to send signup verification email:", error);
      }
    }

    return NextResponse.json({ ok: true, user });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Registration failed." },
      { status: 400 }
    );
  }
}