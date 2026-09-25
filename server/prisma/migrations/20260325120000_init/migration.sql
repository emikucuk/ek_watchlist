-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('MOVIE', 'TV', 'ANIME', 'ANIMATION', 'DOCUMENTARY', 'MINI_SERIES');

-- CreateEnum
CREATE TYPE "WatchStatus" AS ENUM ('WATCHING', 'WATCHED', 'PLAN_TO_WATCH', 'DROPPED');

-- CreateTable
CREATE TABLE "WatchItem" (
    "id" TEXT NOT NULL,
    "tmdbId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "originalTitle" TEXT,
    "overview" TEXT,
    "posterPath" TEXT,
    "backdropPath" TEXT,
    "releaseDate" TEXT,
    "mediaType" "MediaType" NOT NULL,
    "tmdbRating" DOUBLE PRECISION,
    "personalRating" DOUBLE PRECISION,
    "status" "WatchStatus" NOT NULL DEFAULT 'PLAN_TO_WATCH',
    "notes" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "rankingOrder" INTEGER,
    "currentSeason" INTEGER,
    "currentEpisode" INTEGER,
    "runtimeMinutes" INTEGER,
    "genres" TEXT,
    "customCategoryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WatchItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#6366f1',
    "icon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemTag" (
    "itemId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "ItemTag_pkey" PRIMARY KEY ("itemId","tagId")
);

-- CreateTable
CREATE TABLE "AppSetting" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppSetting_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "BackupLog" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BackupLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WatchItem_status_idx" ON "WatchItem"("status");

-- CreateIndex
CREATE INDEX "WatchItem_mediaType_idx" ON "WatchItem"("mediaType");

-- CreateIndex
CREATE INDEX "WatchItem_sortOrder_idx" ON "WatchItem"("sortOrder");

-- CreateIndex
CREATE INDEX "WatchItem_rankingOrder_idx" ON "WatchItem"("rankingOrder");

-- CreateIndex
CREATE UNIQUE INDEX "WatchItem_tmdbId_mediaType_key" ON "WatchItem"("tmdbId", "mediaType");

-- CreateIndex
CREATE UNIQUE INDEX "CustomCategory_name_key" ON "CustomCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- AddForeignKey
ALTER TABLE "WatchItem" ADD CONSTRAINT "WatchItem_customCategoryId_fkey" FOREIGN KEY ("customCategoryId") REFERENCES "CustomCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemTag" ADD CONSTRAINT "ItemTag_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "WatchItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemTag" ADD CONSTRAINT "ItemTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
