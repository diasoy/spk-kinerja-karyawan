/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TrendingDown, Calculator, Target, Save } from "lucide-react"
import { Subkriteria } from "@/types/kriteria"
import { toast } from "sonner"

interface Karyawan {
  id: number
  kode: string
  nama: string | null
}

interface PenilaianData {
  karyawanId: number
  [key: string]: number
}

interface GapBobot {
  nilaiGap: number
  bobot: number
  deskripsi: string | null
}

export default function GapPage() {
  const [karyawanList, setKaryawanList] = useState<Karyawan[]>([])
  const [subkriteriaList, setSubkriteriaList] = useState<Subkriteria[]>([])
  const [gapBobotList, setGapBobotList] = useState<GapBobot[]>([])
  const [penilaianData, setPenilaianData] = useState<PenilaianData[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [karyawanRes, subkriteriaRes, gapBobotRes, penilaianRes] = await Promise.all([
        fetch("/api/karyawan"),
        fetch("/api/subkriteria"),
        fetch("/api/gap-bobot"),
        fetch("/api/penilaian/batch")
      ])

      if (karyawanRes.ok && subkriteriaRes.ok && gapBobotRes.ok) {
        const karyawan = await karyawanRes.json()
        const subkriteria = await subkriteriaRes.json()
        const gapBobot = await gapBobotRes.json()
        
        setKaryawanList(karyawan)
        setSubkriteriaList(subkriteria)
        setGapBobotList(gapBobot)

        // Initialize penilaian data
        if (penilaianRes.ok) {
          const penilaian = await penilaianRes.json()
          const initialData: PenilaianData[] = karyawan.map((k: Karyawan) => {
            const data: PenilaianData = { karyawanId: k.id }
            const karyawanPenilaian = penilaian.find((p: any) => p.karyawanId === k.id)
            
            subkriteria.forEach((sub: Subkriteria) => {
              const detail = karyawanPenilaian?.detail.find((d: any) => d.subkriteriaId === sub.id)
              data[`sub_${sub.id}`] = detail?.nilaiAktual || sub.nilaiStandar || 3
            })
            
            return data
          })
          setPenilaianData(initialData)
        } else {
          // Initialize with default data
          const initialData: PenilaianData[] = karyawan.map((k: Karyawan) => {
            const data: PenilaianData = { karyawanId: k.id }
            subkriteria.forEach((sub: Subkriteria) => {
              data[`sub_${sub.id}`] = sub.nilaiStandar || 3
            })
            return data
          })
          setPenilaianData(initialData)
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleValueChange = (karyawanId: number, subkriteriaId: number, value: string) => {
    const numValue = parseInt(value) || 0
    if (numValue < 1 || numValue > 5) return

    setPenilaianData(prev => 
      prev.map(data => 
        data.karyawanId === karyawanId 
          ? { ...data, [`sub_${subkriteriaId}`]: numValue }
          : data
      )
    )
  }

  const handleSavePenilaian = async () => {
    setSaving(true)
    try {
      const response = await fetch("/api/penilaian/batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ penilaianData }),
      })

      if (response.ok) {
        toast.success('Data Penilaian Berhasil Disimpan!', {
          description: 'Semua perubahan telah tersimpan'
        })
        fetchData() // Refresh data
      } else {
        const error = await response.json()
        toast.error('Gagal Menyimpan Data', {
          description: error.error
        })
      }
    } catch (error) {
      console.error("Error saving penilaian:", error)
      toast.error('Terjadi Kesalahan', {
        description: 'Gagal menyimpan data penilaian'
      })
    } finally {
      setSaving(false)
    }
  }

  // Group subkriteria by kriteria
  const groupedSubkriteria = subkriteriaList.reduce((acc, sub) => {
    const kriteriaKey = sub.kriteria?.kode || "Unknown"
    if (!acc[kriteriaKey]) {
      acc[kriteriaKey] = {
        nama: sub.kriteria?.nama || "Unknown",
        subkriteria: []
      }
    }
    acc[kriteriaKey].subkriteria.push(sub)
    return acc
  }, {} as Record<string, { nama: string; subkriteria: Subkriteria[] }>)

  // Get nilai aktual for karyawan and subkriteria
  const getNilaiAktual = (karyawanId: number, subkriteriaId: number): number => {
    const data = penilaianData.find(p => p.karyawanId === karyawanId)
    return data?.[`sub_${subkriteriaId}`] || 0
  }

  // Get gap value
  const getGap = (karyawanId: number, subkriteriaId: number): number => {
    const nilai = getNilaiAktual(karyawanId, subkriteriaId)
    const sub = subkriteriaList.find(s => s.id === subkriteriaId)
    if (!sub) return 0
    return nilai - sub.nilaiStandar
  }

  // Get bobot gap
  const getBobotGap = (karyawanId: number, subkriteriaId: number): number => {
    const gap = getGap(karyawanId, subkriteriaId)
    const roundedGap = Math.round(gap)
    const gapBobot = gapBobotList.find(gb => gb.nilaiGap === roundedGap)
    return gapBobot?.bobot || 0
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-lg">Memuat data...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="border-b pb-6">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
          <TrendingDown className="h-10 w-10" />
          Analisis Gap
        </h1>
        <p className="text-gray-600 mt-2 text-lg">
          Perhitungan selisih nilai karyawan dengan profil ideal dan konversi ke bobot
        </p>
      </div>

      {/* Tabel 1: Nilai Karyawan */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3">
                <Target className="h-6 w-6 text-blue-600" />
                Nilai Karyawan
              </CardTitle>
              <CardDescription>
                Input nilai aktual karyawan untuk setiap subkriteria (Skala 1-5, Bilangan Bulat)
              </CardDescription>
            </div>
            <Button
              onClick={handleSavePenilaian}
              disabled={saving}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {saving ? "Menyimpan..." : "Simpan Penilaian"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600 mb-4">
            {karyawanList.length} karyawan × {subkriteriaList.length} subkriteria
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="border-r-2 border-gray-300 px-4 py-3 text-left font-semibold w-24 bg-white">
                    Kode
                  </th>
                  <th className="border-r-2 border-gray-300 px-4 py-3 text-left font-semibold min-w-[200px] bg-white">
                    Nama Karyawan
                  </th>
                  {Object.entries(groupedSubkriteria).map(([kriteriaKode, { nama, subkriteria }]) => (
                    <th
                      key={kriteriaKode}
                      colSpan={subkriteria.length}
                      className="border-r border-gray-300 px-4 py-2 text-center font-semibold bg-gray-50"
                    >
                      {nama}
                    </th>
                  ))}
                </tr>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="border-r-2 border-gray-300 bg-gray-50"></th>
                  <th className="border-r-2 border-gray-300 bg-gray-50"></th>
                  {subkriteriaList.map((sub) => (
                    <th
                      key={sub.id}
                      className="border-r border-gray-200 px-2 py-3 text-xs font-medium text-center"
                      title={sub.nama}
                      style={{ minWidth: '120px' }}
                    >
                      <div className="flex flex-col items-center gap-1.5">
                        <span className="font-semibold text-center leading-tight block">
                          {sub.nama}
                        </span>
                        <div className="flex items-center gap-1.5 justify-center">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap ${
                            sub.faktor === 'CORE' 
                              ? 'bg-blue-100 text-blue-700' 
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {sub.faktor === 'CORE' ? 'C' : 'S'}
                          </span>
                          <span className="text-gray-500 text-[10px] whitespace-nowrap">
                            Std: {sub.nilaiStandar}
                          </span>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {penilaianData.map((data, index) => {
                  const karyawan = karyawanList.find(k => k.id === data.karyawanId)
                  return (
                    <tr
                      key={data.karyawanId}
                      className={`border-b border-gray-200 hover:bg-gray-50 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                      }`}
                    >
                      <td className="border-r-2 border-gray-300 px-4 py-2 font-medium bg-inherit">
                        {karyawan?.kode}
                      </td>
                      <td className="border-r-2 border-gray-300 px-4 py-2 bg-inherit">
                        {karyawan?.nama || "-"}
                      </td>
                      {subkriteriaList.map((sub) => (
                        <td
                          key={sub.id}
                          className="border-r border-gray-200 px-2 py-2"
                          style={{ minWidth: '120px' }}
                        >
                          <Input
                            type="number"
                            min="1"
                            max="5"
                            step="1"
                            value={data[`sub_${sub.id}`] || sub.nilaiStandar}
                            onChange={(e) =>
                              handleValueChange(data.karyawanId, sub.id, e.target.value)
                            }
                            className="w-full text-center h-8 px-2"
                          />
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Tabel 2: Gap (Nilai - Standar) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <TrendingDown className="h-6 w-6 text-orange-600" />
            Nilai Gap
          </CardTitle>
          <CardDescription>
            Selisih antara nilai karyawan dengan nilai standar (Nilai Aktual - Nilai Standar)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="border-r-2 border-gray-300 px-4 py-3 text-left font-semibold w-24 bg-white">
                    Kode
                  </th>
                  <th className="border-r-2 border-gray-300 px-4 py-3 text-left font-semibold min-w-[200px] bg-white">
                    Nama Karyawan
                  </th>
                  {Object.entries(groupedSubkriteria).map(([kriteriaKode, { nama, subkriteria }]) => (
                    <th
                      key={kriteriaKode}
                      colSpan={subkriteria.length}
                      className="border-r border-gray-300 px-4 py-2 text-center font-semibold bg-orange-50"
                    >
                      {nama}
                    </th>
                  ))}
                </tr>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="border-r-2 border-gray-300 bg-gray-50"></th>
                  <th className="border-r-2 border-gray-300 bg-gray-50"></th>
                  {subkriteriaList.map((sub) => (
                    <th
                      key={sub.id}
                      className="border-r border-gray-200 px-2 py-3 text-xs font-medium text-center"
                      title={sub.nama}
                      style={{ minWidth: '120px' }}
                    >
                      <div className="flex flex-col items-center gap-1.5">
                        <span className="font-semibold text-center leading-tight block">
                          {sub.nama}
                        </span>
                        <div className="flex items-center gap-1.5 justify-center">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap ${
                            sub.faktor === 'CORE' 
                              ? 'bg-blue-100 text-blue-700' 
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {sub.faktor === 'CORE' ? 'C' : 'S'}
                          </span>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {penilaianData.map((data, index) => {
                  const karyawan = karyawanList.find(k => k.id === data.karyawanId)
                  return (
                    <tr
                      key={data.karyawanId}
                      className={`border-b border-gray-200 hover:bg-gray-50 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                      }`}
                    >
                      <td className="border-r-2 border-gray-300 px-4 py-2 font-medium bg-inherit">
                        {karyawan?.kode}
                      </td>
                      <td className="border-r-2 border-gray-300 px-4 py-2 bg-inherit">
                        {karyawan?.nama || "-"}
                      </td>
                      {subkriteriaList.map((sub) => {
                        const gap = getGap(data.karyawanId, sub.id)
                        return (
                          <td
                            key={sub.id}
                            className="border-r border-gray-200 px-2 py-2 text-center"
                            style={{ minWidth: '120px' }}
                          >
                            <span className={`font-semibold ${
                              gap > 0 ? 'text-green-600' : gap < 0 ? 'text-red-600' : 'text-gray-600'
                            }`}>
                              {gap > 0 ? '+' : ''}{gap.toFixed(1)}
                            </span>
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Tabel 3: Bobot Gap */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Calculator className="h-6 w-6 text-green-600" />
            Bobot Gap
          </CardTitle>
          <CardDescription>
            Konversi nilai gap menjadi bobot berdasarkan tabel gap-bobot
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="border-r-2 border-gray-300 px-4 py-3 text-left font-semibold w-24 bg-white">
                    Kode
                  </th>
                  <th className="border-r-2 border-gray-300 px-4 py-3 text-left font-semibold min-w-[200px] bg-white">
                    Nama Karyawan
                  </th>
                  {Object.entries(groupedSubkriteria).map(([kriteriaKode, { nama, subkriteria }]) => (
                    <th
                      key={kriteriaKode}
                      colSpan={subkriteria.length}
                      className="border-r border-gray-300 px-4 py-2 text-center font-semibold bg-green-50"
                    >
                      {nama}
                    </th>
                  ))}
                </tr>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="border-r-2 border-gray-300 bg-gray-50"></th>
                  <th className="border-r-2 border-gray-300 bg-gray-50"></th>
                  {subkriteriaList.map((sub) => (
                    <th
                      key={sub.id}
                      className="border-r border-gray-200 px-2 py-3 text-xs font-medium text-center"
                      title={sub.nama}
                      style={{ minWidth: '120px' }}
                    >
                      <div className="flex flex-col items-center gap-1.5">
                        <span className="font-semibold text-center leading-tight block">
                          {sub.nama}
                        </span>
                        <div className="flex items-center gap-1.5 justify-center">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap ${
                            sub.faktor === 'CORE' 
                              ? 'bg-blue-100 text-blue-700' 
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {sub.faktor === 'CORE' ? 'C' : 'S'}
                          </span>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {penilaianData.map((data, index) => {
                  const karyawan = karyawanList.find(k => k.id === data.karyawanId)
                  return (
                    <tr
                      key={data.karyawanId}
                      className={`border-b border-gray-200 hover:bg-gray-50 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                      }`}
                    >
                      <td className="border-r-2 border-gray-300 px-4 py-2 font-medium bg-inherit">
                        {karyawan?.kode}
                      </td>
                      <td className="border-r-2 border-gray-300 px-4 py-2 bg-inherit">
                        {karyawan?.nama || "-"}
                      </td>
                      {subkriteriaList.map((sub) => {
                        const bobot = getBobotGap(data.karyawanId, sub.id)
                        return (
                          <td
                            key={sub.id}
                            className="border-r border-gray-200 px-2 py-2 text-center"
                            style={{ minWidth: '120px' }}
                          >
                            <span className="font-semibold text-green-700">
                              {bobot.toFixed(1)}
                            </span>
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Tabel Referensi Gap-Bobot */}
      <Card>
        <CardHeader>
          <CardTitle>Tabel Referensi Gap - Bobot</CardTitle>
          <CardDescription>
            Mapping nilai gap ke bobot untuk perhitungan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-300 bg-gray-50">
                  <th className="border-r border-gray-300 px-4 py-3 text-left font-semibold">
                    Nilai Gap
                  </th>
                  <th className="border-r border-gray-300 px-4 py-3 text-left font-semibold">
                    Bobot
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">
                    Deskripsi
                  </th>
                </tr>
              </thead>
              <tbody>
                {gapBobotList
                  .sort((a, b) => b.nilaiGap - a.nilaiGap)
                  .map((gb) => (
                    <tr key={gb.nilaiGap} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="border-r border-gray-300 px-4 py-3 font-medium">
                        {gb.nilaiGap > 0 ? '+' : ''}{gb.nilaiGap}
                      </td>
                      <td className="border-r border-gray-300 px-4 py-3 font-semibold text-green-700">
                        {gb.bobot.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {gb.deskripsi || '-'}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
