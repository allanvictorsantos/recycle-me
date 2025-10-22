-- AlterTable
ALTER TABLE `market` ADD COLUMN `cep` VARCHAR(191) NULL,
    ADD COLUMN `numero` VARCHAR(191) NULL,
    MODIFY `latitude` DOUBLE NULL,
    MODIFY `longitude` DOUBLE NULL,
    MODIFY `address` VARCHAR(191) NULL;
