import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const subkriteria = await prisma.subkriteria.findMany({
      include: {
        kriteria: true
      },
      orderBy: [
        { kriteriaId: 'asc' },
        { kode: 'asc' }
      ]
    })
    
    return NextResponse.json(subkriteria)
  } catch (error) {
    console.error('Error fetching subkriteria:', error)
    return NextResponse.json({ error: 'Failed to fetch subkriteria' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validasi input
    if (!body.kriteriaId || !body.kode || !body.nama) {
      return NextResponse.json({ 
        error: 'Field kriteriaId, kode, dan nama wajib diisi' 
      }, { status: 400 })
    }

    const subkriteria = await prisma.subkriteria.create({
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
    
    return NextResponse.json(subkriteria, { status: 201 })
  } catch (error: unknown) {
    const err = error as { code?: string; meta?: { cause?: string } }
    console.error('Error creating subkriteria:', error)
    
    // Handle unique constraint violation
    if (err.code === 'P2002') {
      return NextResponse.json({ 
        error: 'Kode subkriteria sudah digunakan untuk kriteria ini',
        details: 'Gunakan kode yang berbeda'
      }, { status: 400 })
    }
    
    // Handle foreign key constraint
    if (err.code === 'P2003') {
      return NextResponse.json({ 
        error: 'Kriteria tidak ditemukan',
        details: 'Pilih kriteria yang valid'
      }, { status: 400 })
    }
    
    return NextResponse.json({ 
      error: 'Gagal membuat subkriteria',
      details: err.code || 'Unknown error'
    }, { status: 500 })
  }
}
