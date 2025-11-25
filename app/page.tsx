"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, GitCompare, Layers, Trophy, Activity } from "lucide-react"

const stats = [
  {
    title: "Total Karyawan",
    value: "0",
    icon: Users,
    color: "from-blue-500 to-blue-600"
  },
  {
    title: "Kriteria",
    value: "0",
    icon: GitCompare,
    color: "from-violet-500 to-violet-600"
  },
  {
    title: "Aspek",
    value: "0",
    icon: Layers,
    color: "from-pink-500 to-pink-600"
  },
  {
    title: "Perangkingan",
    value: "0",
    icon: Trophy,
    color: "from-amber-500 to-amber-600"
  }
]

export default function Home() {
  return (
    <div className="space-y-8">
      <div className="border-b pb-6">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          Dashboard
        </h1>
        <p className="text-gray-600 mt-2 text-lg">
          Sistem Pendukung Keputusan Penilaian Kinerja Karyawan
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card 
              key={stat.title}
              className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 bg-white"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-gray-700">
                  {stat.title}
                </CardTitle>
                <div className={`rounded-xl bg-gradient-to-br ${stat.color} p-3 shadow-lg`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                <p className="text-sm text-gray-500 mt-2 font-medium">
                  Data terkini
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-2 bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl text-gray-900">
              <div className="p-2 rounded-lg bg-blue-100">
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
              Aktivitas Terkini
            </CardTitle>
            <CardDescription className="text-base text-gray-600">
              Ringkasan aktivitas sistem
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">
              Belum ada aktivitas
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl text-gray-900">
              <div className="p-2 rounded-lg bg-amber-100">
                <Trophy className="h-5 w-5 text-amber-600" />
              </div>
              Peringkat Teratas
            </CardTitle>
            <CardDescription className="text-base text-gray-600">
              Karyawan dengan kinerja terbaik
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">
              Data belum tersedia
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

