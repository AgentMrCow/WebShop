/*
  Warnings:

  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
-- Copy existing data to the new table, `updatedAt` will use the temporary default value
INSERT INTO "new_User" ("id", "email", "password", "isAdmin", "createdAt")
SELECT "id", "email", "password", "isAdmin", "createdAt" FROM "User";

-- Drop the old table
DROP TABLE "User";

-- Rename the new table to the original table name
ALTER TABLE "new_User" RENAME TO "User";

-- Remove the temporary default value from `updatedAt`
UPDATE "User" SET "updatedAt" = CURRENT_TIMESTAMP;

-- Recreate indexes and constraints
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;