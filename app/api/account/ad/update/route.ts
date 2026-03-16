import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { AdStatus } from "@prisma/client";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MIN_PHOTOS = 3;
const MAX_PHOTOS = 5;

function normalizeString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeOptionalString(value: unknown) {
  const v = typeof value === "string" ? value.trim() : "";
  return v || null;
}

function countAdContacts(data: {
  phone?: string | null;
  email?: string | null;
  whatsapp?: string | null;
  snapchat?: string | null;
}) {
  return [data.phone, data.email, data.whatsapp, data.snapchat].filter((v) =>
    Boolean(v?.trim())
  ).length;
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const adId = normalizeString(body.adId);

    const stateSlug = normalizeString(body.stateSlug);
    const citySlug = normalizeString(body.citySlug);
    const categorySlug = normalizeString(body.categorySlug);
    const title = normalizeString(body.title);
    const adBody = normalizeString(body.body);
    const sex = normalizeString(body.sex);
    const orientation = normalizeString(body.orientation);
    const locationText = normalizeString(body.locationText);

    const phone = normalizeOptionalString(body.phone);
    const email = normalizeOptionalString(body.email);
    const whatsapp = normalizeOptionalString(body.whatsapp);
    const snapchat = normalizeOptionalString(body.snapchat);

    const imageUrls = Array.isArray(body.imageUrls)
      ? body.imageUrls
          .map((url: unknown) => (typeof url === "string" ? url.trim() : ""))
          .filter(Boolean)
      : [];

    const numericAge = Number(body.age);

    if (!adId) {
      return NextResponse.json({ error: "Ad ID is required." }, { status: 400 });
    }

    if (!stateSlug || !citySlug || !categorySlug) {
      return NextResponse.json({ error: "Missing routing fields" }, { status: 400 });
    }

    if (!title) {
      return NextResponse.json({ error: "Title is required." }, { status: 400 });
    }

    if (title.length > 200) {
      return NextResponse.json(
        { error: "Title must be 200 characters or less." },
        { status: 400 }
      );
    }

    if (!adBody) {
      return NextResponse.json({ error: "Description is required." }, { status: 400 });
    }

    if (!sex) {
      return NextResponse.json({ error: "Sex is required." }, { status: 400 });
    }

    if (!Number.isFinite(numericAge) || numericAge < 18) {
      return NextResponse.json({ error: "Age is required (18+)." }, { status: 400 });
    }

    if (!orientation) {
      return NextResponse.json(
        { error: "Please select sexual orientation." },
        { status: 400 }
      );
    }

    if (!locationText) {
      return NextResponse.json({ error: "Location text is required." }, { status: 400 });
    }

    if (imageUrls.length < MIN_PHOTOS || imageUrls.length > MAX_PHOTOS) {
      return NextResponse.json({ error: "Photos must be 3–5" }, { status: 400 });
    }

    const adContactCount = countAdContacts({
      phone,
      email,
      whatsapp,
      snapchat,
    });

    if (adContactCount < 2) {
      return NextResponse.json(
        { error: "Please add at least 2 contact methods." },
        { status: 400 }
      );
    }

    const existingAd = await prisma.ad.findUnique({
      where: { id: adId },
      select: {
        id: true,
        ownerId: true,
        status: true,
      },
    });

    if (!existingAd) {
      return NextResponse.json({ error: "Ad not found." }, { status: 404 });
    }

    if (existingAd.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (existingAd.status === AdStatus.REMOVED) {
      return NextResponse.json(
        { error: "Removed ads cannot be edited." },
        { status: 400 }
      );
    }

    const updated = await prisma.ad.update({
      where: { id: adId },
      data: {
        stateSlug,
        citySlug,
        categorySlug,
        title,
        body: adBody,
        sex,
        age: Math.trunc(numericAge),
        orientation,
        locationText,
        imageUrls,
        phone,
        email,
        whatsapp,
        snapchat,
      },
      select: {
        id: true,
        status: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      ok: true,
      adId: updated.id,
      status: updated.status,
      updatedAt: updated.updatedAt,
    });
  } catch (error) {
    console.error("PATCH /api/account/ad/update error:", error);
    return NextResponse.json({ error: "Failed to update ad." }, { status: 500 });
  }
}