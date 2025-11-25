import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const subkriteria = await prisma.subkriteria.findUnique({
      where: { id: parseInt(id) },
      include: {
        kriteria: true
      }
    })
    
    if (!subkriteria) {
      return NextResponse.json({ error: 'Subkriteria not found' }, { status: 404 })
    }
    
    return NextResponse.json(subkriteria)
  } catch (error) {
    console.error('Error fetching subkriteria:', error)
    return NextResponse.json({ error: 'Failed to fetch subkriteria' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    const subkriteria = await prisma.subkriteria.update({
      where: { id: parseInt(id) },
      data: {
        kriteriaId: parseInt(body.kriteriaId),
        kode: body.kode,
        nama: body.nama,
        deskripsi: body.deskripsi || null,
        faktor: body.faktor || 'CORE',
        nilaiStandar: body.nilaiStandar ? parseFloat(body.nilaiStandar) : 3,
      },
      include: {
        kriteria: true
      }
    })
    
    return NextResponse.json(subkriteria)
  } catch (error) {
    console.error('Error updating subkriteria:', error)
    return NextResponse.json({ error: 'Failed to update subkriteria' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Get subkriteria untuk validasi
    const subkriteria = await prisma.subkriteria.findUnique({
      where: { id: parseInt(id) },
      include: {
        kriteria: true
      }
    })

    if (!subkriteria) {
      return NextResponse.json({ error: 'Subkriteria tidak ditemukan' }, { status: 404 })
    }

    await prisma.subkriteria.delete({
      where: { id: parseInt(id) }
    })
    
    return NextResponse.json({ message: 'Subkriteria berhasil dihapus' })
  } catch (error: unknown) {
    const err = error as { code?: string; meta?: { cause?: string } }
    console.error('Error deleting subkriteria:', error)
    
    // Handle foreign key constraint
    if (err.code === 'P2003') {
      return NextResponse.json({ 
        error: 'Tidak dapat menghapus subkriteria karena masih digunakan di data lain',
        details: 'Subkriteria ini masih terkait dengan profile target, penilaian, atau data AHP. Hapus data terkait terlebih dahulu.'
      }, { status: 400 })
    }
    
    return NextResponse.json({ 
      error: 'Gagal menghapus subkriteria',
      details: err.code || 'Unknown error'
    }, { status: 500 })
  }
}
