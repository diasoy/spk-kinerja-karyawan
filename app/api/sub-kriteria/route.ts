import { NextResponse } from 'next/server'
import { getAllSubKriteriaFlat } from '@/services/kriteria.service'

export async function GET() {
  try {
    const subKriteria = await getAllSubKriteriaFlat()
    return NextResponse.json(subKriteria)
  } catch (error) {
    console.error('Error fetching sub-kriteria:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sub-kriteria' },
      { status: 500 }
    )
  }
}
