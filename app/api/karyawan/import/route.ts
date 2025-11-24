import { NextResponse } from 'next/server'
import { importKaryawanBatch } from '@/services/karyawan.service'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { data } = body
    
    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Data harus berupa array dan tidak boleh kosong' },
        { status: 400 }
      )
    }

    const results = await importKaryawanBatch(data)
    
    return NextResponse.json({ 
      success: true, 
      data: results,
      message: `Berhasil import ${results.success} karyawan, ${results.failed} gagal` 
    })
  } catch (error: any) {
    console.error('Error importing karyawan:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to import karyawan' 
      },
      { status: 500 }
    )
  }
}
