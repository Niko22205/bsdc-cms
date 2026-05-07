-- CreateEnum
CREATE TYPE "Language" AS ENUM ('BG', 'EN');

-- CreateEnum
CREATE TYPE "ProjectNewsType" AS ENUM ('PROJECT', 'NEWS');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'EDITOR');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'EDITOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSetting" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "logoUrl" TEXT,
    "address" TEXT,
    "phones" TEXT[],
    "email" TEXT,
    "workingHours" TEXT,
    "googleMapsEmbed" TEXT,
    "socialLinks" JSONB,
    "footerText" TEXT,
    "defaultSeoTitle" TEXT,
    "defaultSeoDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomeContent" (
    "id" TEXT NOT NULL,
    "language" "Language" NOT NULL,
    "headline" TEXT NOT NULL,
    "subheadline" TEXT,
    "ctaLabel" TEXT,
    "ctaTarget" TEXT,
    "heroImageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomeContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AboutContent" (
    "id" TEXT NOT NULL,
    "language" "Language" NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "content" TEXT NOT NULL,
    "imageUrl" TEXT,
    "statistics" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AboutContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "language" "Language" NOT NULL,
    "translationKey" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "shortDescription" TEXT,
    "content" TEXT,
    "iconUrl" TEXT,
    "featuredImageUrl" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectNewsItem" (
    "id" TEXT NOT NULL,
    "language" "Language" NOT NULL,
    "translationKey" TEXT NOT NULL,
    "type" "ProjectNewsType" NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT,
    "featuredImageUrl" TEXT,
    "images" TEXT[],
    "category" TEXT,
    "publishedAt" TIMESTAMP(3),
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectNewsItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Partner" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT NOT NULL,
    "websiteUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Partner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Certificate" (
    "id" TEXT NOT NULL,
    "language" "Language" NOT NULL,
    "translationKey" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "issuer" TEXT,
    "issueDate" TIMESTAMP(3),
    "fileUrl" TEXT,
    "imageUrl" TEXT,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "altText" TEXT,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactSubmission" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "message" TEXT NOT NULL,
    "inquiryType" TEXT,
    "source" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "HomeContent_language_key" ON "HomeContent"("language");

-- CreateIndex
CREATE UNIQUE INDEX "AboutContent_language_key" ON "AboutContent"("language");

-- CreateIndex
CREATE INDEX "Service_language_published_sortOrder_idx" ON "Service"("language", "published", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Service_language_slug_key" ON "Service"("language", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Service_language_translationKey_key" ON "Service"("language", "translationKey");

-- CreateIndex
CREATE INDEX "ProjectNewsItem_language_type_published_publishedAt_idx" ON "ProjectNewsItem"("language", "type", "published", "publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectNewsItem_language_slug_key" ON "ProjectNewsItem"("language", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectNewsItem_language_translationKey_key" ON "ProjectNewsItem"("language", "translationKey");

-- CreateIndex
CREATE INDEX "Partner_published_sortOrder_idx" ON "Partner"("published", "sortOrder");

-- CreateIndex
CREATE INDEX "Certificate_language_published_sortOrder_idx" ON "Certificate"("language", "published", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_language_translationKey_key" ON "Certificate"("language", "translationKey");

-- CreateIndex
CREATE INDEX "ContactSubmission_read_createdAt_idx" ON "ContactSubmission"("read", "createdAt");
