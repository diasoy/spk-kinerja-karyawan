"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { 
  Users, 
  GitCompare, 
  TrendingDown, 
  Layers, 
  Trophy,
  ChevronRight,
  LayoutDashboard
} from "lucide-react"
import { cn } from "@/lib/utils"

const menuItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard
  },
  {
    title: "Data Alternatif",
    href: "/data-alternatif",
    icon: Users
  },
  {
    title: "Perbandingan Kriteria",
    href: "/perbandingan-kriteria",
    icon: GitCompare
  },
  {
    title: "Gap",
    href: "/gap",
    icon: TrendingDown
  },
  {
    title: "Aspek",
    href: "/aspek",
    icon: Layers
  },
  {
    title: "Perangkingan",
    href: "/perangkingan",
    icon: Trophy
  }
]

export function Sidebar() {
  const pathname = usePathname()
  const sidebarRef = useRef<HTMLDivElement>(null)
  const menuItemsRef = useRef<(HTMLAnchorElement | null)[]>([])

  useEffect(() => {
    if (sidebarRef.current) {
      gsap.from(sidebarRef.current, {
        x: -300,
        opacity: 0,
        duration: 0.6,
        ease: "power3.out"
      })
    }

    menuItemsRef.current.forEach((item, index) => {
      if (item) {
        gsap.from(item, {
          x: -50,
          opacity: 0,
          duration: 0.4,
          delay: 0.1 + index * 0.05,
          ease: "power2.out"
        })
      }
    })
  }, [])

  return (
    <div
      ref={sidebarRef}
      className="flex h-screen w-64 flex-col border-r bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900"
    >
      {/* Header */}
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
          SPK Kinerja
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {menuItems.map((item, index) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              ref={(el) => { menuItemsRef.current[index] = el }}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-blue-50 dark:hover:bg-slate-800",
                isActive
                  ? "bg-gradient-to-r from-blue-500 to-violet-500 text-white shadow-md"
                  : "text-slate-700 dark:text-slate-300"
              )}
              onMouseEnter={(e) => {
                if (!isActive) {
                  gsap.to(e.currentTarget, {
                    x: 4,
                    duration: 0.2,
                    ease: "power2.out"
                  })
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  gsap.to(e.currentTarget, {
                    x: 0,
                    duration: 0.2,
                    ease: "power2.out"
                  })
                }
              }}
            >
              <Icon className={cn(
                "h-5 w-5 transition-transform",
                isActive ? "text-white" : "text-slate-500 group-hover:text-blue-600"
              )} />
              <span className="flex-1">{item.title}</span>
              {isActive && (
                <ChevronRight className="h-4 w-4" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t p-4">
        <div className="rounded-lg bg-gradient-to-br from-blue-50 to-violet-50 dark:from-slate-800 dark:to-slate-900 p-3">
          <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Sistem Pendukung Keputusan
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
            Penilaian Kinerja Karyawan
          </p>
        </div>
      </div>
    </div>
  )
}
