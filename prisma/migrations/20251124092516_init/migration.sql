-- CreateTable
CREATE TABLE "karyawan" (
    "id" TEXT NOT NULL,
    "nip" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "jabatan" TEXT NOT NULL,
    "departemen" TEXT NOT NULL,
    "nilaiKinerja" DOUBLE PRECISION NOT NULL,
    "kehadiran" DOUBLE PRECISION NOT NULL,
    "produktivitas" DOUBLE PRECISION NOT NULL,
    "kualitasKerja" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "karyawan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "karyawan_nip_key" ON "karyawan"("nip");
