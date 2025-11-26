import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const hasil = await prisma.hasilProfile.findMany({
      include: {
        penilaian: {
          include: {
            karyawan: true
          }
        },
        kriteria: true
      },
      orderBy: {
        penilaianId: 'asc'
      }
    })

    return NextResponse.json(hasil)
  } catch (error) {
    console.error('Error fetching hasil profile:', error)
    return NextResponse.json({ error: 'Failed to fetch hasil profile' }, { status: 500 })
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

      // Upsert hasil profile
      await prisma.hasilProfile.upsert({
        where: {
          penilaianId_kriteriaId: {
            penilaianId: penilaian.id,
            kriteriaId: item.kriteriaId
          }
        },
        update: {
          ncf: item.ncf,
          nsf: item.nsf,
          nilaiKriteria: item.nilaiKriteria
        },
        create: {
          penilaianId: penilaian.id,
          kriteriaId: item.kriteriaId,
          ncf: item.ncf,
          nsf: item.nsf,
          nilaiKriteria: item.nilaiKriteria
        }
      })
    }

    return NextResponse.json({ message: 'Hasil profile saved successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error saving hasil profile:', error)
    return NextResponse.json({ error: 'Failed to save hasil profile' }, { status: 500 })
  }
}
