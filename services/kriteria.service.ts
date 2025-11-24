import { prisma } from '@/lib/prisma'
import { Kriteria, SubKriteria } from '@/types/kriteria'

/**
 * Mengambil semua kriteria beserta sub kriteria
 */
export async function getAllKriteria(): Promise<Kriteria[]> {
  try {
    const kriteria = await prisma.kriteria.findMany({
      include: {
        subKriteria: {
          orderBy: {
            kode: 'asc'
          }
        }
      },
      orderBy: {
        kode: 'asc'
      }
    })
    return kriteria
  } catch (error) {
    console.error('Error fetching kriteria:', error)
    return []
  }
}

/**
 * Mengambil kriteria berdasarkan ID
 */
export async function getKriteriaById(id: string): Promise<Kriteria | null> {
  try {
    const kriteria = await prisma.kriteria.findUnique({
      where: { id },
      include: {
        subKriteria: {
          orderBy: {
            kode: 'asc'
          }
        }
      }
    })
    return kriteria
  } catch (error) {
    console.error('Error fetching kriteria by id:', error)
    return null
  }
}

/**
 * Mengambil semua sub kriteria
 */
export async function getAllSubKriteria(): Promise<SubKriteria[]> {
  try {
    const subKriteria = await prisma.subKriteria.findMany({
      orderBy: {
        kode: 'asc'
      }
    })
    return subKriteria
  } catch (error) {
    console.error('Error fetching sub kriteria:', error)
    return []
  }
}

/**
 * Mengambil sub kriteria berdasarkan ID
 */
export async function getSubKriteriaById(id: string) {
  try {
    const subKriteria = await prisma.subKriteria.findUnique({
      where: { id },
      include: {
        kriteria: true
      }
    })
    return subKriteria
  } catch (error) {
    console.error('Error fetching sub kriteria by id:', error)
    return null
  }
}

/**
 * Mengambil semua sub kriteria dalam bentuk flat array dengan nama kriteria
 */
export async function getAllSubKriteriaFlat() {
  try {
    const kriteriaList = await getAllKriteria()
    
    const allSubKriteria: (SubKriteria & { namaKriteria: string })[] = []
    kriteriaList.forEach(k => {
      k.subKriteria.forEach(sk => {
        allSubKriteria.push({
          ...sk,
          namaKriteria: k.namaKriteria
        })
      })
    })
    
    return allSubKriteria
  } catch (error) {
    console.error('Error fetching flat sub kriteria:', error)
    return []
  }
}

/**
 * Menghitung statistik kriteria
 */
export async function getKriteriaStats() {
  try {
    const kriteria = await getAllKriteria()
    const allSubKriteria = await getAllSubKriteriaFlat()
    
    const coreFactors = allSubKriteria.filter(sk => sk.faktor === 'core factor').length
    const secondaryFactors = allSubKriteria.filter(sk => sk.faktor === 'secondary factor').length
    
    return {
      totalKriteria: kriteria.length,
      totalSubKriteria: allSubKriteria.length,
      coreFactors,
      secondaryFactors
    }
  } catch (error) {
    console.error('Error calculating kriteria stats:', error)
    return {
      totalKriteria: 0,
      totalSubKriteria: 0,
      coreFactors: 0,
      secondaryFactors: 0
    }
  }
}

