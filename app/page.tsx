"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, GitCompare, Layers, Trophy, Activity, TrendingUp, CheckCircle2 } from "lucide-react"
import Link from "next/link"

interface DashboardStats {
  totalKaryawan: number
  totalKriteria: number
  totalSubkriteria: number
  totalPenilaian: number
  karyawanAktif: number
  topKaryawan: Array<{
    kode: string
    nama: string
    skorTotal?: number
  }>
}

export default function Home() {
  const [stats, setStats] = useState<DashboardStats>({
    totalKaryawan: 0,
    totalKriteria: 0,
    totalSubkriteria: 0,
    totalPenilaian: 0,
    karyawanAktif: 0,
    topKaryawan: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [karyawanRes, kriteriaRes, subkriteriaRes, penilaianRes] = await Promise.all([
        fetch("/api/karyawan"),
        fetch("/api/kriteria"),
        fetch("/api/subkriteria"),
        fetch("/api/penilaian/batch")
      ])

      const karyawan = await karyawanRes.json()
      const kriteria = await kriteriaRes.json()
      const subkriteria = await subkriteriaRes.json()
      const penilaian = await penilaianRes.json()

      // Count unique karyawan with penilaian
      const karyawanWithPenilaian = new Set(penilaian.map((p: { karyawanId: number }) => p.karyawanId))

      setStats({
        totalKaryawan: karyawan.length,
        totalKriteria: kriteria.length,
        totalSubkriteria: subkriteria.length,
        totalPenilaian: karyawanWithPenilaian.size,
        karyawanAktif: karyawan.filter((k: { isAktif: boolean }) => k.isAktif).length,
        topKaryawan: karyawan.slice(0, 5) // Top 5 for now
      })
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: "Total Karyawan",
      value: stats.totalKaryawan.toString(),
      subtitle: `${stats.karyawanAktif} aktif`,
      icon: Users,
      color: "from-blue-500 to-blue-600",
      link: "/data-alternatif"
    },
    {
      title: "Kriteria",
      value: stats.totalKriteria.toString(),
      subtitle: `${stats.totalSubkriteria} subkriteria`,
      icon: GitCompare,
      color: "from-violet-500 to-violet-600",
      link: "/kriteria"
    },
    {
      title: "Data Penilaian",
      value: stats.totalPenilaian.toString(),
      subtitle: "Karyawan dinilai",
      icon: Layers,
      color: "from-pink-500 to-pink-600",
      link: "/gap"
    },
    {
      title: "Perangkingan",
      value: stats.topKaryawan.length.toString(),
      subtitle: "Tersedia",
      icon: Trophy,
      color: "from-amber-500 to-amber-600",
      link: "/perangkingan"
    }
  ]

  return (
    <div className="space-y-8">
      <div className="border-b pb-6">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          Dashboard
        </h1>
        <p className="text-gray-600 mt-2 text-lg">
          Sistem Pendukung Keputusan Penilaian Kinerja Karyawan - Profile Matching & AHP
        </p>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="overflow-hidden border-2 bg-white animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
                <div className="h-11 w-11 bg-gray-200 rounded-xl"></div>
              </CardHeader>
              <CardContent>
                <div className="h-9 w-16 bg-gray-300 rounded mb-2"></div>
                <div className="h-3 w-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => {
            const Icon = stat.icon
            return (
              <Link key={stat.title} href={stat.link}>
                <Card 
                  className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 bg-white cursor-pointer"
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
                      {stat.subtitle}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-2 bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl text-gray-900">
              <div className="p-2 rounded-lg bg-blue-100">
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
              Status Sistem
            </CardTitle>
            <CardDescription className="text-base text-gray-600">
              Ringkasan data sistem
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">Karyawan Aktif</span>
                </div>
                <span className="text-lg font-bold text-green-700">{stats.karyawanAktif}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">Total Penilaian</span>
                </div>
                <span className="text-lg font-bold text-blue-700">{stats.totalPenilaian}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-3">
                  <Layers className="h-5 w-5 text-purple-600" />
                  <span className="text-sm font-medium text-gray-700">Subkriteria</span>
                </div>
                <span className="text-lg font-bold text-purple-700">{stats.totalSubkriteria}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl text-gray-900">
              <div className="p-2 rounded-lg bg-amber-100">
                <Trophy className="h-5 w-5 text-amber-600" />
              </div>
              Karyawan Terdaftar
            </CardTitle>
            <CardDescription className="text-base text-gray-600">
              Daftar karyawan dalam sistem
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.topKaryawan.length > 0 ? (
              <div className="space-y-3">
                {stats.topKaryawan.map((karyawan, index) => (
                  <div 
                    key={karyawan.kode}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{karyawan.kode}</div>
                        <div className="text-sm text-gray-500">{karyawan.nama || '-'}</div>
                      </div>
                    </div>
                  </div>
                ))}
                <Link href="/data-alternatif">
                  <button className="w-full mt-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors">
                    Lihat Semua Karyawan →
                  </button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">Belum ada data karyawan</p>
                <Link href="/data-alternatif">
                  <button className="mt-3 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                    Tambah Karyawan
                  </button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
