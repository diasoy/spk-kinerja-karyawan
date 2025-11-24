/*
  Warnings:

  - You are about to drop the column `kualitasKerja` on the `karyawan` table. All the data in the column will be lost.
  - You are about to drop the column `produktivitas` on the `karyawan` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "karyawan" DROP COLUMN "kualitasKerja",
DROP COLUMN "produktivitas",
ALTER COLUMN "kehadiran" SET DEFAULT 100;
