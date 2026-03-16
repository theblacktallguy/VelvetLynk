import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { AdStatus } from "@prisma/client";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);

    if (!body || typeof body.adId !== "string" || !body.adId.trim()) {
      return NextResponse.json({ error: "Ad ID is required." }, { status: 400 });
    }

    const adId = body.adId.trim();

    const ad = await prisma.ad.findUnique({
      where: { id: adId },
      select: {
        id: true,
        ownerId: true,
        status: true,
      },
    });

    if (!ad) {
      return NextResponse.json({ error: "Ad not found." }, { status: 404 });
    }

    if (ad.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (ad.status === AdStatus.REMOVED) {
      return NextResponse.json(
        { error: "Ad has already been deleted." },
        { status: 400 }
      );
    }

    await prisma.ad.update({
      where: { id: ad.id },
      data: {
        status: AdStatus.REMOVED,
      },
    });

    return NextResponse.json({
      ok: true,
      adId: ad.id,
    });
  } catch (error) {
    console.error("DELETE /api/account/ad/delete error:", error);
    return NextResponse.json({ error: "Failed to delete ad." }, { status: 500 });
  }
}