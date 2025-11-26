import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Get or create default periode
    let periode = await prisma.periodePenilaian.findFirst({
      orderBy: { id: 'desc' }
    })

    if (!periode) {
      periode = await prisma.periodePenilaian.create({
        data: {
          nama: 'Periode Default',
          tanggalMulai: new Date(),
        }
      })
    }

    const matrix = await prisma.ahpMatrixKriteria.findMany({
      where: {
        periodeId: periode.id
      },
      include: {
        kriteriaA: true,
        kriteriaB: true
      }
    })

    return NextResponse.json(matrix)
  } catch (error) {
    console.error('Error fetching matrix:', error)
    return NextResponse.json({ error: 'Failed to fetch matrix' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { matrix } = body

    if (!Array.isArray(matrix)) {
      return NextResponse.json({ error: 'Invalid matrix data' }, { status: 400 })
    }

    // Get or create default periode
    let periode = await prisma.periodePenilaian.findFirst({
      orderBy: { id: 'desc' }
    })

    if (!periode) {
      periode = await prisma.periodePenilaian.create({
        data: {
          nama: 'Periode Default',
          tanggalMulai: new Date(),
        }
      })
    }

    // Delete existing matrix for this periode
    await prisma.ahpMatrixKriteria.deleteMany({
      where: {
        periodeId: periode.id
      }
    })

    // Insert new matrix values
    const matrixData = matrix.map((item: { kriteriaAId: number; kriteriaBId: number; nilai: number }) => ({
      periodeId: periode.id,
      kriteriaAId: item.kriteriaAId,
      kriteriaBId: item.kriteriaBId,
      nilai: item.nilai
    }))

    await prisma.ahpMatrixKriteria.createMany({
      data: matrixData
    })

    return NextResponse.json({ message: 'Matrix saved successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error saving matrix:', error)
    return NextResponse.json({ error: 'Failed to save matrix' }, { status: 500 })
  }
}
