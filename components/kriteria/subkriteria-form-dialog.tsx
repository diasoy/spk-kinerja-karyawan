"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Kriteria, Subkriteria, FaktorType } from "@/types/kriteria"

interface SubkriteriaFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subkriteria?: Subkriteria | null
  kriteriaList: Kriteria[]
  onSuccess: () => void
}

export function SubkriteriaFormDialog({
  open,
  onOpenChange,
  subkriteria,
  kriteriaList,
  onSuccess
}: SubkriteriaFormDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    kriteriaId: "",
    kode: "",
    nama: "",
    deskripsi: "",
    faktor: "CORE" as FaktorType,
    nilaiStandar: "3",
  })

  useEffect(() => {
    if (subkriteria) {
      setFormData({
        kriteriaId: subkriteria.kriteriaId.toString(),
        kode: subkriteria.kode,
        nama: subkriteria.nama,
        deskripsi: subkriteria.deskripsi || "",
        faktor: subkriteria.faktor,
        nilaiStandar: subkriteria.nilaiStandar.toString(),
      })
    } else {
      setFormData({
        kriteriaId: "",
        kode: "",
        nama: "",
        deskripsi: "",
        faktor: "CORE",
        nilaiStandar: "3",
      })
    }
  }, [subkriteria])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = subkriteria
        ? `/api/subkriteria/${subkriteria.id}`
        : "/api/subkriteria"
      
      const method = subkriteria ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          kriteriaId: parseInt(formData.kriteriaId),
          kode: formData.kode,
          nama: formData.nama,
          deskripsi: formData.deskripsi || null,
          faktor: formData.faktor,
          nilaiStandar: parseFloat(formData.nilaiStandar),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Server error:', errorData)
        throw new Error(errorData.error || "Failed to save subkriteria")
      }

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("Error saving subkriteria:", error)
      alert(`Gagal menyimpan data subkriteria: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {subkriteria ? "Edit Subkriteria" : "Tambah Subkriteria"}
          </DialogTitle>
          <DialogDescription>
            {subkriteria
              ? "Ubah data subkriteria yang sudah ada"
              : "Tambahkan subkriteria penilaian baru"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="kriteriaId">Kriteria *</Label>
            <select
              id="kriteriaId"
              required
              value={formData.kriteriaId}
              onChange={(e) =>
                setFormData({ ...formData, kriteriaId: e.target.value })
              }
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Pilih Kriteria</option>
              {kriteriaList.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.kode} - {k.nama}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="kode">Kode *</Label>
            <Input
              id="kode"
              required
              value={formData.kode}
              onChange={(e) =>
                setFormData({ ...formData, kode: e.target.value })
              }
              placeholder="KRT01"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nama">Nama Subkriteria *</Label>
            <Input
              id="nama"
              required
              value={formData.nama}
              onChange={(e) =>
                setFormData({ ...formData, nama: e.target.value })
              }
              placeholder="Tanggung jawab"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="faktor">Faktor *</Label>
              <select
                id="faktor"
                required
                value={formData.faktor}
                onChange={(e) =>
                  setFormData({ ...formData, faktor: e.target.value as FaktorType })
                }
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="CORE">Core Factor</option>
                <option value="SECONDARY">Secondary Factor</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nilaiStandar">Nilai Standar (1-5) *</Label>
              <Input
                id="nilaiStandar"
                type="number"
                min="1"
                max="5"
                step="0.1"
                required
                value={formData.nilaiStandar}
                onChange={(e) =>
                  setFormData({ ...formData, nilaiStandar: e.target.value })
                }
                placeholder="3"
              />
            </div>
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
              placeholder="Deskripsi subkriteria"
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
