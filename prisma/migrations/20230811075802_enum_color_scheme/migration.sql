/*
  Warnings:

  - Changed the type of `colorScheme` on the `UserPrefs` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ColorScheme" AS ENUM ('DARK', 'LIGHT');

-- AlterTable
ALTER TABLE "UserPrefs" DROP COLUMN "colorScheme",
ADD COLUMN     "colorScheme" "ColorScheme" NOT NULL;
