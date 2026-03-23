// /lib/cron/delete-expired-ads.ts
import { prisma } from "@/lib/prisma";
import { AdStatus } from "@prisma/client";

/**
 * Combined cron job:
 * 1️⃣ Marks ads as EXPIRED if their expiresAt has passed
 * 2️⃣ Deletes ads older than 10 days from the database
 */
export async function handleExpiredAds() {
  const now = new Date();

  // 1️⃣ Mark expired ads as EXPIRED
  const expiredMark = await prisma.ad.updateMany({
    where: {
      status: AdStatus.ACTIVE,
      expiresAt: {
        lt: now,
      },
    },
    data: {
      status: AdStatus.EXPIRED,
    },
  });

  console.log(`Marked ${expiredMark.count} ads as expired`);

  // 2️⃣ Delete ads older than 10 days (cleanup)
  const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);

  const deleted = await prisma.ad.deleteMany({
    where: {
      expiresAt: {
        lt: tenDaysAgo,
      },
    },
  });

  console.log(`Deleted ${deleted.count} ads older than 10 days`);
}