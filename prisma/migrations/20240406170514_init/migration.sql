-- CreateTable
CREATE TABLE "Order" (
    "uuid" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "digest" TEXT NOT NULL,
    "salt" TEXT NOT NULL,
    "orderDetails" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Order_username_fkey" FOREIGN KEY ("username") REFERENCES "User" ("email") ON DELETE RESTRICT ON UPDATE CASCADE
);
