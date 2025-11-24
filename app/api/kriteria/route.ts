import { NextResponse } from 'next/server'
import { getAllKriteria } from '@/services/kriteria.service'

export async function GET() {
  try {
    const kriteria = await getAllKriteria()
    
    return NextResponse.json({ success: true, data: kriteria })
  } catch (error) {
    console.error('Error fetching kriteria:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch data' },
      { status: 500 }
    )
  }
}
