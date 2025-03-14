-- AlterTable
ALTER TABLE `message` ADD COLUMN `deletedForReceiver` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `deletedForSender` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `address` VARCHAR(191) NULL,
    ADD COLUMN `city` VARCHAR(191) NULL,
    ADD COLUMN `notifyEmail` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `notifyPhone` BOOLEAN NOT NULL DEFAULT false;
