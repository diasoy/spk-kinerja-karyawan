"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ClipboardCheck, Save, Download } from "lucide-react"
import { Subkriteria } from "@/types/kriteria"

interface Karyawan {
  id: number
  kode: string
  nama: string | null
}

interface PenilaianData {
  karyawanId: number
  [subkriteriaId: string]: number | string
}

export default function PenilaianPage() {
  const [karyawanList, setKaryawanList] = useState<Karyawan[]>([])
  const [subkriteriaList, setSubkriteriaList] = useState<Subkriteria[]>([])
  const [penilaianData, setPenilaianData] = useState<PenilaianData[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [karyawanRes, subkriteriaRes] = await Promise.all([
        fetch("/api/karyawan"),
        fetch("/api/subkriteria")
      ])

      if (karyawanRes.ok && subkriteriaRes.ok) {
        const karyawan = await karyawanRes.json()
        const subkriteria = await subkriteriaRes.json()
        
        setKaryawanList(karyawan)
        setSubkriteriaList(subkriteria)
        
        // Initialize penilaian data with default values
        const initialData = karyawan.map((k: Karyawan) => {
          const data: PenilaianData = { karyawanId: k.id }
          subkriteria.forEach((sub: Subkriteria) => {
            data[`sub_${sub.id}`] = sub.nilaiStandar || 3
          })
          return data
        })
        setPenilaianData(initialData)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleValueChange = (karyawanId: number, subkriteriaId: number, value: string) => {
    const numValue = parseFloat(value)
    if (numValue < 1 || numValue > 5) return

    setPenilaianData(prev =>
      prev.map(data =>
        data.karyawanId === karyawanId
          ? { ...data, [`sub_${subkriteriaId}`]: numValue }
          : data
      )
    )
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch("/api/penilaian/batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          penilaianData: penilaianData
        }),
      })

      if (response.ok) {
        alert("Data penilaian berhasil disimpan!")
      } else {
        const error = await response.json()
        alert(`Gagal menyimpan: ${error.error}`)
      }
    } catch (error) {
      console.error("Error saving:", error)
      alert("Terjadi kesalahan saat menyimpan data")
    } finally {
      setSaving(false)
    }
  }

  const exportToExcel = () => {
    // Simple CSV export
    const headers = ["Kode", "Nama", ...subkriteriaList.map(s => s.kode)]
    const rows = penilaianData.map(data => {
      const karyawan = karyawanList.find(k => k.id === data.karyawanId)
      return [
        karyawan?.kode || "",
        karyawan?.nama || "",
        ...subkriteriaList.map(s => data[`sub_${s.id}`] || 0)
      ]
    })

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `penilaian_karyawan_${new Date().toISOString().split("T")[0]}.csv`
    a.click()
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
    <div className="space-y-6">
      <div className="border-b pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
              <ClipboardCheck className="h-10 w-10" />
              Penilaian Karyawan
            </h1>
            <p className="text-gray-500 mt-2">
              Input nilai karyawan untuk setiap subkriteria (Skala 1-5)
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={exportToExcel}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {saving ? "Menyimpan..." : "Simpan Semua"}
            </Button>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tabel Penilaian</CardTitle>
          <CardDescription>
            {karyawanList.length} karyawan × {subkriteriaList.length} subkriteria
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
                          className="border-r border-gray-200 px-2 py-2 text-center"
                          style={{ minWidth: '120px' }}
                        >
                          <Input
                            type="number"
                            min="1"
                            max="5"
                            step="0.1"
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

      <div className="flex justify-end gap-2 pb-8">
        <Button
          variant="outline"
          onClick={fetchData}
        >
          Reset
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          {saving ? "Menyimpan..." : "Simpan Semua"}
        </Button>
      </div>
    </div>
  )
}