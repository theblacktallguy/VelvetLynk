// web/lib/prisma.ts
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("Missing DATABASE_URL in environment.");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

export const prisma =
  global.prisma ??
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") global.prisma = prisma;
