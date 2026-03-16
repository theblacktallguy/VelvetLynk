import { prisma } from "@/lib/prisma";

type RateLimitInput = {
  action: string;
  key: string;
  limit: number;
  windowMs: number;
};

function getWindowStart(windowMs: number) {
  const now = Date.now();
  return new Date(Math.floor(now / windowMs) * windowMs);
}

export function getRequestIp(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "unknown";
}

export async function enforceRateLimit({
  action,
  key,
  limit,
  windowMs,
}: RateLimitInput) {
  const windowStart = getWindowStart(windowMs);

  const bucket = await prisma.rateLimitBucket.upsert({
    where: {
      action_key_windowStart: {
        action,
        key,
        windowStart,
      },
    },
    create: {
      action,
      key,
      windowStart,
      count: 1,
    },
    update: {
      count: {
        increment: 1,
      },
    },
    select: {
      count: true,
      windowStart: true,
    },
  });

  const remaining = Math.max(0, limit - bucket.count);
  const resetAt = new Date(bucket.windowStart.getTime() + windowMs);
  const allowed = bucket.count <= limit;

  return {
    allowed,
    remaining,
    resetAt,
    count: bucket.count,
  };
}