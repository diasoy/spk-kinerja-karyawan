"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trophy, Calculator, Download, Medal, Award, Crown } from "lucide-react"

interface Karyawan {
  id: number
  kode: string
  nama: string
}

interface Kriteria {
  id: number
  kode: string
  nama: string
  bobot?: number
}

interface HasilProfile {
  penilaianId: number
  kriteriaId: number
  nilaiKriteria: number
  penilaian: {
    karyawanId: number
    karyawan: Karyawan
  }
}

interface RankingResult {
  karyawanId: number
  karyawanKode: string
  karyawanNama: string
  nilaiPerKriteria: { [kriteriaId: number]: number }
  nilaiTotal: number
  ranking: number
}

export default function PerangkinganPage() {
  const [kriteriaList, setKriteriaList] = useState<Kriteria[]>([])
  const [rankingResults, setRankingResults] = useState<RankingResult[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchData = async () => {
    try {
      const [kriteriaRes, bobotRes, hasilRes] = await Promise.all([
        fetch("/api/kriteria"),
        fetch("/api/ahp/bobot-kriteria"),
        fetch("/api/hasil-profile")
      ])

      const kriteria: Kriteria[] = await kriteriaRes.json()
      const bobot = await bobotRes.json()
      const hasil: HasilProfile[] = await hasilRes.json()

      // Create bobot map
      const bobotMap = new Map<number, number>()
      bobot.forEach((b: { kriteriaId: number; bobot: number }) => {
        bobotMap.set(b.kriteriaId, b.bobot)
      })

      // Add bobot to kriteria
      const kriteriaWithBobot = kriteria.map(k => ({
        ...k,
        bobot: bobotMap.get(k.id) || 0
      }))

      setKriteriaList(kriteriaWithBobot)

      if (hasil.length > 0) {
        calculateRanking(hasil, kriteriaWithBobot, bobotMap)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const calculateRanking = (
    hasilData: HasilProfile[],
    kriteriaData: Kriteria[],
    bobotMap: Map<number, number>
  ) => {
    // Group by karyawan
    const karyawanMap = new Map<number, {
      karyawan: Karyawan
      nilai: Map<number, number>
    }>()

    hasilData.forEach((hasil) => {
      const karyawanId = hasil.penilaian.karyawanId
      
      if (!karyawanMap.has(karyawanId)) {
        karyawanMap.set(karyawanId, {
          karyawan: hasil.penilaian.karyawan,
          nilai: new Map()
        })
      }

      karyawanMap.get(karyawanId)!.nilai.set(hasil.kriteriaId, hasil.nilaiKriteria || 0)
    })

    // Calculate total score for each karyawan
    const results: RankingResult[] = []

    karyawanMap.forEach((data, karyawanId) => {
      let nilaiTotal = 0
      const nilaiPerKriteria: { [kriteriaId: number]: number } = {}

      kriteriaData.forEach((kriteria) => {
        const nilaiKriteria = data.nilai.get(kriteria.id) || 0
        const bobot = bobotMap.get(kriteria.id) || 0
        
        nilaiPerKriteria[kriteria.id] = nilaiKriteria
        
        // Nilai Total = Σ (Bobot Kriteria × Nilai Kriteria)
        nilaiTotal += nilaiKriteria * bobot
      })

      results.push({
        karyawanId,
        karyawanKode: data.karyawan.kode,
        karyawanNama: data.karyawan.nama || data.karyawan.kode,
        nilaiPerKriteria,
        nilaiTotal,
        ranking: 0
      })
    })

    // Sort by nilai total (descending) and assign ranking
    results.sort((a, b) => b.nilaiTotal - a.nilaiTotal)
    results.forEach((result, index) => {
      result.ranking = index + 1
    })

    setRankingResults(results)
    saveRankingResults(results)
  }

  const saveRankingResults = async (results: RankingResult[]) => {
    try {
      const hasilAkhirData = results.map((result) => ({
        karyawanId: result.karyawanId,
        skorTotal: result.nilaiTotal,
        peringkat: result.ranking
      }))

      await fetch("/api/hasil-akhir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hasil: hasilAkhirData })
      })
    } catch (error) {
      console.error("Error saving ranking:", error)
    }
  }

  const handleDownloadCSV = () => {
    if (rankingResults.length === 0) return

    let csv = "Ranking,Alternatif,Nama,"
    kriteriaList.forEach((k) => csv += `${k.kode},`)
    csv += "Nilai Total Akhir\n"

    rankingResults.forEach((result) => {
      csv += `${result.ranking},${result.karyawanKode},${result.karyawanNama},`
      kriteriaList.forEach((k) => {
        csv += `${(result.nilaiPerKriteria[k.id] || 0).toFixed(8)},`
      })
      csv += `${result.nilaiTotal.toFixed(8)}\n`
    })

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "Hasil_Perankingan.csv"
    a.click()
  }

  const getRankingIcon = (ranking: number) => {
    if (ranking === 1) return <Crown className="h-6 w-6 text-yellow-500" />
    if (ranking === 2) return <Medal className="h-6 w-6 text-gray-400" />
    if (ranking === 3) return <Award className="h-6 w-6 text-orange-600" />
    return <Trophy className="h-5 w-5 text-gray-400" />
  }

  const getRankingColor = (ranking: number) => {
    if (ranking === 1) return "bg-yellow-50 border-yellow-300"
    if (ranking === 2) return "bg-gray-50 border-gray-300"
    if (ranking === 3) return "bg-orange-50 border-orange-300"
    return "bg-white border-gray-200"
  }

  return (
    <div className="space-y-8">
      <div className="border-b pb-6">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          Perangkingan (AHP)
        </h1>
        <p className="text-gray-600 mt-2 text-lg">
          Hasil akhir perangkingan kinerja karyawan menggunakan bobot AHP
        </p>
      </div>

      <Card className="border-2 bg-blue-50 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Formula Perhitungan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-700">
            <p><strong>Nilai Total Akhir</strong> = Σ (Bobot Kriteria × Nilai Kriteria)</p>
            <p className="text-xs text-gray-600">
              Dimana Bobot Kriteria berasal dari hasil AHP dan Nilai Kriteria dari perhitungan Aspek (NCF & NSF)
            </p>
            {kriteriaList.length > 0 && (
              <div className="mt-3 p-3 bg-white rounded border">
                <p className="font-semibold mb-2">Bobot Kriteria (dari AHP):</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {kriteriaList.map((k) => (
                    <div key={k.id} className="text-xs">
                      <span className="font-semibold">{k.kode}:</span> {((k.bobot || 0) * 100).toFixed(2)}%
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <Card className="border-2 bg-white">
          <CardContent className="p-8">
            <div className="text-center text-gray-500">Memuat data...</div>
          </CardContent>
        </Card>
      ) : rankingResults.length === 0 ? (
        <Card className="border-2 bg-white">
          <CardContent className="p-8">
            <div className="text-center text-gray-500">
              Hasil perangkingan belum tersedia. Pastikan sudah:
              <ul className="mt-3 text-left inline-block">
                <li>✓ Mengisi data penilaian di menu Gap</li>
                <li>✓ Menghitung bobot AHP di menu Perbandingan</li>
                <li>✓ Data aspek sudah terhitung</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex gap-3 justify-between items-center">
            <div className="text-lg font-semibold text-gray-700">
              Total: {rankingResults.length} Karyawan
            </div>
            <Button
              onClick={handleDownloadCSV}
              variant="outline"
              className="border-green-600 text-green-600 hover:bg-green-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Download CSV
            </Button>
          </div>

          {/* Top 3 Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {rankingResults.slice(0, 3).map((result) => (
              <Card
                key={result.karyawanId}
                className={`border-2 ${getRankingColor(result.ranking)}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="shrink-0">
                      {getRankingIcon(result.ranking)}
                    </div>
                    <div className="grow">
                      <div className="text-2xl font-bold text-gray-900">
                        Rank #{result.ranking}
                      </div>
                      <div className="text-lg font-semibold text-gray-700 mt-1">
                        {result.karyawanKode}
                      </div>
                      <div className="text-sm text-gray-600">
                        {result.karyawanNama}
                      </div>
                      <div className="mt-3 pt-3 border-t">
                        <div className="text-xs text-gray-600">Nilai Total</div>
                        <div className="text-xl font-bold text-blue-600">
                          {result.nilaiTotal.toFixed(6)}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Detailed Table */}
          <Card className="border-2 bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl text-gray-900">
                <div className="p-2 rounded-lg bg-amber-100">
                  <Trophy className="h-5 w-5 text-amber-600" />
                </div>
                Tabel Peringkat Lengkap
              </CardTitle>
              <CardDescription className="text-base text-gray-600">
                Ranking karyawan berdasarkan nilai total akhir (tertinggi ke terendah)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border-2 border-gray-300 bg-amber-100 p-3 text-center font-semibold text-sm sticky left-0 z-10">
                        Ranking
                      </th>
                      <th className="border-2 border-gray-300 bg-gray-100 p-3 text-left font-semibold text-sm">
                        Alternatif
                      </th>
                      <th className="border-2 border-gray-300 bg-gray-100 p-3 text-left font-semibold text-sm">
                        Nama
                      </th>
                      {kriteriaList.map((kriteria) => (
                        <th
                          key={kriteria.id}
                          className="border-2 border-gray-300 bg-blue-100 p-3 text-center font-semibold text-sm min-w-[120px]"
                        >
                          {kriteria.kode}
                          <div className="text-xs font-normal text-gray-600">
                            (w={((kriteria.bobot || 0) * 100).toFixed(1)}%)
                          </div>
                        </th>
                      ))}
                      <th className="border-2 border-gray-300 bg-green-100 p-3 text-center font-semibold text-sm min-w-[150px]">
                        Nilai Total Akhir
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rankingResults.map((result) => (
                      <tr
                        key={result.karyawanId}
                        className={result.ranking <= 3 ? getRankingColor(result.ranking) : ""}
                      >
                        <td className="border-2 border-gray-300 p-3 text-center font-bold text-lg sticky left-0 z-10 bg-inherit">
                          <div className="flex items-center justify-center gap-2">
                            {result.ranking <= 3 && getRankingIcon(result.ranking)}
                            {result.ranking}
                          </div>
                        </td>
                        <td className="border-2 border-gray-300 p-3 font-semibold">
                          {result.karyawanKode}
                        </td>
                        <td className="border-2 border-gray-300 p-3 text-sm">
                          {result.karyawanNama}
                        </td>
                        {kriteriaList.map((kriteria) => (
                          <td
                            key={kriteria.id}
                            className="border-2 border-gray-300 p-3 text-center font-mono text-sm"
                          >
                            {(result.nilaiPerKriteria[kriteria.id] || 0).toFixed(8)}
                          </td>
                        ))}
                        <td className="border-2 border-gray-300 p-3 text-center font-bold text-lg text-green-700">
                          {result.nilaiTotal.toFixed(8)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
