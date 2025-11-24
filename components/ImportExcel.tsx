'use client'

import { useState, useRef } from 'react'
import * as XLSX from 'xlsx'

interface ImportExcelProps {
  onSuccess: () => void
  onCancel: () => void
  subKriteriaList: { id: string; kode: string; namaSubKriteria: string }[]
}

interface ExcelRow {
  [key: string]: string | number
}

export default function ImportExcel({ onSuccess, onCancel, subKriteriaList }: ImportExcelProps) {
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<ExcelRow[]>([])
  const [file, setFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        const data = event.target?.result
        const workbook = XLSX.read(data, { type: 'binary' })
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(sheet) as ExcelRow[]

        setPreview(jsonData.slice(0, 5)) // Show first 5 rows as preview
      } catch (error) {
        console.error('Error reading file:', error)
        alert('Error membaca file Excel')
      }
    }

    reader.readAsBinaryString(selectedFile)
  }

  const handleImport = async () => {
    if (!file) {
      alert('Pilih file terlebih dahulu')
      return
    }

    setLoading(true)

    try {
      const reader = new FileReader()

      reader.onload = async (event) => {
        try {
          const data = event.target?.result
          const workbook = XLSX.read(data, { type: 'binary' })
          const sheetName = workbook.SheetNames[0]
          const sheet = workbook.Sheets[sheetName]
          const jsonData = XLSX.utils.sheet_to_json(sheet) as ExcelRow[]

          // Transform data sesuai format yang dibutuhkan
          const transformedData = jsonData.map((row: ExcelRow) => {
            const penilaian = subKriteriaList.map(sk => {
              const kolom = sk.kode.replace('KRT', 'KRT')
              const nilaiRaw = row[kolom] || row[sk.kode] || 3
              const nilai = typeof nilaiRaw === 'number' ? nilaiRaw : parseInt(String(nilaiRaw))
              return {
                subKriteriaId: sk.id,
                nilai: isNaN(nilai) ? 3 : Math.min(Math.max(nilai, 1), 5)
              }
            })

            return {
              nip: row.Alternatif || row.NIP || '',
              nama: row.Nama || row.alternatif || row.Alternatif || '',
              jabatan: row.Jabatan || 'Staff',
              departemen: row.Departemen || row.Department || 'Umum',
              penilaian
            }
          })

          // Send to API
          const response = await fetch('/api/karyawan/import', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: transformedData }),
          })

          const result = await response.json()

          if (result.success) {
            alert(result.message || 'Data berhasil diimport!')
            onSuccess()
          } else {
            alert(`Error: ${result.error}`)
          }
        } catch (error) {
          console.error('Error:', error)
          alert('Terjadi kesalahan saat import data')
        } finally {
          setLoading(false)
        }
      }

      reader.readAsBinaryString(file)
    } catch (error) {
      console.error('Error:', error)
      alert('Terjadi kesalahan')
      setLoading(false)
    }
  }

  const downloadTemplate = () => {
    // Create template Excel
    const templateData = [
      {
        Alternatif: 'A01',
        Nama: 'Contoh Karyawan',
        Jabatan: 'Staff IT',
        Departemen: 'IT',
        ...Object.fromEntries(subKriteriaList.map(sk => [sk.kode, 3]))
      }
    ]

    const ws = XLSX.utils.json_to_sheet(templateData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Data Karyawan')
    
    // Set column widths
    const cols = [
      { wch: 12 }, // Alternatif
      { wch: 20 }, // Nama
      { wch: 15 }, // Jabatan
      { wch: 15 }, // Departemen
      ...subKriteriaList.map(() => ({ wch: 10 }))
    ]
    ws['!cols'] = cols

    XLSX.writeFile(wb, 'template_import_karyawan.xlsx')
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Import Data dari Excel
          </h2>
        </div>

        <div className="p-6">
          {/* Download Template Button */}
          <div className="mb-6">
            <button
              onClick={downloadTemplate}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download Template Excel
            </button>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Download template untuk memastikan format data sesuai
            </p>
          </div>

          {/* File Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Pilih File Excel
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 dark:text-gray-400
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-indigo-50 file:text-indigo-700
                hover:file:bg-indigo-100
                dark:file:bg-indigo-900 dark:file:text-indigo-300"
            />
          </div>

          {/* Preview */}
          {preview.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Preview Data (5 baris pertama)
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                      {Object.keys(preview[0]).slice(0, 6).map((key) => (
                        <th key={key} className="px-3 py-2 text-left text-gray-700 dark:text-gray-300">
                          {key}
                        </th>
                      ))}
                      <th className="px-3 py-2 text-left text-gray-700 dark:text-gray-300">...</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, idx) => (
                      <tr key={idx} className="border-b dark:border-gray-700">
                        {Object.values(row).slice(0, 6).map((value: string | number, i) => (
                          <td key={i} className="px-3 py-2 text-gray-900 dark:text-white">
                            {value}
                          </td>
                        ))}
                        <td className="px-3 py-2 text-gray-500">...</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Total: {preview.length} baris preview
              </p>
            </div>
          )}

          {/* Format Info */}
          <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Format File Excel:
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 list-disc list-inside space-y-1">
              <li>Kolom: Alternatif (NIP), Nama, Jabatan, Departemen</li>
              <li>Kolom penilaian: {subKriteriaList.map(sk => sk.kode).join(', ')}</li>
              <li>Nilai penilaian: 1 sampai 5</li>
              <li>File harus dalam format .xlsx atau .xls</li>
            </ul>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              onClick={handleImport}
              disabled={loading || !file}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Mengimport...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Import Data
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
