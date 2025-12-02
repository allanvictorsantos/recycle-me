/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `Market` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Collection` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `Market` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `collection` DROP FOREIGN KEY `Collection_marketId_fkey`;

-- DropIndex
DROP INDEX `Collection_marketId_fkey` ON `collection`;

-- AlterTable
ALTER TABLE `collection` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `pointsEarned` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `status` ENUM('PENDING', 'COMPLETED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `weightInKg` DOUBLE NULL,
    MODIFY `marketId` INTEGER NULL;

-- AlterTable
ALTER TABLE `market` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `email` VARCHAR(191) NOT NULL,
    ADD COLUMN `isVerified` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `tradeName` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `level` INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN `points` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `xp` INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `Reward` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `cost` INTEGER NOT NULL,
    `imageUrl` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Redemption` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `rewardId` INTEGER NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Market_email_key` ON `Market`(`email`);

-- AddForeignKey
ALTER TABLE `Collection` ADD CONSTRAINT `Collection_marketId_fkey` FOREIGN KEY (`marketId`) REFERENCES `Market`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Redemption` ADD CONSTRAINT `Redemption_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Redemption` ADD CONSTRAINT `Redemption_rewardId_fkey` FOREIGN KEY (`rewardId`) REFERENCES `Reward`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
