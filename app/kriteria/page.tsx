"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Layers, Plus, Pencil, Trash2 } from "lucide-react"
import { KriteriaFormDialog } from "@/components/kriteria/kriteria-form-dialog"
import { SubkriteriaFormDialog } from "@/components/kriteria/subkriteria-form-dialog"
import { Kriteria, Subkriteria } from "@/types/kriteria"

export default function KriteriaPage() {
  const [kriteriaList, setKriteriaList] = useState<Kriteria[]>([])
  const [loading, setLoading] = useState(true)
  const [kriteriaDialogOpen, setKriteriaDialogOpen] = useState(false)
  const [subkriteriaDialogOpen, setSubkriteriaDialogOpen] = useState(false)
  const [selectedKriteria, setSelectedKriteria] = useState<Kriteria | null>(null)
  const [selectedSubkriteria, setSelectedSubkriteria] = useState<Subkriteria | null>(null)

  const fetchKriteria = async () => {
    try {
      const response = await fetch("/api/kriteria")
      if (response.ok) {
        const data = await response.json()
        setKriteriaList(data)
      }
    } catch (error) {
      console.error("Error fetching kriteria:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchKriteria()
  }, [])

  const handleAddKriteria = () => {
    setSelectedKriteria(null)
    setKriteriaDialogOpen(true)
  }

  const handleEditKriteria = (kriteria: Kriteria) => {
    setSelectedKriteria(kriteria)
    setKriteriaDialogOpen(true)
  }

  const handleDeleteKriteria = async (kriteria: Kriteria) => {
    const subkriteriaCount = kriteria.subkriteria?.length || 0
    const message = subkriteriaCount > 0
      ? `Apakah Anda yakin ingin menghapus kriteria "${kriteria.nama}"?\n\nIni akan menghapus ${subkriteriaCount} subkriteria terkait.`
      : `Apakah Anda yakin ingin menghapus kriteria "${kriteria.nama}"?`
    
    if (!confirm(message)) return

    try {
      const response = await fetch(`/api/kriteria/${kriteria.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        const result = await response.json()
        if (result.deletedSubkriteria > 0) {
          alert(`Kriteria berhasil dihapus bersama ${result.deletedSubkriteria} subkriteria`)
        }
        fetchKriteria()
      } else {
        alert("Gagal menghapus kriteria")
      }
    } catch (error) {
      console.error("Error deleting kriteria:", error)
      alert("Terjadi kesalahan saat menghapus kriteria")
    }
  }

  const handleAddSubkriteria = () => {
    setSelectedSubkriteria(null)
    setSubkriteriaDialogOpen(true)
  }

  const handleEditSubkriteria = (subkriteria: Subkriteria) => {
    setSelectedSubkriteria(subkriteria)
    setSubkriteriaDialogOpen(true)
  }

  const handleDeleteSubkriteria = async (subkriteriaId: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus subkriteria ini?')) return

    try {
      const response = await fetch(`/api/subkriteria/${subkriteriaId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchKriteria()
      } else {
        const errorData = await response.json()
        alert(errorData.error + (errorData.details ? '\n\n' + errorData.details : ''))
      }
    } catch (error) {
      console.error('Error deleting subkriteria:', error)
      alert('Terjadi kesalahan saat menghapus subkriteria')
    }
  }

  return (
    <div className="space-y-8">
      <div className="border-b pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">
              Kriteria & Subkriteria
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              Kelola kriteria dan subkriteria penilaian kinerja karyawan
            </p>
          </div>
          <Layers className="h-12 w-12 text-blue-600" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle>Kriteria</CardTitle>
              <CardDescription>Kriteria penilaian utama</CardDescription>
            </div>
            <Button onClick={handleAddKriteria} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Tambah
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : kriteriaList.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Belum ada data kriteria
              </div>
            ) : (
              <div className="space-y-2">
                {kriteriaList.map((kriteria) => (
                  <div
                    key={kriteria.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {kriteria.kode} - {kriteria.nama}
                      </div>
                      {kriteria.deskripsi && (
                        <div className="text-sm text-gray-500">
                          {kriteria.deskripsi}
                        </div>
                      )}
                      <div className="text-xs text-blue-600 mt-1">
                        {kriteria.subkriteria?.length || 0} subkriteria
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditKriteria(kriteria)}
                        className="h-8 w-8 p-0"
                        title="Edit"
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteKriteria(kriteria)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Hapus"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle>Subkriteria</CardTitle>
              <CardDescription>Detail kriteria penilaian</CardDescription>
            </div>
            <Button onClick={handleAddSubkriteria} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Tambah
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : kriteriaList.every(k => !k.subkriteria || k.subkriteria.length === 0) ? (
              <div className="text-center py-8 text-gray-500">
                Belum ada data subkriteria
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {kriteriaList.map((kriteria) => (
                  kriteria.subkriteria && kriteria.subkriteria.length > 0 && (
                    <div key={kriteria.id}>
                      <div className="font-medium text-sm text-gray-700 mb-2 px-2">
                        {kriteria.nama}
                      </div>
                      <div className="space-y-2">
                        {kriteria.subkriteria.map((sub) => (
                          <div
                            key={sub.id}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 text-sm">
                                {sub.kode} - {sub.nama}
                              </div>
                              {sub.deskripsi && (
                                <div className="text-xs text-gray-500">
                                  {sub.deskripsi}
                                </div>
                              )}
                              <div className="flex items-center gap-3 mt-1">
                                <span className={`text-xs px-2 py-0.5 rounded ${
                                  sub.faktor === 'CORE' 
                                    ? 'bg-blue-100 text-blue-700' 
                                    : 'bg-green-100 text-green-700'
                                }`}>
                                  {sub.faktor === 'CORE' ? 'Core Factor' : 'Secondary Factor'}
                                </span>
                                <span className="text-xs text-gray-600">
                                  Nilai Standar: {sub.nilaiStandar}
                                </span>
                                <span className="text-xs text-gray-500">
                                  Skala: 1-5
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditSubkriteria(sub)}
                                className="h-8 w-8 p-0"
                                title="Edit"
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteSubkriteria(sub.id)}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                title="Hapus"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <KriteriaFormDialog
        open={kriteriaDialogOpen}
        onOpenChange={setKriteriaDialogOpen}
        kriteria={selectedKriteria}
        onSuccess={fetchKriteria}
      />

      <SubkriteriaFormDialog
        open={subkriteriaDialogOpen}
        onOpenChange={setSubkriteriaDialogOpen}
        subkriteria={selectedSubkriteria}
        kriteriaList={kriteriaList}
        onSuccess={fetchKriteria}
      />
    </div>
  )
}
