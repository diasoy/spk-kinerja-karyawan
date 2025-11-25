import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const kriteria = await prisma.kriteria.findMany({
      include: {
        subkriteria: {
          orderBy: {
            kode: 'asc'
          }
        }
      },
      orderBy: {
        urutan: 'asc'
      }
    })
    
    return NextResponse.json(kriteria)
  } catch (error) {
    console.error('Error fetching kriteria:', error)
    return NextResponse.json({ error: 'Failed to fetch kriteria' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const kriteria = await prisma.kriteria.create({
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
    
    return NextResponse.json(kriteria, { status: 201 })
  } catch (error) {
    console.error('Error creating kriteria:', error)
    return NextResponse.json({ error: 'Failed to create kriteria' }, { status: 500 })
  }
}
