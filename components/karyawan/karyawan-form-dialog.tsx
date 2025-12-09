"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

interface Karyawan {
  id: number
  kode: string
  nama: string | null
  jenisKelamin: "L" | "P" | null
  tanggalLahir: string | null
  jabatanId: number | null
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

interface Jabatan {
  id: number
  nama: string
  departemen: {
    nama: string
  } | null
}

interface KaryawanFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  karyawan?: Karyawan | null
  jabatanList: Jabatan[]
  onSuccess: () => void
}

export function KaryawanFormDialog({
  open,
  onOpenChange,
  karyawan,
  jabatanList,
  onSuccess
}: KaryawanFormDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<Partial<Karyawan>>({
    kode: "",
    nama: "",
    jenisKelamin: "L",
    status: "TETAP",
    isAktif: true,
  })

  // Helper function to format date for input type="date"
  const formatDateForInput = (dateString: string | null): string => {
    if (!dateString) return ""
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return ""
      return date.toISOString().split("T")[0]
    } catch {
      return ""
    }
  }

  // Update form data when karyawan changes
  useEffect(() => {
    if (karyawan) {
      setFormData({
        kode: karyawan.kode,
        nama: karyawan.nama,
        jenisKelamin: karyawan.jenisKelamin,
        tanggalLahir: karyawan.tanggalLahir,
        jabatanId: karyawan.jabatanId,
        status: karyawan.status,
        tanggalMasuk: karyawan.tanggalMasuk,
        tanggalKeluar: karyawan.tanggalKeluar,
        isAktif: karyawan.isAktif,
        noHp: karyawan.noHp,
        email: karyawan.email,
        alamat: karyawan.alamat,
        pendidikanTerakhir: karyawan.pendidikanTerakhir,
        catatan: karyawan.catatan,
      })
    } else {
      setFormData({
        kode: "",
        nama: "",
        jenisKelamin: "L",
        status: "TETAP",
        isAktif: true,
      })
    }
  }, [karyawan])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = karyawan
        ? `/api/karyawan/${karyawan.id}`
        : "/api/karyawan"
      
      const method = karyawan ? "PUT" : "POST"

      // Clean up formData - convert empty strings to null
      const cleanedData = {
        ...formData,
        nama: formData.nama || null,
        jenisKelamin: formData.jenisKelamin || null,
        tanggalLahir: formData.tanggalLahir || null,
        status: formData.status || null,
        tanggalMasuk: formData.tanggalMasuk || null,
        tanggalKeluar: formData.tanggalKeluar || null,
        noHp: formData.noHp || null,
        email: formData.email || null,
        alamat: formData.alamat || null,
        pendidikanTerakhir: formData.pendidikanTerakhir || null,
        catatan: formData.catatan || null,
      }

      console.log('Sending data:', cleanedData)

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cleanedData),
      })

      const responseData = await response.json()
      console.log('Response:', responseData)

      if (!response.ok) {
        console.error('Error response:', responseData)
        throw new Error(responseData.details?.message || "Failed to save karyawan")
      }

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("Error saving karyawan:", error)
      toast.error('Gagal Menyimpan Data Karyawan', {
        description: error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak diketahui'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {karyawan ? "Edit Karyawan" : "Tambah Karyawan"}
          </DialogTitle>
          <DialogDescription>
            {karyawan
              ? "Ubah data karyawan yang sudah ada"
              : "Tambahkan karyawan baru ke dalam sistem"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="kode">Kode Karyawan *</Label>
              <Input
                id="kode"
                required
                value={formData.kode}
                onChange={(e) =>
                  setFormData({ ...formData, kode: e.target.value })
                }
                placeholder="A01"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nama">Nama Lengkap</Label>
              <Input
                id="nama"
                value={formData.nama || ""}
                onChange={(e) =>
                  setFormData({ ...formData, nama: e.target.value || null })
                }
                placeholder="Nama karyawan"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="jenisKelamin">Jenis Kelamin</Label>
              <select
                id="jenisKelamin"
                value={formData.jenisKelamin || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    jenisKelamin: e.target.value ? (e.target.value as "L" | "P") : null,
                  })
                }
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Pilih Jenis Kelamin</option>
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tanggalLahir">Tanggal Lahir</Label>
              <Input
                id="tanggalLahir"
                type="date"
                value={formatDateForInput(formData.tanggalLahir || null)}
                onChange={(e) =>
                  setFormData({ ...formData, tanggalLahir: e.target.value || null })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="jabatanId">Jabatan</Label>
              <select
                id="jabatanId"
                value={formData.jabatanId || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    jabatanId: e.target.value ? parseInt(e.target.value) : null,
                  })
                }
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Pilih Jabatan</option>
                {jabatanList.map((jab) => (
                  <option key={jab.id} value={jab.id}>
                    {jab.nama} - {jab.departemen?.nama}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status Karyawan</Label>
              <select
                id="status"
                value={formData.status || ""}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value || null })
                }
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Pilih Status</option>
                <option value="TETAP">Tetap</option>
                <option value="KONTRAK">Kontrak</option>
                <option value="MAGANG">Magang</option>
                <option value="PROBATION">Probation</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tanggalMasuk">Tanggal Masuk</Label>
              <Input
                id="tanggalMasuk"
                type="date"
                value={formatDateForInput(formData.tanggalMasuk || null)}
                onChange={(e) =>
                  setFormData({ ...formData, tanggalMasuk: e.target.value || null })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tanggalKeluar">Tanggal Keluar</Label>
              <Input
                id="tanggalKeluar"
                type="date"
                value={formatDateForInput(formData.tanggalKeluar || null)}
                onChange={(e) =>
                  setFormData({ ...formData, tanggalKeluar: e.target.value || null })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="noHp">No. HP</Label>
              <Input
                id="noHp"
                type="tel"
                value={formData.noHp || ""}
                onChange={(e) =>
                  setFormData({ ...formData, noHp: e.target.value })
                }
                placeholder="08xxxxxxxxxx"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email || ""}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="email@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="alamat">Alamat</Label>
            <textarea
              id="alamat"
              value={formData.alamat || ""}
              onChange={(e) =>
                setFormData({ ...formData, alamat: e.target.value })
              }
              className="flex min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="Alamat lengkap"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pendidikanTerakhir">Pendidikan Terakhir</Label>
            <Input
              id="pendidikanTerakhir"
              value={formData.pendidikanTerakhir || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  pendidikanTerakhir: e.target.value,
                })
              }
              placeholder="S1, D3, SMA, dll"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="catatan">Catatan</Label>
            <textarea
              id="catatan"
              value={formData.catatan || ""}
              onChange={(e) =>
                setFormData({ ...formData, catatan: e.target.value })
              }
              className="flex min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="Catatan tambahan"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isAktif"
              checked={formData.isAktif}
              onChange={(e) =>
                setFormData({ ...formData, isAktif: e.target.checked })
              }
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="isAktif" className="cursor-pointer">
              Karyawan Aktif
            </Label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
