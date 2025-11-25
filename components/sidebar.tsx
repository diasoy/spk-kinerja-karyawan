"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  Users, 
  GitCompare, 
  TrendingDown, 
  Layers, 
  Trophy,
  ChevronRight,
  LayoutDashboard,
  ListTree,
  ChartLine
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
    title: "Kriteria",
    href: "/kriteria",
    icon: ListTree
  },
  {
    title: "Gap",
    href: "/gap",
    icon: TrendingDown
  },
  {
    title: "Perbandingan",
    href: "/perbandingan-kriteria",
    icon: GitCompare
  },
  {
    title: "Aspek",
    href: "/aspek",
    icon: Layers
  },
  {
    title: "Perankingan",
    href: "/perankingan",
    icon: Trophy
  }
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div
      className="flex h-screen w-64 flex-col border-r bg-white shadow-lg"
    >
      {/* Header */}
      <div className="flex h-16 items-center border-b px-6 bg-gradient-to-r from-blue-600 to-violet-600">
        <h1 className="text-lg font-bold text-white">
          SPK Kinerja Karyawan
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4 bg-slate-50">
        {menuItems.map((item, index) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-md"
                  : "text-slate-700 hover:bg-white hover:shadow-sm"
              )}
            >
              <Icon className={cn(
                "h-5 w-5 transition-transform",
                isActive ? "text-white" : "text-slate-600 group-hover:text-blue-600"
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
      <div className="border-t p-4 bg-slate-50">
        <div className="rounded-lg bg-gradient-to-br from-blue-50 to-violet-50 p-4 border border-blue-200">
          <p className="text-xs font-semibold text-slate-700">
            Sistem Pendukung Keputusan
          </p>
          <p className="text-xs text-slate-600 mt-1">
            Penilaian Kinerja Karyawan
          </p>
        </div>
      </div>
    </div>
  )
}
