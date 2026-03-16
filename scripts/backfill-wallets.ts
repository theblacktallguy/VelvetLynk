import "dotenv/config";
import { prisma } from "@/lib/prisma";

async function main() {
  const usersWithoutWallet = await prisma.user.findMany({
    where: {
      wallet: null,
    },
    select: {
      id: true,
      email: true,
      userSlug: true,
    },
  });

  console.log(`Found ${usersWithoutWallet.length} users without wallets`);

  for (const user of usersWithoutWallet) {
    await prisma.wallet.create({
      data: {
        userId: user.id,
        credits: 0,
      },
    });

    console.log(`Created wallet for ${user.userSlug} (${user.email ?? "no-email"})`);
  }

  console.log("Wallet backfill complete");
}

main()
  .catch((error) => {
    console.error("Wallet backfill failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });