import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();

    await prisma.ad.updateMany({
      where: {
        ownerId: session.user.id,
        status: "ACTIVE",
        expiresAt: {
          lt: now,
        },
      },
      data: {
        status: "EXPIRED",
      },
    });

    const ads = await prisma.ad.findMany({
      where: {
        ownerId: session.user.id,
        status: {
          not: "REMOVED",
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        title: true,
        status: true,
        featured: true,
        countrySlug: true,
        stateSlug: true,
        citySlug: true,
        categorySlug: true,
        displayName: true,
        age: true,
        priceText: true,
        locationText: true,
        imageUrls: true,
        createdAt: true,
        publishedAt: true,
        expiresAt: true,
        durationDays: true,
      },
    });

    const active = ads.filter((ad) => ad.status === "ACTIVE");
    const expired = ads.filter((ad) => ad.status === "EXPIRED");

    return NextResponse.json({
      active,
      expired,
    });
  } catch (error) {
    console.error("GET /api/account/ads error:", error);

    return NextResponse.json(
      { error: "Failed to fetch ads" },
      { status: 500 }
    );
  }
}