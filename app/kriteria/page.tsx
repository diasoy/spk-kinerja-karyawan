import Link from 'next/link'
import { getAllKriteria, type SubKriteria } from '@/services/kriteria.service'

export default async function KriteriaPage() {
  const kriteriaList = await getAllKriteria()
  
  const allSubKriteria: (SubKriteria & { namaKriteria: string })[] = []
  kriteriaList.forEach(k => {
    k.subKriteria.forEach(sk => {
      allSubKriteria.push({
        ...sk,
        namaKriteria: k.namaKriteria
      })
    })
  })

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
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Kriteria Penilaian Kinerja
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Daftar kriteria dan sub kriteria penilaian karyawan
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Kriteria</h3>
            <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">
              {kriteriaList.length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Sub Kriteria</h3>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
              {allSubKriteria.length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Core Factors</h3>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
              {allSubKriteria.filter(sk => sk.faktor === 'core factor').length}
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Daftar Sub Kriteria Penilaian
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Kode
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Kriteria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Sub Kriteria
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Faktor
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Nilai Standar
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {allSubKriteria.map((subKriteria) => (
                  <tr key={subKriteria.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {subKriteria.kode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {subKriteria.namaKriteria}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {subKriteria.namaSubKriteria}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        subKriteria.faktor === 'core factor'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                      }`}>
                        {subKriteria.faktor}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900 dark:text-white">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 font-semibold">
                        {subKriteria.nilaiStandar}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Kriteria Groups */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {kriteriaList.map((kriteria) => (
            <div key={kriteria.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {kriteria.namaKriteria}
              </h3>
              <ul className="space-y-2">
                {kriteria.subKriteria.map((sub) => (
                  <li key={sub.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300">
                      {sub.kode}: {sub.namaSubKriteria}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      sub.faktor === 'core factor'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                        : 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                    }`}>
                      {sub.faktor === 'core factor' ? 'CF' : 'SF'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
