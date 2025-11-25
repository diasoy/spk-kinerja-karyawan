// prisma/seed.ts
import "dotenv/config";
import {
  PrismaClient,
  JenisKelamin,
  StatusKaryawan,
  FaktorType,
} from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({
  adapter,
  log: ['query', 'info', 'warn', 'error'],
});

async function main() {
  console.log('🚀 Start seeding...');

  // Bersihkan dulu kalau mau seed ulang (opsional)
  // urutan dibalik supaya tidak konflik FK
  await prisma.hasilAkhir.deleteMany();
  await prisma.hasilProfile.deleteMany();
  await prisma.penilaianDetail.deleteMany();
  await prisma.penilaian.deleteMany();
  await prisma.profileTarget.deleteMany();
  await prisma.kriteriaProfileSetting.deleteMany();
  await prisma.gapBobot.deleteMany();
  await prisma.subkriteria.deleteMany();
  await prisma.kriteria.deleteMany();
  await prisma.periodePenilaian.deleteMany();
  await prisma.karyawan.deleteMany();
  await prisma.jabatan.deleteMany();
  await prisma.departemen.deleteMany();

  // ================
  // Departemen & Jabatan
  // ================
  await prisma.departemen.create({ data: { nama: 'HRD' } });
  const depOps = await prisma.departemen.create({ data: { nama: 'Operasional' } });

  const jabatanStaff = await prisma.jabatan.create({
    data: { nama: 'Staff', departemenId: depOps.id },
  });

  const jabatanSpv = await prisma.jabatan.create({
    data: { nama: 'Supervisor', departemenId: depOps.id },
  });

  // ================
  // Periode Penilaian
  // ================
  const periode2025 = await prisma.periodePenilaian.create({
    data: {
      nama: 'Penilaian Kinerja 2025',
      tanggalMulai: new Date('2025-01-01'),
      tanggalSelesai: new Date('2025-12-31'),
    },
  });

  // ================
  // Kriteria & Subkriteria
  // ================
  // 3 Kriteria Utama: Sikap, Kecerdasan, Kepribadian
  const kriteriaSikap = await prisma.kriteria.create({
    data: {
      kode: 'KRT1',
      nama: 'Sikap',
      urutan: 1,
    },
  });

  const kriteriaKecerdasan = await prisma.kriteria.create({
    data: {
      kode: 'KRT2',
      nama: 'Kecerdasan',
      urutan: 2,
    },
  });

  const kriteriaKepribadian = await prisma.kriteria.create({
    data: {
      kode: 'KRT3',
      nama: 'Kepribadian',
      urutan: 3,
    },
  });

  // Subkriteria untuk Sikap (KRT1, KRT2, KRT3)
  const subSikap = await Promise.all([
    prisma.subkriteria.create({
      data: {
        kriteriaId: kriteriaSikap.id,
        kode: 'KRT1',
        nama: 'Tanggung jawab',
        skalaMin: 1,
        skalaMax: 5,
        urutan: 1,
      },
    }),
    prisma.subkriteria.create({
      data: {
        kriteriaId: kriteriaSikap.id,
        kode: 'KRT2',
        nama: 'Disiplin',
        skalaMin: 1,
        skalaMax: 5,
        urutan: 2,
      },
    }),
    prisma.subkriteria.create({
      data: {
        kriteriaId: kriteriaSikap.id,
        kode: 'KRT3',
        nama: 'Jujur',
        skalaMin: 1,
        skalaMax: 5,
        urutan: 3,
      },
    }),
  ]);

  // Subkriteria untuk Kecerdasan (KRT4, KRT5, KRT6, KRT7, KRT8)
  const subKecerdasan = await Promise.all([
    prisma.subkriteria.create({
      data: {
        kriteriaId: kriteriaKecerdasan.id,
        kode: 'KRT4',
        nama: 'Komunikatif',
        skalaMin: 1,
        skalaMax: 5,
        urutan: 1,
      },
    }),
    prisma.subkriteria.create({
      data: {
        kriteriaId: kriteriaKecerdasan.id,
        kode: 'KRT5',
        nama: 'Logika',
        skalaMin: 1,
        skalaMax: 5,
        urutan: 2,
      },
    }),
    prisma.subkriteria.create({
      data: {
        kriteriaId: kriteriaKecerdasan.id,
        kode: 'KRT6',
        nama: 'Inisiatif',
        skalaMin: 1,
        skalaMax: 5,
        urutan: 3,
      },
    }),
    prisma.subkriteria.create({
      data: {
        kriteriaId: kriteriaKecerdasan.id,
        kode: 'KRT7',
        nama: 'Kreativitas',
        skalaMin: 1,
        skalaMax: 5,
        urutan: 4,
      },
    }),
    prisma.subkriteria.create({
      data: {
        kriteriaId: kriteriaKecerdasan.id,
        kode: 'KRT8',
        nama: 'Ide',
        skalaMin: 1,
        skalaMax: 5,
        urutan: 5,
      },
    }),
  ]);

  // Subkriteria untuk Kepribadian (KRT9, KRT10, KRT11)
  const subKepribadian = await Promise.all([
    prisma.subkriteria.create({
      data: {
        kriteriaId: kriteriaKepribadian.id,
        kode: 'KRT9',
        nama: 'Kepatuhan',
        skalaMin: 1,
        skalaMax: 5,
        urutan: 1,
      },
    }),
    prisma.subkriteria.create({
      data: {
        kriteriaId: kriteriaKepribadian.id,
        kode: 'KRT10',
        nama: 'Perilaku',
        skalaMin: 1,
        skalaMax: 5,
        urutan: 2,
      },
    }),
    prisma.subkriteria.create({
      data: {
        kriteriaId: kriteriaKepribadian.id,
        kode: 'KRT11',
        nama: 'penampilan',
        skalaMin: 1,
        skalaMax: 5,
        urutan: 3,
      },
    }),
  ]);

  // Gabungkan semua subkriteria
  const subkriteria = [...subSikap, ...subKecerdasan, ...subKepribadian];
  const kriteria = [kriteriaSikap, kriteriaKecerdasan, kriteriaKepribadian];

  // ================
  // Mapping GAP → Bobot (Profile Matching)
  // ================
  const gapData = [
    { nilaiGap: 0, bobot: 5.0, deskripsi: 'Sesuai profil' },
    { nilaiGap: 1, bobot: 4.5, deskripsi: '1 tingkat di atas profil' },
    { nilaiGap: -1, bobot: 4.0, deskripsi: '1 tingkat di bawah profil' },
    { nilaiGap: 2, bobot: 3.5, deskripsi: '2 tingkat di atas profil' },
    { nilaiGap: -2, bobot: 3.0, deskripsi: '2 tingkat di bawah profil' },
    { nilaiGap: 3, bobot: 2.5, deskripsi: '3 tingkat di atas profil' },
    { nilaiGap: -3, bobot: 2.0, deskripsi: '3 tingkat di bawah profil' },
  ];

  await prisma.gapBobot.createMany({
    data: gapData,
    skipDuplicates: true, // aman di PostgreSQL
  });

  // ================
  // Profile Target (nilai ideal per subkriteria)
  // Berdasarkan gambar: core factor dan secondary factor
  // Core: KRT1, KRT2, KRT3, KRT5, KRT6, KRT9, KRT10
  // Secondary: KRT4, KRT7, KRT8, KRT11
  // ================
  const profileTargetData = [
    // Sikap - semua core factor
    { kode: 'KRT1', nilaiIdeal: 3, faktor: FaktorType.CORE },
    { kode: 'KRT2', nilaiIdeal: 3, faktor: FaktorType.CORE },
    { kode: 'KRT3', nilaiIdeal: 3, faktor: FaktorType.CORE },
    
    // Kecerdasan - mixed
    { kode: 'KRT4', nilaiIdeal: 3, faktor: FaktorType.SECONDARY },
    { kode: 'KRT5', nilaiIdeal: 3, faktor: FaktorType.CORE },
    { kode: 'KRT6', nilaiIdeal: 3, faktor: FaktorType.CORE },
    { kode: 'KRT7', nilaiIdeal: 3, faktor: FaktorType.SECONDARY },
    { kode: 'KRT8', nilaiIdeal: 3, faktor: FaktorType.SECONDARY },
    
    // Kepribadian - mixed
    { kode: 'KRT9', nilaiIdeal: 3, faktor: FaktorType.CORE },
    { kode: 'KRT10', nilaiIdeal: 3, faktor: FaktorType.CORE },
    { kode: 'KRT11', nilaiIdeal: 3, faktor: FaktorType.SECONDARY },
  ];

  await Promise.all(
    profileTargetData.map((pt) => {
      const sub = subkriteria.find((s) => s.kode === pt.kode);
      if (!sub) return Promise.resolve();
      
      return prisma.profileTarget.create({
        data: {
          periodeId: periode2025.id,
          subkriteriaId: sub.id,
          nilaiIdeal: pt.nilaiIdeal,
          faktor: pt.faktor,
          bobotFaktor: 1,
        },
      });
    }),
  );

  // ================
  // Setting persentase Core / Secondary per kriteria
  // ================
  await Promise.all(
    kriteria.map((k) =>
      prisma.kriteriaProfileSetting.create({
        data: {
          periodeId: periode2025.id,
          kriteriaId: k.id,
          persenCore: 0.6,
          persenSecondary: 0.4,
        },
      }),
    ),
  );

  // ================
  // Contoh 5 karyawan (kode A01–A05)
  // ================
  const karyawanData = [
    {
      kode: 'A01',
      nama: 'Karyawan 01',
      jenisKelamin: JenisKelamin.L,
      jabatanId: jabatanStaff.id,
    },
    {
      kode: 'A02',
      nama: 'Karyawan 02',
      jenisKelamin: JenisKelamin.P,
      jabatanId: jabatanStaff.id,
    },
    {
      kode: 'A03',
      nama: 'Karyawan 03',
      jenisKelamin: JenisKelamin.L,
      jabatanId: jabatanStaff.id,
    },
    {
      kode: 'A04',
      nama: 'Karyawan 04',
      jenisKelamin: JenisKelamin.P,
      jabatanId: jabatanSpv.id,
    },
    {
      kode: 'A05',
      nama: 'Karyawan 05',
      jenisKelamin: JenisKelamin.L,
      jabatanId: jabatanSpv.id,
    },
  ];

  await Promise.all(
    karyawanData.map((k) =>
      prisma.karyawan.create({
        data: {
          kode: k.kode,
          nama: k.nama,
          jenisKelamin: k.jenisKelamin,
          status: StatusKaryawan.TETAP,
          jabatanId: k.jabatanId,
          tanggalMasuk: new Date('2023-01-01'),
          isAktif: true,
        },
      }),
    ),
  );

  console.log('✅ Seed selesai');
}

main()
  .catch((e) => {
    console.error('❌ Seed error', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
