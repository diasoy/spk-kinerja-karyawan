'use client'

import { useState, useEffect } from 'react'

interface SubKriteria {
  id: string
  kode: string
  nama: string
  namaSubKriteria: string
  faktor: string
  kriteriaId: string
}

interface AddKaryawanFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export default function AddKaryawanForm({ onSuccess, onCancel }: AddKaryawanFormProps) {
  const [loading, setLoading] = useState(false)
  const [subKriteria, setSubKriteria] = useState<SubKriteria[]>([])
  const [formData, setFormData] = useState({
    nip: '',
    nama: '',
    jabatan: '',
    departemen: '',
  })
  const [penilaian, setPenilaian] = useState<{ [key: string]: number }>({})

  useEffect(() => {
    loadSubKriteria()
  }, [])

  async function loadSubKriteria() {
    try {
      const response = await fetch('/api/sub-kriteria')
      const data = await response.json()
      setSubKriteria(data)
      
      // Initialize penilaian dengan nilai default 3
      const initialPenilaian: { [key: string]: number } = {}
      data.forEach((sk: SubKriteria) => {
        initialPenilaian[sk.id] = 3
      })
      setPenilaian(initialPenilaian)
    } catch (error) {
      console.error('Error loading sub-kriteria:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const penilaianArray = Object.entries(penilaian).map(([subKriteriaId, nilai]) => ({
        subKriteriaId,
        nilai
      }))

      const response = await fetch('/api/karyawan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          penilaian: penilaianArray
        }),
      })

      const result = await response.json()

      if (result.success) {
        alert('Karyawan berhasil ditambahkan!')
        onSuccess()
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Terjadi kesalahan saat menambahkan karyawan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full my-8">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Tambah Karyawan Baru
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 max-h-[70vh] overflow-y-auto">
          {/* Data Karyawan */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Data Karyawan
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  NIP <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.nip}
                  onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Contoh: K028"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Nama lengkap karyawan"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Jabatan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.jabatan}
                  onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Contoh: Staff IT"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Departemen <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.departemen}
                  onChange={(e) => setFormData({ ...formData, departemen: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Contoh: IT"
                />
              </div>
            </div>
          </div>

          {/* Penilaian Per Kriteria */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Penilaian Kriteria
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Skala penilaian: 1 (Sangat Kurang) - 5 (Sangat Baik)
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subKriteria.map((sk) => (
                <div key={sk.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {sk.kode}: {sk.namaSubKriteria}
                    <span className={`ml-2 text-xs px-2 py-1 rounded ${
                      sk.faktor === 'core factor'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                        : 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                    }`}>
                      {sk.faktor === 'core factor' ? 'CF' : 'SF'}
                    </span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={penilaian[sk.id] || 3}
                      onChange={(e) => setPenilaian({ ...penilaian, [sk.id]: parseInt(e.target.value) })}
                      className="w-full"
                    />
                    <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400 min-w-[2rem] text-center">
                      {penilaian[sk.id] || 3}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Menyimpan...
                </>
              ) : (
                'Simpan'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
