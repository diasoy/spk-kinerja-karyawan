"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Kriteria } from "@/types/kriteria"

interface KriteriaFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  kriteria?: Kriteria | null
  onSuccess: () => void
}

export function KriteriaFormDialog({
  open,
  onOpenChange,
  kriteria,
  onSuccess
}: KriteriaFormDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    kode: "",
    nama: "",
    deskripsi: "",
    urutan: "",
  })

  useEffect(() => {
    if (kriteria) {
      setFormData({
        kode: kriteria.kode,
        nama: kriteria.nama,
        deskripsi: kriteria.deskripsi || "",
        urutan: kriteria.urutan?.toString() || "",
      })
    } else {
      setFormData({
        kode: "",
        nama: "",
        deskripsi: "",
        urutan: "",
      })
    }
  }, [kriteria])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = kriteria
        ? `/api/kriteria/${kriteria.id}`
        : "/api/kriteria"
      
      const method = kriteria ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          kode: formData.kode,
          nama: formData.nama,
          deskripsi: formData.deskripsi || null,
          urutan: formData.urutan ? parseInt(formData.urutan) : null,
        }),
      })

      if (!response.ok) throw new Error("Failed to save kriteria")

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("Error saving kriteria:", error)
      alert("Gagal menyimpan data kriteria")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {kriteria ? "Edit Kriteria" : "Tambah Kriteria"}
          </DialogTitle>
          <DialogDescription>
            {kriteria
              ? "Ubah data kriteria yang sudah ada"
              : "Tambahkan kriteria penilaian baru"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="kode">Kode *</Label>
              <Input
                id="kode"
                required
                value={formData.kode}
                onChange={(e) =>
                  setFormData({ ...formData, kode: e.target.value })
                }
                placeholder="KRT1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="urutan">Urutan</Label>
              <Input
                id="urutan"
                type="number"
                value={formData.urutan}
                onChange={(e) =>
                  setFormData({ ...formData, urutan: e.target.value })
                }
                placeholder="1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nama">Nama Kriteria *</Label>
            <Input
              id="nama"
              required
              value={formData.nama}
              onChange={(e) =>
                setFormData({ ...formData, nama: e.target.value })
              }
              placeholder="Sikap"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deskripsi">Deskripsi</Label>
            <textarea
              id="deskripsi"
              value={formData.deskripsi}
              onChange={(e) =>
                setFormData({ ...formData, deskripsi: e.target.value })
              }
              className="flex min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="Deskripsi kriteria"
            />
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
