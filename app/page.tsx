import Link from 'next/link'
import { getAllKaryawan, type Karyawan } from '@/services/karyawan.service'

export default async function Home() {
  const karyawanList = await getAllKaryawan()

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <main className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Sistem Pendukung Keputusan
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Penilaian Kinerja Karyawan
          </p>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-center gap-4 mb-8">
          <Link
            href="/karyawan"
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition-colors"
          >
            👥 Kelola Data Karyawan
          </Link>
          <Link
            href="/kriteria"
            className="inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-md transition-colors"
          >
            📋 Lihat Kriteria Penilaian
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Karyawan</h3>
            <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">
              {karyawanList.length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Rata-rata Kinerja</h3>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
              {karyawanList.length > 0
                ? (karyawanList.reduce((acc, k) => acc + k.nilaiKinerja, 0) / karyawanList.length).toFixed(1)
                : 0}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Rata-rata Kehadiran</h3>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
              {karyawanList.length > 0
                ? (karyawanList.reduce((acc, k) => acc + k.kehadiran, 0) / karyawanList.length).toFixed(1)
                : 0}%
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Data Karyawan
            </h2>
          </div>
          
          {karyawanList.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Belum ada data karyawan. Jalankan migrasi database terlebih dahulu.
              </p>
              <code className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded text-sm">
                npx prisma migrate dev --name init
              </code>
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
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Kehadiran
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Produktivitas
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Kualitas
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {karyawanList.map((karyawan) => (
                    <tr key={karyawan.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {karyawan.nip}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {karyawan.nama}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {karyawan.jabatan}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {karyawan.departemen}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          karyawan.nilaiKinerja >= 85
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : karyawan.nilaiKinerja >= 70
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}>
                          {karyawan.nilaiKinerja.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900 dark:text-white">
                        {karyawan.kehadiran.toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900 dark:text-white">
                        {karyawan.produktivitas.toFixed(1)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900 dark:text-white">
                        {karyawan.kualitasKerja.toFixed(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>Data diurutkan berdasarkan nilai kinerja tertinggi</p>
        </div>
      </main>
    </div>
  )
}

