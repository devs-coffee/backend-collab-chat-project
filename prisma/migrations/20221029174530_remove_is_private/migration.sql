/*
  Warnings:

  - You are about to drop the column `isPrivate` on the `Server` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Channel" DROP CONSTRAINT "Channel_serverId_fkey";

-- AlterTable
ALTER TABLE "Channel" ALTER COLUMN "serverId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Server" DROP COLUMN "isPrivate";

-- AddForeignKey
ALTER TABLE "Channel" ADD CONSTRAINT "Channel_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server"("id") ON DELETE SET NULL ON UPDATE CASCADE;
