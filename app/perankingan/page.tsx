"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy } from "lucide-react"

export default function PerangkinganPage() {

  return (
    <div className="space-y-8">
      <div className="border-b pb-6">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          Perangkingan
        </h1>
        <p className="text-gray-600 mt-2 text-lg">
          Hasil akhir perangkingan kinerja karyawan
        </p>
      </div>

      <Card className="border-2 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl text-gray-900">
            <div className="p-2 rounded-lg bg-amber-100">
              <Trophy className="h-5 w-5 text-amber-600" />
            </div>
            Ranking Karyawan
          </CardTitle>
          <CardDescription className="text-base text-gray-600">
            Urutan karyawan berdasarkan nilai kinerja
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">
            Hasil perangkingan belum tersedia. Lakukan perhitungan terlebih dahulu.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
