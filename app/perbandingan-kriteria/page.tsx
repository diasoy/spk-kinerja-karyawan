"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GitCompare } from "lucide-react"

export default function PerbandinganKriteriaPage() {
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
          Perbandingan Kriteria
        </h1>
        <p className="text-muted-foreground mt-2">
          Analisis perbandingan antar kriteria penilaian kinerja
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitCompare className="h-5 w-5" />
            Matriks Perbandingan
          </CardTitle>
          <CardDescription>
            Perbandingan berpasangan antar kriteria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            Belum ada data kriteria. Silakan tambahkan kriteria terlebih dahulu.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
