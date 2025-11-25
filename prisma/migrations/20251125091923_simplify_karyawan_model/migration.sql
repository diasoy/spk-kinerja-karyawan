/*
  Warnings:

  - You are about to drop the column `departemen` on the `karyawan` table. All the data in the column will be lost.
  - You are about to drop the column `jabatan` on the `karyawan` table. All the data in the column will be lost.
  - You are about to drop the column `nama` on the `karyawan` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "karyawan" DROP COLUMN "departemen",
DROP COLUMN "jabatan",
DROP COLUMN "nama",
ALTER COLUMN "nilaiKinerja" SET DEFAULT 0;
