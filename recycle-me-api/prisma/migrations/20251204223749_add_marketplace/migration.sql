/*
  Warnings:

  - You are about to drop the column `code` on the `redemption` table. All the data in the column will be lost.
  - You are about to drop the column `rewardId` on the `redemption` table. All the data in the column will be lost.
  - You are about to drop the `reward` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `costAtTime` to the `Redemption` table without a default value. This is not possible if the table is not empty.
  - Added the required column `couponCode` to the `Redemption` table without a default value. This is not possible if the table is not empty.
  - Added the required column `offerId` to the `Redemption` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `redemption` DROP FOREIGN KEY `Redemption_rewardId_fkey`;

-- DropIndex
DROP INDEX `Redemption_rewardId_fkey` ON `redemption`;

-- AlterTable
ALTER TABLE `redemption` DROP COLUMN `code`,
    DROP COLUMN `rewardId`,
    ADD COLUMN `costAtTime` INTEGER NOT NULL,
    ADD COLUMN `couponCode` VARCHAR(191) NOT NULL,
    ADD COLUMN `offerId` INTEGER NOT NULL;

-- DropTable
DROP TABLE `reward`;

-- CreateTable
CREATE TABLE `Offer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `cost` INTEGER NOT NULL,
    `image` VARCHAR(191) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `marketId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Offer` ADD CONSTRAINT `Offer_marketId_fkey` FOREIGN KEY (`marketId`) REFERENCES `Market`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Redemption` ADD CONSTRAINT `Redemption_offerId_fkey` FOREIGN KEY (`offerId`) REFERENCES `Offer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
