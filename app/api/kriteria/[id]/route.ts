import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const kriteria = await prisma.kriteria.findUnique({
      where: { id: parseInt(id) },
      include: {
        subkriteria: true
      }
    })
    
    if (!kriteria) {
      return NextResponse.json({ error: 'Kriteria not found' }, { status: 404 })
    }
    
    return NextResponse.json(kriteria)
  } catch (error) {
    console.error('Error fetching kriteria:', error)
    return NextResponse.json({ error: 'Failed to fetch kriteria' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    const kriteria = await prisma.kriteria.update({
      where: { id: parseInt(id) },
      data: {
        kode: body.kode,
        nama: body.nama,
        deskripsi: body.deskripsi || null,
        urutan: body.urutan ? parseInt(body.urutan) : null,
      },
      include: {
        subkriteria: true
      }
    })
    
    return NextResponse.json(kriteria)
  } catch (error) {
    console.error('Error updating kriteria:', error)
    return NextResponse.json({ error: 'Failed to update kriteria' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Get kriteria dengan subkriteria untuk informasi
    const kriteria = await prisma.kriteria.findUnique({
      where: { id: parseInt(id) },
      include: {
        subkriteria: true
      }
    })

    if (!kriteria) {
      return NextResponse.json({ error: 'Kriteria tidak ditemukan' }, { status: 404 })
    }

    // Delete kriteria - subkriteria akan otomatis terhapus karena cascade
    await prisma.kriteria.delete({
      where: { id: parseInt(id) }
    })
    
    return NextResponse.json({ 
      message: 'Kriteria berhasil dihapus',
      deletedSubkriteria: kriteria.subkriteria.length
    })
  } catch (error: unknown) {
    const err = error as { code?: string; meta?: { cause?: string } }
    console.error('Error deleting kriteria:', error)
    
    // Handle foreign key constraint
    if (err.code === 'P2003') {
      return NextResponse.json({ 
        error: 'Tidak dapat menghapus kriteria karena masih digunakan di data lain',
        details: 'Hapus terlebih dahulu data yang terkait dengan kriteria ini'
      }, { status: 400 })
    }
    
    return NextResponse.json({ 
      error: 'Gagal menghapus kriteria',
      details: err.code || 'Unknown error'
    }, { status: 500 })
  }
}
