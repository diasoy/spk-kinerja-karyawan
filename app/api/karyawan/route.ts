import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const karyawan = await prisma.karyawan.findMany({
      include: {
        jabatan: {
          include: {
            departemen: true
          }
        }
      },
      orderBy: {
        kode: 'asc'
      }
    })
    
    return NextResponse.json(karyawan)
  } catch (error) {
    console.error('Error fetching karyawan:', error)
    return NextResponse.json({ error: 'Failed to fetch karyawan' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Helper function to parse date
    const parseDate = (dateString: string | null | undefined) => {
      if (!dateString) return null
      try {
        const date = new Date(dateString)
        return isNaN(date.getTime()) ? null : date
      } catch {
        return null
      }
    }

    // Helper to handle empty string as null
    const toNullIfEmpty = (value: string | null | undefined): string | null => {
      if (value === "" || value === undefined || value === null) return null
      return value
    }
    
    const karyawan = await prisma.karyawan.create({
      data: {
        kode: body.kode,
        nama: toNullIfEmpty(body.nama),
        jenisKelamin: toNullIfEmpty(body.jenisKelamin) as "L" | "P" | null,
        tanggalLahir: parseDate(body.tanggalLahir),
        jabatanId: body.jabatanId ? parseInt(body.jabatanId) : null,
        status: toNullIfEmpty(body.status) as "TETAP" | "KONTRAK" | "MAGANG" | "PROBATION" | null,
        tanggalMasuk: parseDate(body.tanggalMasuk),
        tanggalKeluar: parseDate(body.tanggalKeluar),
        isAktif: body.isAktif ?? true,
        noHp: toNullIfEmpty(body.noHp),
        email: toNullIfEmpty(body.email),
        alamat: toNullIfEmpty(body.alamat),
        pendidikanTerakhir: toNullIfEmpty(body.pendidikanTerakhir),
        catatan: toNullIfEmpty(body.catatan),
      },
      include: {
        jabatan: {
          include: {
            departemen: true
          }
        }
      }
    })
    
    return NextResponse.json(karyawan, { status: 201 })
  } catch (error) {
    console.error('Error creating karyawan:', error)
    return NextResponse.json({ error: 'Failed to create karyawan', details: error }, { status: 500 })
  }
}
