import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login?callbackUrl=/account/settings", req.url));
  }

  try {
    const formData = await req.formData();

    const confirmText = String(formData.get("confirmText") || "").trim();
    const currentPassword = String(formData.get("currentPassword") || "");

    if (confirmText !== "DELETE") {
      return NextResponse.redirect(
        new URL("/account/settings?error=Type DELETE to confirm account deletion", req.url)
      );
    }

    if (!currentPassword || currentPassword.length < 8) {
      return NextResponse.redirect(
        new URL("/account/settings?error=Enter your current password", req.url)
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        passwordHash: true,
        wallet: {
          select: {
            id: true,
          },
        },
        ads: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if (!user.passwordHash) {
      return NextResponse.redirect(
        new URL("/account/settings?error=Password verification is required", req.url)
      );
    }

    const ok = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!ok) {
      return NextResponse.redirect(
        new URL("/account/settings?error=Current password is incorrect", req.url)
      );
    }

    const adIds = user.ads.map((ad) => ad.id);

    await prisma.$transaction(async (tx) => {
      if (adIds.length > 0) {
        await tx.report.deleteMany({
          where: {
            adId: {
              in: adIds,
            },
          },
        });
      }

      await tx.report.deleteMany({
        where: {
          reporterId: user.id,
        },
      });

      await tx.supportTicket.deleteMany({
        where: {
          userId: user.id,
        },
      });

      await tx.verificationRequest.deleteMany({
        where: {
          userId: user.id,
        },
      });

      if (user.wallet?.id) {
        await tx.walletTransaction.deleteMany({
          where: {
            walletId: user.wallet.id,
          },
        });

        await tx.wallet.delete({
          where: {
            id: user.wallet.id,
          },
        });
      }

      await tx.ad.deleteMany({
        where: {
          ownerId: user.id,
        },
      });

      await tx.profile.deleteMany({
        where: {
          userId: user.id,
        },
      });

      await tx.account.deleteMany({
        where: {
          userId: user.id,
        },
      });

      await tx.session.deleteMany({
        where: {
          userId: user.id,
        },
      });

      await tx.user.delete({
        where: {
          id: user.id,
        },
      });
    });

    return NextResponse.redirect(new URL("/login?deleted=1", req.url));
  } catch (error) {
    console.error("Delete account error:", error);
    return NextResponse.redirect(
      new URL("/account/settings?error=Failed to delete account", req.url)
    );
  }
}