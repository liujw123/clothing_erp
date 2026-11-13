/*
  Warnings:

  - You are about to drop the column `roleCode` on the `user` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `User_roleCode_idx` ON `user`;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `roleCode`,
    ADD COLUMN `deptId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `Role` (
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `permissions` JSON NOT NULL,
    `dataScope` VARCHAR(191) NOT NULL DEFAULT 'SELF',
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`code`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserRole` (
    `userId` VARCHAR(191) NOT NULL,
    `roleCode` VARCHAR(191) NOT NULL,

    INDEX `UserRole_roleCode_idx`(`roleCode`),
    PRIMARY KEY (`userId`, `roleCode`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `User_deptId_idx` ON `User`(`deptId`);

-- AddForeignKey
ALTER TABLE `UserRole` ADD CONSTRAINT `UserRole_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserRole` ADD CONSTRAINT `UserRole_roleCode_fkey` FOREIGN KEY (`roleCode`) REFERENCES `Role`(`code`) ON DELETE RESTRICT ON UPDATE CASCADE;
