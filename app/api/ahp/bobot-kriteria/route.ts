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

    const bobot = await prisma.ahpBobotKriteria.findMany({
      where: {
        periodeId: periode.id
      },
      include: {
        kriteria: true
      }
    })

    return NextResponse.json(bobot)
  } catch (error) {
    console.error('Error fetching bobot:', error)
    return NextResponse.json({ error: 'Failed to fetch bobot' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { bobot } = body

    if (!Array.isArray(bobot)) {
      return NextResponse.json({ error: 'Invalid bobot data' }, { status: 400 })
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

    // Delete existing bobot for this periode
    await prisma.ahpBobotKriteria.deleteMany({
      where: {
        periodeId: periode.id
      }
    })

    // Insert new bobot values
    const bobotData = bobot.map((item: { kriteriaId: number; bobot: number }) => ({
      periodeId: periode.id,
      kriteriaId: item.kriteriaId,
      bobot: item.bobot,
      ci: null,
      cr: null
    }))

    await prisma.ahpBobotKriteria.createMany({
      data: bobotData
    })

    return NextResponse.json({ message: 'Bobot saved successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error saving bobot:', error)
    return NextResponse.json({ error: 'Failed to save bobot' }, { status: 500 })
  }
}
