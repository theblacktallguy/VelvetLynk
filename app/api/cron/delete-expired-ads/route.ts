// /app/api/cron/delete-expired-ads/route.ts
import { NextResponse } from "next/server";
import { handleExpiredAds } from "@/lib/cron/delete-expired-ads";

export async function GET() {
  try {
    await handleExpiredAds();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Cron error:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}