-- CreateTable
CREATE TABLE "kriteria" (
    "id" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "namaKriteria" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kriteria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sub_kriteria" (
    "id" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "kriteriaId" TEXT NOT NULL,
    "namaSubKriteria" TEXT NOT NULL,
    "faktor" TEXT NOT NULL,
    "nilaiStandar" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sub_kriteria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "penilaian_detail" (
    "id" TEXT NOT NULL,
    "karyawanId" TEXT NOT NULL,
    "subKriteriaId" TEXT NOT NULL,
    "nilai" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "penilaian_detail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "kriteria_kode_key" ON "kriteria"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "sub_kriteria_kode_key" ON "sub_kriteria"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "penilaian_detail_karyawanId_subKriteriaId_key" ON "penilaian_detail"("karyawanId", "subKriteriaId");

-- AddForeignKey
ALTER TABLE "sub_kriteria" ADD CONSTRAINT "sub_kriteria_kriteriaId_fkey" FOREIGN KEY ("kriteriaId") REFERENCES "kriteria"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "penilaian_detail" ADD CONSTRAINT "penilaian_detail_karyawanId_fkey" FOREIGN KEY ("karyawanId") REFERENCES "karyawan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "penilaian_detail" ADD CONSTRAINT "penilaian_detail_subKriteriaId_fkey" FOREIGN KEY ("subKriteriaId") REFERENCES "sub_kriteria"("id") ON DELETE CASCADE ON UPDATE CASCADE;
