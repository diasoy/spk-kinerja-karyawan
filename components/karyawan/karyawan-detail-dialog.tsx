"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Briefcase, 
  MapPin, 
  GraduationCap,
  UserCheck,
  UserX
} from "lucide-react"
import { Badge } from "../ui/badge"

interface Karyawan {
  id: number
  kode: string
  nama: string | null
  jenisKelamin: "L" | "P" | null
  tanggalLahir: string | null
  jabatanId: number | null
  jabatan: {
    nama: string
    departemen: {
      nama: string
    } | null
  } | null
  status: string | null
  tanggalMasuk: string | null
  tanggalKeluar: string | null
  isAktif: boolean
  noHp: string | null
  email: string | null
  alamat: string | null
  pendidikanTerakhir: string | null
  catatan: string | null
}

interface KaryawanDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  karyawan: Karyawan | null
}

export function KaryawanDetailDialog({
  open,
  onOpenChange,
  karyawan,
}: KaryawanDetailDialogProps) {
  if (!karyawan) return null

  const formatDate = (date: string | null) => {
    if (!date) return "-"
    return new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      TETAP: "bg-green-100 text-green-700 border-green-200",
      KONTRAK: "bg-blue-100 text-blue-700 border-blue-200",
      MAGANG: "bg-yellow-100 text-yellow-700 border-yellow-200",
      PROBATION: "bg-orange-100 text-orange-700 border-orange-200",
    }
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-700 border-gray-200"
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <div className="p-3 rounded-lg bg-blue-100">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            Detail Karyawan
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <div className="bg-linear-to-r from-blue-50 to-violet-50 p-6 rounded-lg border-2 border-blue-100">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {karyawan.nama || "(Nama belum diisi)"}
                  </h2>
                  {karyawan.isAktif ? (
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      <UserCheck className="h-3 w-3 mr-1" />
                      Aktif
                    </Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-700 border-red-200">
                      <UserX className="h-3 w-3 mr-1" />
                      Tidak Aktif
                    </Badge>
                  )}
                </div>
                <p className="text-lg text-gray-600 font-medium">
                  Kode: {karyawan.kode}
                </p>
              </div>
              {karyawan.status && (
                <Badge className={getStatusBadge(karyawan.status)}>
                  {karyawan.status}
                </Badge>
              )}
            </div>
          </div>

          {/* Main Info Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Personal Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Informasi Pribadi
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Jenis Kelamin</p>
                    <p className="text-base font-medium text-gray-900">
                      {karyawan.jenisKelamin === "L" ? "Laki-laki" : karyawan.jenisKelamin === "P" ? "Perempuan" : "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Tanggal Lahir</p>
                    <p className="text-base font-medium text-gray-900">
                      {formatDate(karyawan.tanggalLahir)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <GraduationCap className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Pendidikan Terakhir</p>
                    <p className="text-base font-medium text-gray-900">
                      {karyawan.pendidikanTerakhir || "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Work Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Informasi Pekerjaan
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Briefcase className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Jabatan</p>
                    <p className="text-base font-medium text-gray-900">
                      {karyawan.jabatan?.nama || "-"}
                    </p>
                    {karyawan.jabatan?.departemen && (
                      <p className="text-sm text-gray-500">
                        {karyawan.jabatan.departemen.nama}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Tanggal Masuk</p>
                    <p className="text-base font-medium text-gray-900">
                      {formatDate(karyawan.tanggalMasuk)}
                    </p>
                  </div>
                </div>

                {karyawan.tanggalKeluar && (
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Tanggal Keluar</p>
                      <p className="text-base font-medium text-gray-900">
                        {formatDate(karyawan.tanggalKeluar)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Informasi Kontak
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">No. HP</p>
                  <p className="text-base font-medium text-gray-900">
                    {karyawan.noHp || "-"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-base font-medium text-gray-900">
                    {karyawan.email || "-"}
                  </p>
                </div>
              </div>
            </div>

            {karyawan.alamat && (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Alamat</p>
                  <p className="text-base font-medium text-gray-900">
                    {karyawan.alamat}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Catatan */}
          {karyawan.catatan && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Catatan
              </h3>
              <p className="text-base text-gray-700 bg-gray-50 p-4 rounded-lg">
                {karyawan.catatan}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
