-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Market` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `cnpj` VARCHAR(191) NOT NULL,
    `latitude` DOUBLE NOT NULL,
    `longitude` DOUBLE NOT NULL,
    `address` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Market_cnpj_key`(`cnpj`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Collection` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `materialType` VARCHAR(191) NOT NULL,
    `weightInKg` DOUBLE NOT NULL,
    `userId` INTEGER NOT NULL,
    `marketId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Collection` ADD CONSTRAINT `Collection_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Collection` ADD CONSTRAINT `Collection_marketId_fkey` FOREIGN KEY (`marketId`) REFERENCES `Market`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
