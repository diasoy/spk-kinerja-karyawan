import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const karyawan = await prisma.karyawan.findUnique({
      where: { id: parseInt(id) },
      include: {
        jabatan: {
          include: {
            departemen: true
          }
        }
      }
    })
    
    if (!karyawan) {
      return NextResponse.json({ error: 'Karyawan not found' }, { status: 404 })
    }
    
    return NextResponse.json(karyawan)
  } catch (error) {
    console.error('Error fetching karyawan:', error)
    return NextResponse.json({ error: 'Failed to fetch karyawan' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    console.log('Received body:', JSON.stringify(body, null, 2))
    console.log('Karyawan ID:', id)
    
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

    const updateData = {
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
    }

    console.log('Update data:', JSON.stringify(updateData, null, 2))
    
    const karyawan = await prisma.karyawan.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        jabatan: {
          include: {
            departemen: true
          }
        }
      }
    })
    
    return NextResponse.json(karyawan)
  } catch (error: unknown) {
    const err = error as { name?: string; message?: string; stack?: string; clientVersion?: string }
    console.error('Error updating karyawan:', error)
    console.error('Error message:', err?.message)
    console.error('Error stack:', err?.stack)
    return NextResponse.json({ 
      error: 'Failed to update karyawan', 
      details: {
        name: err?.name,
        message: err?.message,
        clientVersion: err?.clientVersion
      }
    }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.karyawan.delete({
      where: { id: parseInt(id) }
    })
    
    return NextResponse.json({ message: 'Karyawan deleted successfully' })
  } catch (error) {
    console.error('Error deleting karyawan:', error)
    return NextResponse.json({ error: 'Failed to delete karyawan' }, { status: 500 })
  }
}
