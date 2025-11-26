import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const hasil = await prisma.hasilAkhir.findMany({
      include: {
        penilaian: {
          include: {
            karyawan: true
          }
        }
      },
      orderBy: {
        peringkat: 'asc'
      }
    })

    return NextResponse.json(hasil)
  } catch (error) {
    console.error('Error fetching hasil akhir:', error)
    return NextResponse.json({ error: 'Failed to fetch hasil akhir' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { hasil } = body

    if (!Array.isArray(hasil)) {
      return NextResponse.json({ error: 'Invalid hasil data' }, { status: 400 })
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

    // Process each hasil entry
    for (const item of hasil) {
      // Find or create penilaian
      let penilaian = await prisma.penilaian.findUnique({
        where: {
          karyawanId_periodeId: {
            karyawanId: item.karyawanId,
            periodeId: periode.id
          }
        }
      })

      if (!penilaian) {
        penilaian = await prisma.penilaian.create({
          data: {
            karyawanId: item.karyawanId,
            periodeId: periode.id,
            tanggalPenilaian: new Date()
          }
        })
      }

      // Upsert hasil akhir
      await prisma.hasilAkhir.upsert({
        where: {
          penilaianId: penilaian.id
        },
        update: {
          skorTotal: item.skorTotal,
          peringkat: item.peringkat
        },
        create: {
          penilaianId: penilaian.id,
          skorTotal: item.skorTotal,
          peringkat: item.peringkat
        }
      })
    }

    return NextResponse.json({ message: 'Hasil akhir saved successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error saving hasil akhir:', error)
    return NextResponse.json({ error: 'Failed to save hasil akhir' }, { status: 500 })
  }
}
