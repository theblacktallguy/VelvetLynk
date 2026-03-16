import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdminUserId() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      userSlug: true,
    },
  });

  if (!user) return null;

  const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((x) => x.trim().toLowerCase())
    .filter(Boolean);

  const isAdmin =
    (user.email && adminEmails.includes(user.email.toLowerCase())) ||
    user.userSlug === "admin";

  return isAdmin ? user.id : null;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ reportId: string }> }
) {
  const adminUserId = await requireAdminUserId();

  if (!adminUserId) {
    return NextResponse.redirect(new URL("/account", req.url));
  }

  const { reportId } = await params;
  const formData = await req.formData();
  const action = String(formData.get("action") || "");

  const report = await prisma.report.findUnique({
    where: { id: reportId },
    select: {
      id: true,
      adId: true,
      ad: {
        select: {
          id: true,
          ownerId: true,
        },
      },
    },
  });

  if (!report) {
    return NextResponse.redirect(
      new URL("/admin/reports?error=Report not found", req.url)
    );
  }

  try {
    if (action === "reviewed") {
      await prisma.report.update({
        where: { id: reportId },
        data: {
          status: "REVIEWED",
        },
      });

      return NextResponse.redirect(
        new URL("/admin/reports?success=reviewed", req.url)
      );
    }

    if (action === "dismissed") {
      await prisma.report.update({
        where: { id: reportId },
        data: {
          status: "DISMISSED",
        },
      });

      return NextResponse.redirect(
        new URL("/admin/reports?success=dismissed", req.url)
      );
    }

    if (action === "remove_ad") {
      if (report.adId) {
        await prisma.$transaction(async (tx) => {
          await tx.ad.update({
            where: { id: report.adId! },
            data: {
              status: "REMOVED",
            },
          });

          await tx.report.update({
            where: { id: reportId },
            data: {
              status: "ACTION_TAKEN",
            },
          });
        });

        return NextResponse.redirect(
          new URL("/admin/reports?success=actioned", req.url)
        );
      }
    }

    if (action === "suspend_user") {
      if (report.ad?.ownerId) {
        await prisma.$transaction(async (tx) => {
          await tx.user.update({
            where: { id: report.ad.ownerId },
            data: {
              sessionVersion: {
                increment: 1,
              },
            },
          });

          await tx.report.update({
            where: { id: reportId },
            data: {
              status: "ACTION_TAKEN",
            },
          });
        });

        return NextResponse.redirect(
          new URL("/admin/reports?success=actioned", req.url)
        );
      }
    }

    return NextResponse.redirect(
      new URL("/admin/reports?error=Invalid action", req.url)
    );
  } catch (error) {
    console.error("Admin report action error:", error);
    return NextResponse.redirect(
      new URL("/admin/reports?error=Failed to process report action", req.url)
    );
  }
}