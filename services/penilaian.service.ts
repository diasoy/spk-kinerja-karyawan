import { prisma } from '@/lib/prisma'

export interface PenilaianDetail {
  id: string
  karyawanId: string
  subKriteriaId: string
  nilai: number
  createdAt: Date
  updatedAt: Date
}

/**
 * Mengambil semua penilaian detail untuk karyawan tertentu
 */
export async function getPenilaianByKaryawanId(karyawanId: string) {
  try {
    const penilaian = await prisma.penilaianDetail.findMany({
      where: {
        karyawanId
      },
      include: {
        subKriteria: {
          include: {
            kriteria: true
          }
        }
      },
      orderBy: {
        subKriteria: {
          kode: 'asc'
        }
      }
    })
    return penilaian
  } catch (error) {
    console.error('Error fetching penilaian by karyawan id:', error)
    return []
  }
}

/**
 * Mengambil penilaian untuk sub kriteria tertentu
 */
export async function getPenilaianBySubKriteriaId(subKriteriaId: string) {
  try {
    const penilaian = await prisma.penilaianDetail.findMany({
      where: {
        subKriteriaId
      },
      include: {
        karyawan: true
      },
      orderBy: {
        karyawan: {
          nama: 'asc'
        }
      }
    })
    return penilaian
  } catch (error) {
    console.error('Error fetching penilaian by sub kriteria id:', error)
    return []
  }
}

/**
 * Membuat atau update penilaian detail
 */
export async function upsertPenilaianDetail(
  karyawanId: string,
  subKriteriaId: string,
  nilai: number
) {
  try {
    const penilaian = await prisma.penilaianDetail.upsert({
      where: {
        karyawanId_subKriteriaId: {
          karyawanId,
          subKriteriaId
        }
      },
      update: {
        nilai
      },
      create: {
        karyawanId,
        subKriteriaId,
        nilai
      }
    })
    return penilaian
  } catch (error) {
    console.error('Error upserting penilaian detail:', error)
    return null
  }
}

/**
 * Menghapus penilaian detail
 */
export async function deletePenilaianDetail(karyawanId: string, subKriteriaId: string) {
  try {
    await prisma.penilaianDetail.delete({
      where: {
        karyawanId_subKriteriaId: {
          karyawanId,
          subKriteriaId
        }
      }
    })
    return true
  } catch (error) {
    console.error('Error deleting penilaian detail:', error)
    return false
  }
}
