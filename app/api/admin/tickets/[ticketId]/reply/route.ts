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
  { params }: { params: Promise<{ ticketId: string }> }
) {
  const adminUserId = await requireAdminUserId();

  if (!adminUserId) {
    return NextResponse.redirect(new URL("/account", req.url));
  }

  const { ticketId } = await params;
  const formData = await req.formData();
  const action = String(formData.get("action") || "");
  const reply = String(formData.get("reply") || "").trim();

  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
    select: { id: true },
  });

  if (!ticket) {
    return NextResponse.redirect(
      new URL("/admin/tickets?error=Ticket not found", req.url)
    );
  }

  try {
    if (action === "reply") {
      if (!reply || reply.length < 3) {
        return NextResponse.redirect(
          new URL(`/admin/tickets/${ticketId}?error=Reply is too short`, req.url)
        );
      }

      await prisma.supportTicket.update({
        where: { id: ticketId },
        data: {
          adminReply: reply,
          status: "ANSWERED",
          repliedAt: new Date(),
        },
      });

      return NextResponse.redirect(
        new URL("/admin/tickets?success=replied", req.url)
      );
    }

    if (action === "close") {
      await prisma.supportTicket.update({
        where: { id: ticketId },
        data: {
          status: "CLOSED",
          closedAt: new Date(),
        },
      });

      return NextResponse.redirect(
        new URL("/admin/tickets?success=closed", req.url)
      );
    }

    return NextResponse.redirect(
      new URL("/admin/tickets?error=Invalid action", req.url)
    );
  } catch (error) {
    console.error("Admin ticket reply error:", error);
    return NextResponse.redirect(
      new URL("/admin/tickets?error=Failed to process ticket action", req.url)
    );
  }
}