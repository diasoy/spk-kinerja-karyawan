import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Hapus data lama (urutan penting karena relasi)
  await prisma.penilaianDetail.deleteMany()
  await prisma.subKriteria.deleteMany()
  await prisma.kriteria.deleteMany()
  await prisma.karyawan.deleteMany()

  // 1. Tambah Kriteria
  const kriteriaSikap = await prisma.kriteria.create({
    data: {
      kode: 'SIKAP',
      namaKriteria: 'Sikap',
    },
  })

  const kriteriaKecerdasan = await prisma.kriteria.create({
    data: {
      kode: 'KECERDASAN',
      namaKriteria: 'Kecerdasan',
    },
  })

  const kriteriaKepribadian = await prisma.kriteria.create({
    data: {
      kode: 'KEPRIBADIAN',
      namaKriteria: 'Kepribadian',
    },
  })

  // 2. Tambah Sub Kriteria sesuai tabel
  const subKriteriaData = [
    // Sikap
    { kode: 'KRT1', kriteriaId: kriteriaSikap.id, namaSubKriteria: 'Tanggung jawab', faktor: 'core factor', nilaiStandar: 3 },
    { kode: 'KRT2', kriteriaId: kriteriaSikap.id, namaSubKriteria: 'Disiplin', faktor: 'core factor', nilaiStandar: 3 },
    { kode: 'KRT3', kriteriaId: kriteriaSikap.id, namaSubKriteria: 'Jujur', faktor: 'core factor', nilaiStandar: 3 },
    { kode: 'KRT4', kriteriaId: kriteriaSikap.id, namaSubKriteria: 'Komunikatif', faktor: 'secondary factor', nilaiStandar: 3 },
    // Kecerdasan
    { kode: 'KRT5', kriteriaId: kriteriaKecerdasan.id, namaSubKriteria: 'Logika', faktor: 'core factor', nilaiStandar: 3 },
    { kode: 'KRT6', kriteriaId: kriteriaKecerdasan.id, namaSubKriteria: 'Inisiatif', faktor: 'core factor', nilaiStandar: 3 },
    { kode: 'KRT7', kriteriaId: kriteriaKecerdasan.id, namaSubKriteria: 'Kreativitas', faktor: 'secondary factor', nilaiStandar: 3 },
    { kode: 'KRT8', kriteriaId: kriteriaKecerdasan.id, namaSubKriteria: 'Ide', faktor: 'secondary factor', nilaiStandar: 3 },
    // Kepribadian
    { kode: 'KRT9', kriteriaId: kriteriaKepribadian.id, namaSubKriteria: 'Kepatuhan', faktor: 'core factor', nilaiStandar: 3 },
    { kode: 'KRT10', kriteriaId: kriteriaKepribadian.id, namaSubKriteria: 'Perilaku', faktor: 'core factor', nilaiStandar: 3 },
    { kode: 'KRT11', kriteriaId: kriteriaKepribadian.id, namaSubKriteria: 'Penampilan', faktor: 'secondary factor', nilaiStandar: 3 },
  ]

  await prisma.subKriteria.createMany({
    data: subKriteriaData,
  })

  // 3. Tambah data karyawan
  const karyawan = await prisma.karyawan.createMany({
    data: [
      {
        nip: 'K001',
        nama: 'Budi Santoso',
        jabatan: 'Manager',
        departemen: 'IT',
        nilaiKinerja: 92.5,
        kehadiran: 95.0,
        produktivitas: 90.0,
        kualitasKerja: 93.0,
      },
      {
        nip: 'K002',
        nama: 'Siti Nurhaliza',
        jabatan: 'Senior Developer',
        departemen: 'IT',
        nilaiKinerja: 88.0,
        kehadiran: 92.0,
        produktivitas: 87.0,
        kualitasKerja: 89.0,
      },
      {
        nip: 'K003',
        nama: 'Ahmad Fauzi',
        jabatan: 'Junior Developer',
        departemen: 'IT',
        nilaiKinerja: 78.5,
        kehadiran: 88.0,
        produktivitas: 75.0,
        kualitasKerja: 80.0,
      },
      {
        nip: 'K004',
        nama: 'Dewi Lestari',
        jabatan: 'HR Manager',
        departemen: 'HRD',
        nilaiKinerja: 85.0,
        kehadiran: 96.0,
        produktivitas: 82.0,
        kualitasKerja: 87.0,
      },
      {
        nip: 'K005',
        nama: 'Rizki Pratama',
        jabatan: 'Marketing Staff',
        departemen: 'Marketing',
        nilaiKinerja: 82.0,
        kehadiran: 90.0,
        produktivitas: 80.0,
        kualitasKerja: 84.0,
      },
      {
        nip: 'K006',
        nama: 'Maya Anggraini',
        jabatan: 'Finance Manager',
        departemen: 'Finance',
        nilaiKinerja: 90.0,
        kehadiran: 94.0,
        produktivitas: 88.0,
        kualitasKerja: 92.0,
      },
      {
        nip: 'K007',
        nama: 'Hendra Wijaya',
        jabatan: 'Sales Manager',
        departemen: 'Sales',
        nilaiKinerja: 86.5,
        kehadiran: 91.0,
        produktivitas: 85.0,
        kualitasKerja: 88.0,
      },
    ],
  })

  console.log(`✅ Seeded ${karyawan.count} karyawan`)
  console.log(`✅ Seeded 3 kriteria`)
  console.log(`✅ Seeded ${subKriteriaData.length} sub kriteria`)
}


main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
