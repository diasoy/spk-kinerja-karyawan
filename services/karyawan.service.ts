import { prisma } from '@/lib/prisma'

export interface Karyawan {
  id: string
  nip: string
  nama: string
  jabatan: string
  departemen: string
  nilaiKinerja: number
  kehadiran: number
  produktivitas: number
  kualitasKerja: number
  createdAt: Date
  updatedAt: Date
}

export interface CreateKaryawanInput {
  nip: string
  nama: string
  jabatan: string
  departemen: string
  nilaiKinerja: number
  kehadiran: number
  produktivitas: number
  kualitasKerja: number
}

export interface CreateKaryawanWithPenilaianInput {
  nip: string
  nama: string
  jabatan: string
  departemen: string
  penilaian: {
    subKriteriaId: string
    nilai: number
  }[]
}

/**
 * Mengambil semua data karyawan, diurutkan berdasarkan nilai kinerja
 */
export async function getAllKaryawan(): Promise<Karyawan[]> {
  try {
    const karyawan = await prisma.karyawan.findMany({
      orderBy: {
        nilaiKinerja: 'desc'
      }
    })
    return karyawan
  } catch (error) {
    console.error('Error fetching karyawan:', error)
    return []
  }
}

/**
 * Mengambil data karyawan berdasarkan ID
 */
export async function getKaryawanById(id: string): Promise<Karyawan | null> {
  try {
    const karyawan = await prisma.karyawan.findUnique({
      where: { id }
    })
    return karyawan
  } catch (error) {
    console.error('Error fetching karyawan by id:', error)
    return null
  }
}

/**
 * Mengambil data karyawan berdasarkan NIP
 */
export async function getKaryawanByNip(nip: string): Promise<Karyawan | null> {
  try {
    const karyawan = await prisma.karyawan.findUnique({
      where: { nip }
    })
    return karyawan
  } catch (error) {
    console.error('Error fetching karyawan by nip:', error)
    return null
  }
}

/**
 * Menghitung statistik karyawan
 */
export async function getKaryawanStats() {
  try {
    const karyawan = await getAllKaryawan()
    
    if (karyawan.length === 0) {
      return {
        total: 0,
        averageKinerja: 0,
        averageKehadiran: 0,
        averageProduktivitas: 0,
        averageKualitasKerja: 0
      }
    }

    return {
      total: karyawan.length,
      averageKinerja: karyawan.reduce((acc, k) => acc + k.nilaiKinerja, 0) / karyawan.length,
      averageKehadiran: karyawan.reduce((acc, k) => acc + k.kehadiran, 0) / karyawan.length,
      averageProduktivitas: karyawan.reduce((acc, k) => acc + k.produktivitas, 0) / karyawan.length,
      averageKualitasKerja: karyawan.reduce((acc, k) => acc + k.kualitasKerja, 0) / karyawan.length
    }
  } catch (error) {
    console.error('Error calculating karyawan stats:', error)
    return {
      total: 0,
      averageKinerja: 0,
      averageKehadiran: 0,
      averageProduktivitas: 0,
      averageKualitasKerja: 0
    }
  }
}

/**
 * Membuat karyawan baru dengan penilaian per kriteria
 */
export async function createKaryawanWithPenilaian(input: CreateKaryawanWithPenilaianInput) {
  try {
    // Hitung nilai kinerja dari penilaian (rata-rata untuk sementara)
    const totalNilai = input.penilaian.reduce((sum, p) => sum + p.nilai, 0)
    const avgNilai = input.penilaian.length > 0 ? totalNilai / input.penilaian.length : 0
    const nilaiKinerja = (avgNilai / 5) * 100 // Normalisasi ke skala 100

    const karyawan = await prisma.karyawan.create({
      data: {
        nip: input.nip,
        nama: input.nama,
        jabatan: input.jabatan,
        departemen: input.departemen,
        nilaiKinerja: nilaiKinerja,
        kehadiran: 0,
        produktivitas: 0,
        kualitasKerja: 0,
        penilaianDetail: {
          create: input.penilaian.map(p => ({
            subKriteriaId: p.subKriteriaId,
            nilai: p.nilai
          }))
        }
      },
      include: {
        penilaianDetail: {
          include: {
            subKriteria: true
          }
        }
      }
    })

    return karyawan
  } catch (error) {
    console.error('Error creating karyawan with penilaian:', error)
    throw error
  }
}

/**
 * Import batch karyawan dari Excel
 */
export async function importKaryawanBatch(data: CreateKaryawanWithPenilaianInput[]) {
  try {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[]
    }

    for (const item of data) {
      try {
        await createKaryawanWithPenilaian(item)
        results.success++
      } catch (error) {
        results.failed++
        results.errors.push(`Failed to import ${item.nip} - ${item.nama}: ${error}`)
      }
    }

    return results
  } catch (error) {
    console.error('Error importing karyawan batch:', error)
    throw error
  }
}

/**
 * Delete karyawan by ID
 */
export async function deleteKaryawan(id: string) {
  try {
    await prisma.karyawan.delete({
      where: { id }
    })
    return true
  } catch (error) {
    console.error('Error deleting karyawan:', error)
    return false
  }
}

