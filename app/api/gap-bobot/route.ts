import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const gapBobot = await prisma.gapBobot.findMany({
      orderBy: {
        nilaiGap: 'desc'
      }
    })

    return NextResponse.json(gapBobot)
  } catch (error) {
    console.error('Error fetching gap bobot:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch gap bobot data' 
    }, { status: 500 })
  }
}
