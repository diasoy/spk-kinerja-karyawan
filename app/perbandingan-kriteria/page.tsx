"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GitCompare } from "lucide-react"

export default function PerbandinganKriteriaPage() {

  return (
    <div className="space-y-8">
      <div className="border-b pb-6">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          Perbandingan Kriteria
        </h1>
        <p className="text-gray-600 mt-2 text-lg">
          Analisis perbandingan antar kriteria penilaian kinerja
        </p>
      </div>

      <Card className="border-2 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl text-gray-900">
            <div className="p-2 rounded-lg bg-violet-100">
              <GitCompare className="h-5 w-5 text-violet-600" />
            </div>
            Matriks Perbandingan
          </CardTitle>
          <CardDescription className="text-base text-gray-600">
            Perbandingan berpasangan antar kriteria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">
            Belum ada data kriteria. Silakan tambahkan kriteria terlebih dahulu.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
