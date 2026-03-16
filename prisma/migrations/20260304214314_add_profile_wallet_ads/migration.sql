-- CreateEnum
CREATE TYPE "AdStatus" AS ENUM ('DRAFT', 'ACTIVE', 'EXPIRED', 'REMOVED');

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bio" VARCHAR(150),
    "phone" TEXT,
    "email" TEXT,
    "whatsapp" TEXT,
    "snapchat" TEXT,
    "instagram" TEXT,
    "website" TEXT,
    "state" TEXT,
    "city" TEXT,
    "avatarUrl" TEXT,
    "photoUrls" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wallet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "credits" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ad" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "countrySlug" TEXT NOT NULL DEFAULT 'ng',
    "stateSlug" TEXT NOT NULL,
    "citySlug" TEXT NOT NULL,
    "categorySlug" TEXT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "body" TEXT NOT NULL,
    "sex" TEXT,
    "age" INTEGER,
    "orientation" TEXT,
    "locationText" TEXT,
    "imageUrls" TEXT[],
    "phone" TEXT,
    "email" TEXT,
    "whatsapp" TEXT,
    "snapchat" TEXT,
    "status" "AdStatus" NOT NULL DEFAULT 'ACTIVE',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "Ad_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_userId_key" ON "Wallet"("userId");

-- CreateIndex
CREATE INDEX "Ad_status_createdAt_idx" ON "Ad"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Ad_countrySlug_stateSlug_citySlug_categorySlug_idx" ON "Ad"("countrySlug", "stateSlug", "citySlug", "categorySlug");

-- CreateIndex
CREATE INDEX "Ad_featured_createdAt_idx" ON "Ad"("featured", "createdAt");

-- CreateIndex
CREATE INDEX "Ad_ownerId_createdAt_idx" ON "Ad"("ownerId", "createdAt");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ad" ADD CONSTRAINT "Ad_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
