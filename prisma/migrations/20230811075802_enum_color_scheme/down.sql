-- AlterTable
ALTER TABLE "UserPrefs" DROP COLUMN "colorScheme",
ADD COLUMN     "colorScheme" TEXT NOT NULL;

-- Delete enum
DROP TYPE IF EXISTS "ColorScheme";