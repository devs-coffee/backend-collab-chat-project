-- AlterTable
ALTER TABLE "UserChannel" ADD COLUMN     "lastRead" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
