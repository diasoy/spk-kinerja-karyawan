'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import AddKaryawanForm from '../../components/AddKaryawanForm'
import ImportExcel from '../../components/ImportExcel'

interface Karyawan {
  id: string
  nip: string
  nama: string
  jabatan: string
  departemen: string
  nilaiKinerja: number
  kehadiran: number
  produktivitas: number
  kualitasKerja: number
}

interface SubKriteria {
  id: string
  kode: string
  namaSubKriteria: string
}

export default function KaryawanPage() {
  const [karyawan, setKaryawan] = useState<Karyawan[]>([])
  const [subKriteria, setSubKriteria] = useState<SubKriteria[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showImport, setShowImport] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [karyawanRes, kriteriaRes] = await Promise.all([
        fetch('/api/karyawan'),
        fetch('/api/kriteria')
      ])

      const karyawanData = await karyawanRes.json()
      const kriteriaData = await kriteriaRes.json()

      if (karyawanData.success) {
        setKaryawan(karyawanData.data)
      }

      if (kriteriaData.success) {
        const allSubKriteria: SubKriteria[] = []
        kriteriaData.data.forEach((k: { subKriteria: SubKriteria[] }) => {
          k.subKriteria.forEach((sk: SubKriteria) => {
            allSubKriteria.push(sk)
          })
        })
        setSubKriteria(allSubKriteria)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSuccess = () => {
    setShowAddForm(false)
    setShowImport(false)
    loadData()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <main className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/"
            className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 mb-4 inline-block"
          >
            ← Kembali ke Dashboard
          </Link>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Manajemen Karyawan
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Kelola data karyawan dan penilaian kinerja
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowImport(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-md transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Import Excel
              </button>
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Tambah Karyawan
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Karyawan</h3>
            <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">
              {karyawan.length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Rata-rata Kinerja</h3>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
              {karyawan.length > 0
                ? (karyawan.reduce((acc, k) => acc + k.nilaiKinerja, 0) / karyawan.length).toFixed(1)
                : 0}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Kinerja Tertinggi</h3>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
              {karyawan.length > 0
                ? Math.max(...karyawan.map(k => k.nilaiKinerja)).toFixed(1)
                : 0}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Kriteria Penilaian</h3>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">
              {subKriteria.length}
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Daftar Karyawan
            </h2>
          </div>

          {karyawan.length === 0 ? (
            <div className="p-8 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-gray-500 dark:text-gray-400 mt-4 mb-4">
                Belum ada data karyawan
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Tambah Karyawan Pertama
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      NIP
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Nama
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Jabatan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Departemen
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Nilai Kinerja
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {karyawan.map((k) => (
                    <tr key={k.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {k.nip}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {k.nama}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {k.jabatan}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {k.departemen}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                          k.nilaiKinerja >= 85
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : k.nilaiKinerja >= 70
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}>
                          {k.nilaiKinerja.toFixed(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      {showAddForm && (
        <AddKaryawanForm
          onSuccess={handleSuccess}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {showImport && (
        <ImportExcel
          onSuccess={handleSuccess}
          onCancel={() => setShowImport(false)}
          subKriteriaList={subKriteria}
        />
      )}
    </div>
  )
}
