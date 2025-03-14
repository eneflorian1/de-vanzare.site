-- AlterTable
ALTER TABLE `listing` MODIFY `currency` ENUM('EUR', 'RON', 'USD', 'GBP') NOT NULL DEFAULT 'RON';

-- AlterTable
ALTER TABLE `payment` MODIFY `currency` ENUM('EUR', 'RON', 'USD', 'GBP') NOT NULL DEFAULT 'RON';

-- AlterTable
ALTER TABLE `usersettings` MODIFY `currencyPreference` ENUM('EUR', 'RON', 'USD', 'GBP') NOT NULL DEFAULT 'RON';
