"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingDown } from "lucide-react"

export default function GapPage() {

  return (
    <div className="space-y-8">
      <div className="border-b pb-6">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          Gap
        </h1>
        <p className="text-gray-600 mt-2 text-lg">
          Analisis gap antara nilai profil dengan nilai karyawan
        </p>
      </div>

      <Card className="border-2 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl text-gray-900">
            <div className="p-2 rounded-lg bg-red-100">
              <TrendingDown className="h-5 w-5 text-red-600" />
            </div>
            Perhitungan Gap
          </CardTitle>
          <CardDescription className="text-base text-gray-600">
            Selisih nilai karyawan dengan profil ideal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">
            Data perhitungan gap belum tersedia.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
