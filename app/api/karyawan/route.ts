import { NextResponse } from 'next/server'
import { getAllKaryawan, createKaryawanWithPenilaian } from '@/services/karyawan.service'

export async function GET() {
  try {
    const karyawan = await getAllKaryawan()
    
    return NextResponse.json({ success: true, data: karyawan })
  } catch (error) {
    console.error('Error fetching karyawan:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch data' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const karyawan = await createKaryawanWithPenilaian(body)
    
    return NextResponse.json({ 
      success: true, 
      data: karyawan,
      message: 'Karyawan berhasil ditambahkan' 
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating karyawan:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to create karyawan' 
      },
      { status: 500 }
    )
  }
}

