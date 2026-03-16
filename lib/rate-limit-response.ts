import { NextResponse } from "next/server";

export function rateLimitExceeded(resetAt: Date) {
  return NextResponse.json(
    {
      error: "Too many requests. Please try again later.",
      resetAt: resetAt.toISOString(),
    },
    { status: 429 }
  );
}