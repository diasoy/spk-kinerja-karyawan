"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Layers, Download } from "lucide-react"

interface Karyawan {
  id: number
  kode: string
  nama: string
}

interface Kriteria {
  id: number
  kode: string
  nama: string
  urutan?: number
}

interface Subkriteria {
  id: number
  kode: string
  nama: string
  faktor: "CORE" | "SECONDARY"
  kriteria: Kriteria
}

interface PenilaianDetail {
  subkriteriaId: number
  nilaiAktual: number
  bobotGap: number
  subkriteria: Subkriteria
}

interface Penilaian {
  karyawanId: number
  karyawan: Karyawan
  detail: PenilaianDetail[]
}

interface AspekResult {
  karyawanId: number
  karyawanKode: string
  karyawanNama: string
  kriteria: {
    [kriteriaId: number]: {
      kriteriaKode: string
      kriteriaNama: string
      core: number[]
      secondary: number[]
      ncf: number
      nsf: number
      nilaiTotal: number
    }
  }
}

export default function AspekPage() {
  const [kriteriaList, setKriteriaList] = useState<Kriteria[]>([])
  const [aspekResults, setAspekResults] = useState<AspekResult[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchData = async () => {
    try {
      const [kriteriaRes, penilaianRes] = await Promise.all([
        fetch("/api/kriteria"),
        fetch("/api/penilaian/batch")
      ])

      const kriteria = await kriteriaRes.json()
      const penilaian = await penilaianRes.json()

      setKriteriaList(kriteria.sort((a: Kriteria, b: Kriteria) => (a.urutan || 0) - (b.urutan || 0)))
      
      if (penilaian.length > 0) {
        calculateAspek(penilaian, kriteria)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const calculateAspek = (penilaianData: Penilaian[], kriteriaData: Kriteria[]) => {
    const results: AspekResult[] = penilaianData.map((penilaian) => {
      const kriteriaResults: AspekResult["kriteria"] = {}

      kriteriaData.forEach((kriteria) => {
        // Filter detail by kriteria
        const detailForKriteria = penilaian.detail.filter(
          (d) => d.subkriteria.kriteria.id === kriteria.id
        )

        if (detailForKriteria.length === 0) return

        // Separate by factor
        const coreValues = detailForKriteria
          .filter((d) => d.subkriteria.faktor === "CORE")
          .map((d) => d.bobotGap || 0)

        const secondaryValues = detailForKriteria
          .filter((d) => d.subkriteria.faktor === "SECONDARY")
          .map((d) => d.bobotGap || 0)

        // Calculate NCF and NSF
        const ncf = coreValues.length > 0 
          ? coreValues.reduce((a, b) => a + b, 0) / coreValues.length 
          : 0

        const nsf = secondaryValues.length > 0
          ? secondaryValues.reduce((a, b) => a + b, 0) / secondaryValues.length
          : 0

        // Calculate Nilai Total (60% NCF + 40% NSF)
        const nilaiTotal = (ncf * 0.6) + (nsf * 0.4)

        kriteriaResults[kriteria.id] = {
          kriteriaKode: kriteria.kode,
          kriteriaNama: kriteria.nama,
          core: coreValues,
          secondary: secondaryValues,
          ncf,
          nsf,
          nilaiTotal
        }
      })

      return {
        karyawanId: penilaian.karyawanId,
        karyawanKode: penilaian.karyawan.kode,
        karyawanNama: penilaian.karyawan.nama || penilaian.karyawan.kode,
        kriteria: kriteriaResults
      }
    })

    setAspekResults(results)
    
    // Save to database
    saveAspekResults(results)
  }

  const saveAspekResults = async (results: AspekResult[]) => {
    try {
      const hasilData = results.flatMap((result) =>
        Object.entries(result.kriteria).map(([kriteriaId, data]) => ({
          karyawanId: result.karyawanId,
          kriteriaId: parseInt(kriteriaId),
          ncf: data.ncf,
          nsf: data.nsf,
          nilaiKriteria: data.nilaiTotal
        }))
      )

      await fetch("/api/hasil-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hasil: hasilData })
      })
    } catch (error) {
      console.error("Error saving aspek results:", error)
    }
  }

  const handleDownloadCSV = () => {
    if (aspekResults.length === 0) return

    let csv = "Alternatif,"
    kriteriaList.forEach((kriteria) => {
      csv += `${kriteria.kode} CF,${kriteria.kode} SF,${kriteria.kode} Total,`
    })
    csv += "\n"

    aspekResults.forEach((result) => {
      csv += `${result.karyawanKode},`
      kriteriaList.forEach((kriteria) => {
        const data = result.kriteria[kriteria.id]
        if (data) {
          csv += `${data.ncf.toFixed(4)},${data.nsf.toFixed(4)},${data.nilaiTotal.toFixed(4)},`
        } else {
          csv += "0,0,0,"
        }
      })
      csv += "\n"
    })

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "Hasil_Aspek.csv"
    a.click()
  }

  return (
    <div className="space-y-8">
      <div className="border-b pb-6">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          Aspek (Profile Matching)
        </h1>
        <p className="text-gray-600 mt-2 text-lg">
          Perhitungan NCF (Core Factor) dan NSF (Secondary Factor) per Kriteria
        </p>
      </div>

      <Card className="border-2 bg-blue-50 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Formula Perhitungan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-700">
            <p><strong>NCF (Nilai Core Factor)</strong> = Rata-rata bobot gap untuk subkriteria CORE</p>
            <p><strong>NSF (Nilai Secondary Factor)</strong> = Rata-rata bobot gap untuk subkriteria SECONDARY</p>
            <p><strong>Nilai Total per Kriteria (N)</strong> = (60% × NCF) + (40% × NSF)</p>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <Card className="border-2 bg-white">
          <CardContent className="p-8">
            <div className="text-center text-gray-500">Memuat data...</div>
          </CardContent>
        </Card>
      ) : aspekResults.length === 0 ? (
        <Card className="border-2 bg-white">
          <CardContent className="p-8">
            <div className="text-center text-gray-500">
              Belum ada data penilaian. Silakan isi data penilaian di menu Gap terlebih dahulu.
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex gap-3 justify-end">
            <Button
              onClick={handleDownloadCSV}
              variant="outline"
              className="border-green-600 text-green-600 hover:bg-green-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Download CSV
            </Button>
          </div>

          {kriteriaList.map((kriteria) => (
            <Card key={kriteria.id} className="border-2 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl text-gray-900">
                  <div className="p-2 rounded-lg bg-pink-100">
                    <Layers className="h-5 w-5 text-pink-600" />
                  </div>
                  Aspek {kriteria.kode} - {kriteria.nama}
                </CardTitle>
                <CardDescription className="text-base text-gray-600">
                  Perhitungan NCF, NSF, dan Nilai Total untuk kriteria {kriteria.nama}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="border-2 border-gray-300 bg-gray-100 p-3 text-left font-semibold text-sm">
                          Alternatif
                        </th>
                        <th className="border-2 border-gray-300 bg-blue-100 p-3 text-center font-semibold text-sm min-w-[120px]">
                          CF (Core Factor)
                        </th>
                        <th className="border-2 border-gray-300 bg-purple-100 p-3 text-center font-semibold text-sm min-w-[120px]">
                          SF (Secondary Factor)
                        </th>
                        <th className="border-2 border-gray-300 bg-green-100 p-3 text-center font-semibold text-sm min-w-[150px]">
                          N{kriteria.kode}<br/>
                          <span className="text-xs font-normal">(60%CF + 40%SF)</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {aspekResults.map((result) => {
                        const data = result.kriteria[kriteria.id]
                        if (!data) return null

                        return (
                          <tr key={result.karyawanId}>
                            <td className="border-2 border-gray-300 bg-gray-50 p-3 font-semibold text-sm">
                              <div>{result.karyawanKode}</div>
                              <div className="text-xs text-gray-600 font-normal">{result.karyawanNama}</div>
                            </td>
                            <td className="border-2 border-gray-300 bg-white p-3 text-center font-mono text-sm">
                              <div className="font-bold text-blue-700">{data.ncf.toFixed(4)}</div>
                              <div className="text-xs text-gray-500 mt-1">
                                ({data.core.length} nilai CORE)
                              </div>
                            </td>
                            <td className="border-2 border-gray-300 bg-white p-3 text-center font-mono text-sm">
                              <div className="font-bold text-purple-700">{data.nsf.toFixed(4)}</div>
                              <div className="text-xs text-gray-500 mt-1">
                                ({data.secondary.length} nilai SECONDARY)
                              </div>
                            </td>
                            <td className="border-2 border-gray-300 bg-green-50 p-3 text-center font-mono text-sm">
                              <div className="font-bold text-green-700 text-lg">{data.nilaiTotal.toFixed(4)}</div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ))}
        </>
      )}
    </div>
  )
}
