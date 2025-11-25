"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, GitCompare, TrendingDown, Layers, Trophy, Activity } from "lucide-react"

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
  const containerRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    if (containerRef.current) {
      gsap.from(containerRef.current.querySelector("h1"), {
        y: -30,
        opacity: 0,
        duration: 0.6,
        ease: "power3.out"
      })
    }

    cardsRef.current.forEach((card, index) => {
      if (card) {
        gsap.from(card, {
          y: 50,
          opacity: 0,
          duration: 0.5,
          delay: 0.1 + index * 0.1,
          ease: "power2.out"
        })
      }
    })
  }, [])

  return (
    <div ref={containerRef} className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight from-blue-600 to-violet-600 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">
          Sistem Pendukung Keputusan Penilaian Kinerja Karyawan
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card 
              key={stat.title}
              ref={(el) => { cardsRef.current[index] = el }}
              className="overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`rounded-lg ${stat.color} p-2`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Data terkini
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Aktivitas Terkini
            </CardTitle>
            <CardDescription>
              Ringkasan aktivitas sistem
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Belum ada aktivitas
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Peringkat Teratas
            </CardTitle>
            <CardDescription>
              Karyawan dengan kinerja terbaik
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Data belum tersedia
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

