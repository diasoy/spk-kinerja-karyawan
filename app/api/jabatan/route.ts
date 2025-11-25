import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const jabatan = await prisma.jabatan.findMany({
      include: {
        departemen: true
      },
      orderBy: {
        nama: 'asc'
      }
    })
    
    return NextResponse.json(jabatan)
  } catch (error) {
    console.error('Error fetching jabatan:', error)
    return NextResponse.json({ error: 'Failed to fetch jabatan' }, { status: 500 })
  }
}
