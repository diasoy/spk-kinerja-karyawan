import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { penilaianData } = body

    if (!penilaianData || !Array.isArray(penilaianData)) {
      return NextResponse.json({ 
        error: 'Data penilaian tidak valid' 
      }, { status: 400 })
    }

    // Get or create default periode
    let periode = await prisma.periodePenilaian.findFirst({
      orderBy: {
        id: 'desc'
      }
    })

    if (!periode) {
      // Create default periode if none exists
      periode = await prisma.periodePenilaian.create({
        data: {
          nama: 'Periode Default 2025',
          tanggalMulai: new Date(),
          tanggalSelesai: null
        }
      })
    }

    const periodeId = periode.id

    // Process each karyawan's penilaian
    const results = []
    
    for (const data of penilaianData) {
      const { karyawanId, ...subkriteriaValues } = data

      // Check if penilaian already exists
      let penilaian = await prisma.penilaian.findUnique({
        where: {
          karyawanId_periodeId: {
            karyawanId: karyawanId,
            periodeId: periodeId
          }
        },
        include: {
          detail: true
        }
      })

      // Create or update penilaian
      if (!penilaian) {
        penilaian = await prisma.penilaian.create({
          data: {
            karyawanId: karyawanId,
            periodeId: periodeId,
            tanggalPenilaian: new Date(),
          },
          include: {
            detail: true
          }
        })
      }

      // Process each subkriteria value
      for (const [key, value] of Object.entries(subkriteriaValues)) {
        if (!key.startsWith('sub_')) continue
        
        const subkriteriaId = parseInt(key.replace('sub_', ''))
        const nilaiAktual = parseFloat(value as string)

        if (isNaN(nilaiAktual) || nilaiAktual < 1 || nilaiAktual > 5) {
          continue
        }

        // Get subkriteria info for gap calculation
        const subkriteria = await prisma.subkriteria.findUnique({
          where: { id: subkriteriaId }
        })

        if (!subkriteria) continue

        const gap = nilaiAktual - subkriteria.nilaiStandar

        // Get bobot gap from GapBobot table
        const gapBobot = await prisma.gapBobot.findUnique({
          where: { nilaiGap: Math.round(gap) }
        })

        // Upsert penilaian detail
        await prisma.penilaianDetail.upsert({
          where: {
            penilaianId_subkriteriaId: {
              penilaianId: penilaian.id,
              subkriteriaId: subkriteriaId
            }
          },
          create: {
            penilaianId: penilaian.id,
            subkriteriaId: subkriteriaId,
            nilaiAktual: nilaiAktual,
            gap: gap,
            bobotGap: gapBobot?.bobot || null
          },
          update: {
            nilaiAktual: nilaiAktual,
            gap: gap,
            bobotGap: gapBobot?.bobot || null
          }
        })
      }

      results.push({
        karyawanId: karyawanId,
        penilaianId: penilaian.id,
        success: true
      })
    }

    return NextResponse.json({
      message: 'Data penilaian berhasil disimpan',
      results: results
    }, { status: 200 })

  } catch (error: unknown) {
    const err = error as { code?: string; message?: string }
    console.error('Error saving batch penilaian:', error)
    
    return NextResponse.json({ 
      error: 'Gagal menyimpan data penilaian',
      details: err.message || 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    const penilaian = await prisma.penilaian.findMany({
      include: {
        karyawan: true,
        periode: true,
        detail: {
          include: {
            subkriteria: {
              include: {
                kriteria: true
              }
            }
          }
        }
      },
      orderBy: {
        tanggalPenilaian: 'desc'
      }
    })

    return NextResponse.json(penilaian)
  } catch (error) {
    console.error('Error fetching penilaian:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch penilaian' 
    }, { status: 500 })
  }
}
