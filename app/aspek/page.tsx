"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Layers } from "lucide-react"

export default function AspekPage() {

  return (
    <div className="space-y-8">
      <div className="border-b pb-6">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          Aspek
        </h1>
        <p className="text-gray-600 mt-2 text-lg">
          Kelola aspek-aspek penilaian kinerja karyawan
        </p>
      </div>

      <Card className="border-2 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl text-gray-900">
            <div className="p-2 rounded-lg bg-pink-100">
              <Layers className="h-5 w-5 text-pink-600" />
            </div>
            Daftar Aspek
          </CardTitle>
          <CardDescription className="text-base text-gray-600">
            Aspek-aspek yang digunakan dalam penilaian
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">
            Belum ada data aspek. Silakan tambahkan aspek penilaian.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
