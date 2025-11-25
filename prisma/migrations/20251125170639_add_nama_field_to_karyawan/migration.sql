-- AlterTable
ALTER TABLE "karyawan" ADD COLUMN "nama" TEXT NOT NULL DEFAULT '';

-- Update existing records with default value
UPDATE "karyawan" SET "nama" = 'Karyawan ' || "nip" WHERE "nama" = '';
