"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { GitCompare, Save, Calculator, Info, AlertCircle } from "lucide-react"

interface Kriteria {
  id: number
  kode: string
  nama: string
  urutan?: number
}

interface MatrixValue {
  kriteriaAId: number
  kriteriaBId: number
  nilai: number
}

interface CalculationResult {
  matrixArray: number[][]
  columnSums: number[]
  normalized: number[][]
  priorityVector: number[]
  weightedSum: number[]
  lambdaMax: number
  ci: number
  cr: number
  n: number
}

export default function PerbandinganKriteriaPage() {
  const [kriteriaList, setKriteriaList] = useState<Kriteria[]>([])
  const [matrix, setMatrix] = useState<Map<string, number>>(new Map())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null)

  useEffect(() => {
    fetchKriteria()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchKriteria = async () => {
    try {
      const response = await fetch("/api/kriteria")
      if (response.ok) {
        const data = await response.json()
        const sortedData = data.sort((a: Kriteria, b: Kriteria) => (a.urutan || 0) - (b.urutan || 0))
        setKriteriaList(sortedData)
        
        // Initialize matrix with default values
        const defaultMatrix = new Map<string, number>()
        for (let i = 0; i < sortedData.length; i++) {
          for (let j = 0; j < sortedData.length; j++) {
            const key = `${sortedData[i].id}-${sortedData[j].id}`
            if (i === j) {
              defaultMatrix.set(key, 1) // Diagonal = 1
            } else if (i < j) {
              defaultMatrix.set(key, 1) // Default comparison value
            }
          }
        }
        setMatrix(matrix)
        
        // Fetch existing comparison data
        await fetchMatrixData()
      }
    } catch (error) {
      console.error("Error fetching kriteria:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMatrixData = async () => {
    try {
      const response = await fetch("/api/ahp/matrix-kriteria")
      if (response.ok) {
        const data = await response.json()
        const newMatrix = new Map(matrix)
        
        data.forEach((item: MatrixValue) => {
          const key = `${item.kriteriaAId}-${item.kriteriaBId}`
          newMatrix.set(key, item.nilai)
        })
        
        setMatrix(newMatrix)
      }
    } catch (error) {
      console.error("Error fetching matrix data:", error)
    }
  }

  const getMatrixValue = (idA: number, idB: number): number => {
    if (idA === idB) return 1
    
    const key = `${idA}-${idB}`
    const reverseKey = `${idB}-${idA}`
    
    if (matrix.has(key)) {
      return matrix.get(key)!
    } else if (matrix.has(reverseKey)) {
      const reverseValue = matrix.get(reverseKey)!
      return reverseValue !== 0 ? 1 / reverseValue : 1
    }
    return 1
  }

  const handleMatrixChange = (idA: number, idB: number, value: string) => {
    // Jangan validasi saat mengetik, biarkan user bebas ketik
    const numValue = value === '' ? '' : parseFloat(value)
    
    const newMatrix = new Map(matrix)
    const key = `${idA}-${idB}`
    
    // Simpan nilai mentah dulu, validasi nanti saat blur atau simpan
    if (numValue === '') {
      newMatrix.set(key, 1) // Default ke 1 jika kosong
    } else if (!isNaN(numValue as number)) {
      newMatrix.set(key, numValue as number)
    }
    
    setMatrix(newMatrix)
  }

  const handleInputBlur = (idA: number, idB: number) => {
    // Validasi dan clamp nilai saat user selesai input (blur)
    const key = `${idA}-${idB}`
    const currentValue = matrix.get(key) || 1
    const clampedValue = Math.max(0.111, Math.min(9, currentValue))
    
    if (currentValue !== clampedValue) {
      const newMatrix = new Map(matrix)
      newMatrix.set(key, clampedValue)
      setMatrix(newMatrix)
    }
  }

  const handleSaveAndCalculate = async () => {
    setSaving(true)
    
    try {
      // 1. Validasi dan clamp semua nilai matrix terlebih dahulu
      const validatedMatrix = new Map(matrix)
      validatedMatrix.forEach((value, key) => {
        const clampedValue = Math.max(0.111, Math.min(9, value))
        validatedMatrix.set(key, clampedValue)
      })
      setMatrix(validatedMatrix)
      
      // 2. Simpan matrix ke database
      const matrixData: MatrixValue[] = []
      
      kriteriaList.forEach((kriteriaA, i) => {
        kriteriaList.forEach((kriteriaB, j) => {
          if (i < j) { // Only save upper triangle
            const key = `${kriteriaA.id}-${kriteriaB.id}`
            const nilai = validatedMatrix.get(key) || 1
            matrixData.push({
              kriteriaAId: kriteriaA.id,
              kriteriaBId: kriteriaB.id,
              nilai
            })
          }
        })
      })

      const response = await fetch("/api/ahp/matrix-kriteria", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matrix: matrixData })
      })

      if (!response.ok) {
        const error = await response.json()
        alert(`Gagal menyimpan: ${error.error}`)
        return
      }

      // 3. Hitung konsistensi setelah save berhasil
      const n = kriteriaList.length
      if (n < 3) {
        alert("Minimal 3 kriteria untuk menghitung konsistensi")
        return
      }

      // Build matrix array
      const matrixArray: number[][] = []
      for (let i = 0; i < n; i++) {
        const row: number[] = []
        for (let j = 0; j < n; j++) {
          row.push(getMatrixValue(kriteriaList[i].id, kriteriaList[j].id))
        }
        matrixArray.push(row)
      }

      // Calculate column sums
      const columnSums = Array(n).fill(0)
      for (let j = 0; j < n; j++) {
        for (let i = 0; i < n; i++) {
          columnSums[j] += matrixArray[i][j]
        }
      }

      // Normalize matrix
      const normalized: number[][] = []
      for (let i = 0; i < n; i++) {
        const row: number[] = []
        for (let j = 0; j < n; j++) {
          row.push(matrixArray[i][j] / columnSums[j])
        }
        normalized.push(row)
      }

      // Calculate priority vector (average of rows)
      const priorityVector = normalized.map(row => 
        row.reduce((sum, val) => sum + val, 0) / n
      )

      // Calculate lambda max (matrix × priority vector)
      const weightedSum = matrixArray.map((row) => 
        row.reduce((sum, val, j) => sum + val * priorityVector[j], 0)
      )
      const lambdaMax = weightedSum.reduce((sum, val, i) => 
        sum + val / priorityVector[i], 0
      ) / n

      // Calculate CI and CR
      const ci = (lambdaMax - n) / (n - 1)
      const ri = [0, 0, 0.58, 0.90, 1.12, 1.24, 1.32, 1.41, 1.45, 1.49][n] || 1.49
      const cr = ci / ri

      setCalculationResult({
        matrixArray,
        columnSums,
        normalized,
        priorityVector,
        weightedSum,
        lambdaMax,
        ci,
        cr,
        n
      })

      // 4. Save bobot to database
      const bobotData = kriteriaList.map((kriteria, index) => ({
        kriteriaId: kriteria.id,
        bobot: priorityVector[index]
      }))

      await fetch("/api/ahp/bobot-kriteria", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bobot: bobotData })
      })

      alert("✅ Matrix berhasil disimpan dan konsistensi telah dihitung!")
      
    } catch (error) {
      console.error("Error:", error)
      alert("Terjadi kesalahan saat menyimpan dan menghitung")
    } finally {
      setSaving(false)
    }
  }

  const ahpScale = [
    { value: 1, label: "1 - Sama penting" },
    { value: 3, label: "3 - Sedikit lebih penting" },
    { value: 5, label: "5 - Lebih penting" },
    { value: 7, label: "7 - Sangat lebih penting" },
    { value: 9, label: "9 - Mutlak lebih penting" },
  ]

  return (
    <div className="space-y-8">
      <div className="border-b pb-6">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          Perbandingan Kriteria (AHP)
        </h1>
        <p className="text-gray-600 mt-2 text-lg">
          Matriks perbandingan berpasangan menggunakan metode Analytical Hierarchy Process
        </p>
      </div>

      {/* AHP Scale Reference */}
      <Card className="border-2 bg-blue-50 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Info className="h-5 w-5 text-blue-600" />
            Skala Perbandingan AHP
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {ahpScale.map((scale) => (
              <div key={scale.value} className="bg-white p-3 rounded-lg border border-blue-200">
                <div className="font-bold text-blue-700 text-lg">{scale.value}</div>
                <div className="text-xs text-gray-600 mt-1">{scale.label}</div>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-3">
            Nilai 2, 4, 6, 8 untuk nilai antara. Nilai desimal (contoh: 1/3 = 0.333) untuk kebalikan perbandingan.
          </p>
        </CardContent>
      </Card>

      {loading ? (
        <Card className="border-2 bg-white">
          <CardContent className="p-8">
            <div className="text-center text-gray-500">Memuat data...</div>
          </CardContent>
        </Card>
      ) : kriteriaList.length === 0 ? (
        <Card className="border-2 bg-white">
          <CardContent className="p-8">
            <div className="text-center text-gray-500">
              Belum ada data kriteria. Silakan tambahkan kriteria terlebih dahulu.
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="border-2 bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl text-gray-900">
                <div className="p-2 rounded-lg bg-violet-100">
                  <GitCompare className="h-5 w-5 text-violet-600" />
                </div>
                Matriks Perbandingan Kriteria
              </CardTitle>
              <CardDescription className="text-base text-gray-600">
                Bandingkan setiap kriteria berpasangan (baris terhadap kolom)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border-2 border-gray-300 bg-gray-100 p-3 text-left font-semibold text-sm">
                        Kriteria
                      </th>
                      {kriteriaList.map((kriteria) => (
                        <th
                          key={kriteria.id}
                          className="border-2 border-gray-300 bg-violet-100 p-3 text-center font-semibold text-sm min-w-[100px]"
                        >
                          <div>{kriteria.kode}</div>
                          <div className="text-xs font-normal text-gray-600 mt-1">
                            {kriteria.nama.length > 15 
                              ? kriteria.nama.substring(0, 15) + '...' 
                              : kriteria.nama}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {kriteriaList.map((kriteriaA, i) => (
                      <tr key={kriteriaA.id}>
                        <td className="border-2 border-gray-300 bg-violet-100 p-3 font-semibold text-sm">
                          <div>{kriteriaA.kode}</div>
                          <div className="text-xs font-normal text-gray-600 mt-1">
                            {kriteriaA.nama.length > 20 
                              ? kriteriaA.nama.substring(0, 20) + '...' 
                              : kriteriaA.nama}
                          </div>
                        </td>
                        {kriteriaList.map((kriteriaB, j) => {
                          const value = getMatrixValue(kriteriaA.id, kriteriaB.id)
                          const isEditable = i < j // Only edit upper triangle
                          const isDiagonal = i === j

                          return (
                            <td
                              key={kriteriaB.id}
                              className={`border-2 border-gray-300 p-2 ${
                                isDiagonal 
                                  ? 'bg-gray-200' 
                                  : isEditable 
                                    ? 'bg-white' 
                                    : 'bg-gray-50'
                              }`}
                            >
                              {isDiagonal ? (
                                <div className="text-center font-bold text-gray-700">1</div>
                              ) : isEditable ? (
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0.111"
                                  max="9"
                                  value={value}
                                  onChange={(e) => handleMatrixChange(kriteriaA.id, kriteriaB.id, e.target.value)}
                                  onBlur={() => handleInputBlur(kriteriaA.id, kriteriaB.id)}
                                  className="text-center font-semibold border-violet-300 focus:border-violet-500"
                                />
                              ) : (
                                <div className="text-center font-semibold text-gray-600">
                                  {value.toFixed(3)}
                                </div>
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6">
                <Button
                  onClick={handleSaveAndCalculate}
                  disabled={saving}
                  className="bg-violet-600 hover:bg-violet-700"
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  {saving ? "Memproses..." : "Hitung Konsistensi"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {calculationResult && (
            <>
              {/* Matriks Normalisasi */}
              <Card className="border-2 bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl text-gray-900">
                    <div className="p-2 rounded-lg bg-blue-100">
                      <Calculator className="h-5 w-5 text-blue-600" />
                    </div>
                    Matriks Normalisasi
                  </CardTitle>
                  <CardDescription className="text-base text-gray-600">
                    Normalisasi dengan jumlah kolom
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr>
                          <th className="border-2 border-gray-300 bg-gray-100 p-3 text-left font-semibold text-sm">
                            Kriteria
                          </th>
                          {kriteriaList.map((kriteria) => (
                            <th
                              key={kriteria.id}
                              className="border-2 border-gray-300 bg-blue-100 p-3 text-center font-semibold text-sm min-w-[120px]"
                            >
                              {kriteria.kode}
                            </th>
                          ))}
                          <th className="border-2 border-gray-300 bg-green-100 p-3 text-center font-semibold text-sm min-w-[120px]">
                            Rata-rata
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {kriteriaList.map((kriteria, i) => (
                          <tr key={kriteria.id}>
                            <td className="border-2 border-gray-300 bg-blue-100 p-3 font-semibold text-sm">
                              {kriteria.kode}
                            </td>
                            {calculationResult.normalized[i].map((value, j) => (
                              <td
                                key={j}
                                className="border-2 border-gray-300 bg-white p-3 text-center font-mono text-sm"
                              >
                                {value.toFixed(4)}
                              </td>
                            ))}
                            <td className="border-2 border-gray-300 bg-green-50 p-3 text-center font-bold text-sm">
                              {calculationResult.priorityVector[i].toFixed(4)}
                            </td>
                          </tr>
                        ))}
                        <tr>
                          <td className="border-2 border-gray-300 bg-gray-200 p-3 font-bold text-sm">
                            Jumlah
                          </td>
                          {calculationResult.columnSums.map((sum, j) => (
                            <td
                              key={j}
                              className="border-2 border-gray-300 bg-gray-100 p-3 text-center font-bold text-sm"
                            >
                              1.0000
                            </td>
                          ))}
                          <td className="border-2 border-gray-300 bg-green-100 p-3 text-center font-bold text-sm">
                            {calculationResult.priorityVector.reduce((a, b) => a + b, 0).toFixed(4)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Perkalian Matriks */}
              <Card className="border-2 bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl text-gray-900">
                    <div className="p-2 rounded-lg bg-purple-100">
                      <Calculator className="h-5 w-5 text-purple-600" />
                    </div>
                    Perkalian Matriks × Bobot
                  </CardTitle>
                  <CardDescription className="text-base text-gray-600">
                    Matriks perbandingan × Priority Vector
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {kriteriaList.map((kriteria, i) => (
                      <div key={kriteria.id} className="bg-gray-50 p-4 rounded-lg border-2 border-gray-300">
                        <div className="font-semibold text-gray-700 mb-2">{kriteria.kode} - {kriteria.nama}</div>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Bobot:</span>
                            <span className="font-mono font-bold">{calculationResult.priorityVector[i].toFixed(6)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Weighted Sum:</span>
                            <span className="font-mono">{calculationResult.weightedSum[i].toFixed(6)}</span>
                          </div>
                          <div className="flex justify-between border-t pt-1">
                            <span className="text-gray-600">Rasio:</span>
                            <span className="font-mono">{(calculationResult.weightedSum[i] / calculationResult.priorityVector[i]).toFixed(6)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Uji Konsistensi */}
              <Card className={`border-2 ${calculationResult.cr <= 0.1 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {calculationResult.cr <= 0.1 ? (
                      <Info className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    )}
                    Hasil Uji Konsistensi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="bg-white p-4 rounded-lg border border-gray-300">
                      <div className="text-sm text-gray-600">n (Jumlah Kriteria)</div>
                      <div className="text-2xl font-bold text-gray-900 mt-1">
                        {calculationResult.n}
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-300">
                      <div className="text-sm text-gray-600">λ max (Lambda Max)</div>
                      <div className="text-2xl font-bold text-gray-900 mt-1">
                        {calculationResult.lambdaMax.toFixed(6)}
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-300">
                      <div className="text-sm text-gray-600">CI (Consistency Index)</div>
                      <div className="text-2xl font-bold text-gray-900 mt-1">
                        {calculationResult.ci.toFixed(6)}
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-300">
                      <div className="text-sm text-gray-600">CR (Consistency Ratio)</div>
                      <div className="text-2xl font-bold text-gray-900 mt-1">
                        {calculationResult.cr.toFixed(6)}
                      </div>
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg border-2 ${
                    calculationResult.cr <= 0.1 
                      ? 'bg-green-100 border-green-300' 
                      : 'bg-red-100 border-red-300'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`text-3xl font-bold ${
                        calculationResult.cr <= 0.1 ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {calculationResult.cr <= 0.1 ? '✓' : '✗'}
                      </div>
                      <div>
                        <div className={`text-lg font-bold ${
                          calculationResult.cr <= 0.1 ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {calculationResult.cr <= 0.1 ? 'Matriks Konsisten' : 'Matriks Tidak Konsisten'}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {calculationResult.cr <= 0.1 
                            ? `CR = ${calculationResult.cr.toFixed(4)} ≤ 0.1 (Matriks dapat diterima)`
                            : `CR = ${calculationResult.cr.toFixed(4)} > 0.1 (Perlu revisi perbandingan)`}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-sm text-gray-700">
                      <strong>Rumus:</strong><br/>
                      CI = (λmax - n) / (n - 1)<br/>
                      CR = CI / RI, dimana RI = {[0, 0, 0.58, 0.90, 1.12, 1.24, 1.32, 1.41, 1.45, 1.49][calculationResult.n]}<br/>
                      <strong>Konsisten jika CR ≤ 0.1</strong>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Hasil Bobot Kriteria */}
              <Card className="border-2 bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl text-gray-900">
                    <div className="p-2 rounded-lg bg-amber-100">
                      <Calculator className="h-5 w-5 text-amber-600" />
                    </div>
                    Hasil Bobot Kriteria
                  </CardTitle>
                  <CardDescription className="text-base text-gray-600">
                    Nilai bobot akhir untuk setiap kriteria (Priority Vector)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr>
                          <th className="border-2 border-gray-300 bg-gray-100 p-3 text-left font-semibold">
                            Kriteria
                          </th>
                          <th className="border-2 border-gray-300 bg-gray-100 p-3 text-left font-semibold">
                            Nama
                          </th>
                          <th className="border-2 border-gray-300 bg-gray-100 p-3 text-center font-semibold">
                            Bobot
                          </th>
                          <th className="border-2 border-gray-300 bg-gray-100 p-3 text-center font-semibold">
                            Persentase
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {kriteriaList.map((kriteria, i) => (
                          <tr key={kriteria.id}>
                            <td className="border-2 border-gray-300 p-3 font-semibold">
                              {kriteria.kode}
                            </td>
                            <td className="border-2 border-gray-300 p-3">
                              {kriteria.nama}
                            </td>
                            <td className="border-2 border-gray-300 p-3 text-center font-mono font-bold text-lg">
                              {calculationResult.priorityVector[i].toFixed(6)}
                            </td>
                            <td className="border-2 border-gray-300 p-3 text-center font-bold text-lg text-blue-600">
                              {(calculationResult.priorityVector[i] * 100).toFixed(2)}%
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-gray-100">
                          <td colSpan={2} className="border-2 border-gray-300 p-3 font-bold text-right">
                            TOTAL
                          </td>
                          <td className="border-2 border-gray-300 p-3 text-center font-bold text-lg">
                            {calculationResult.priorityVector.reduce((a, b) => a + b, 0).toFixed(6)}
                          </td>
                          <td className="border-2 border-gray-300 p-3 text-center font-bold text-lg text-blue-600">
                            100.00%
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </>
      )}
    </div>
  )
}
