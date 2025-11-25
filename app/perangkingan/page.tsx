"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy } from "lucide-react"

export default function PerangkinganPage() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      gsap.from(containerRef.current.children, {
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power3.out"
      })
    }
  }, [])

  return (
    <div ref={containerRef} className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
          Perangkingan
        </h1>
        <p className="text-muted-foreground mt-2">
          Hasil akhir perangkingan kinerja karyawan
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Ranking Karyawan
          </CardTitle>
          <CardDescription>
            Urutan karyawan berdasarkan nilai kinerja
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            Hasil perangkingan belum tersedia. Lakukan perhitungan terlebih dahulu.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
