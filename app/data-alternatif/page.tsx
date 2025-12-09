/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  UserCheck,
  UserX,
  Eye,
  ClipboardCheck,
  Upload,
  Download,
} from "lucide-react";
import { KaryawanFormDialog } from "@/components/karyawan/karyawan-form-dialog";
import { KaryawanDetailDialog } from "@/components/karyawan/karyawan-detail-dialog";
import { Karyawan } from "@/types/karyawan";
import { Jabatan } from "@/types/jabatan";
import { Subkriteria } from "@/types/kriteria";
import Link from "next/link";

interface PenilaianData {
  karyawanId: number
  [subkriteriaId: string]: number | string
}

export default function DataAlternatifPage() {
  const [karyawanList, setKaryawanList] = useState<Karyawan[]>([]);
  const [jabatanList, setJabatanList] = useState<Jabatan[]>([]);
  const [subkriteriaList, setSubkriteriaList] = useState<Subkriteria[]>([]);
  const [penilaianData, setPenilaianData] = useState<PenilaianData[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedKaryawan, setSelectedKaryawan] = useState<Karyawan | null>(
    null
  );

  const fetchKaryawan = async () => {
    try {
      const response = await fetch("/api/karyawan");
      if (response.ok) {
        const data = await response.json();
        setKaryawanList(data);
      }
    } catch (error) {
      console.error("Error fetching karyawan:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchJabatan = async () => {
    try {
      const response = await fetch("/api/jabatan");
      if (response.ok) {
        const data = await response.json();
        setJabatanList(data);
      }
    } catch (error) {
      console.error("Error fetching jabatan:", error);
    }
  };

  useEffect(() => {
    fetchKaryawan();
    fetchJabatan();
    fetchSubkriteria();
  }, []);

  const fetchSubkriteria = async () => {
    try {
      const response = await fetch("/api/subkriteria");
      if (response.ok) {
        const data = await response.json();
        setSubkriteriaList(data);
        
        // Fetch existing penilaian data
        const penilaianRes = await fetch("/api/penilaian/batch");
        if (penilaianRes.ok) {
          const penilaian = await penilaianRes.json();
          
          // Initialize penilaian data with existing values or defaults
          const initialData = karyawanList.map((k) => {
            const pData: PenilaianData = { karyawanId: k.id }
            const karyawanPenilaian = penilaian.find((p: any) => p.karyawanId === k.id)
            
            data.forEach((sub: Subkriteria) => {
              const detail = karyawanPenilaian?.detail.find((d: any) => d.subkriteriaId === sub.id)
              pData[`sub_${sub.id}`] = detail?.nilaiAktual || sub.nilaiStandar || 3
            })
            return pData
          })
          setPenilaianData(initialData)
        } else {
          // Initialize with default values if no penilaian data exists
          const initialData = karyawanList.map((k) => {
            const pData: PenilaianData = { karyawanId: k.id }
            data.forEach((sub: Subkriteria) => {
              pData[`sub_${sub.id}`] = sub.nilaiStandar || 3
            })
            return pData
          })
          setPenilaianData(initialData)
        }
      }
    } catch (error) {
      console.error("Error fetching subkriteria:", error);
    }
  };

  useEffect(() => {
    if (karyawanList.length > 0 && subkriteriaList.length > 0) {
      fetchPenilaianData()
    }
  }, [karyawanList, subkriteriaList]);

  const handleImportExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setImporting(true)
    try {
      // Re-fetch data to ensure we have the latest
      const [karyawanRes, subkriteriaRes, jabatanRes] = await Promise.all([
        fetch("/api/karyawan"),
        fetch("/api/subkriteria"),
        fetch("/api/jabatan")
      ])

      const freshKaryawan = await karyawanRes.json()
      const freshSubkriteria = await subkriteriaRes.json()
      const freshJabatan = await jabatanRes.json()

      console.log('=== IMPORT DEBUG ===')
      console.log('Fresh karyawan count:', freshKaryawan.length)
      console.log('Fresh subkriteria count:', freshSubkriteria.length)

      if (freshSubkriteria.length === 0) {
        toast.warning('Data Subkriteria Belum Ada', {
          description: 'Silakan setup kriteria terlebih dahulu sebelum import data'
        })
        return
      }

      const text = await file.text()
      // Handle different line endings (Windows \r\n, Unix \n, Mac \r)
      const lines = text.split(/\r?\n/).filter(line => line.trim())
      
      if (lines.length < 2) {
        toast.warning('File CSV Kosong', {
          description: 'File tidak memiliki data atau hanya berisi header'
        })
        return
      }

      // Parse CSV header
      const headers = lines[0].split(',').map(h => h.trim())
      
      console.log('CSV Headers:', headers)
      console.log('Total subkriteria:', freshSubkriteria.length)
      
      // Sort subkriteria by kriteria urutan and kode for consistent ordering
      const sortedSubkriteria = [...freshSubkriteria].sort((a, b) => {
        const urA = a.kriteria?.urutan || 0
        const urB = b.kriteria?.urutan || 0
        if (urA !== urB) return urA - urB
        return a.id - b.id
      })
      
      console.log('Subkriteria order:', sortedSubkriteria.map(s => `${s.id}: ${s.kriteria?.kode}_${s.kode}`).join(', '))
      
      // Create a map of karyawan by code for quick lookup
      const karyawanMap = new Map<string, Karyawan>(freshKaryawan.map((k: Karyawan) => [k.kode.toLowerCase(), k]))
      
      // Process import data
      const importData: PenilaianData[] = []
      const skippedRows: string[] = []
      const newKaryawanCodes: string[] = []
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim())
        
        // First column is karyawan code
        const karyawanCode = values[0]?.trim()
        if (!karyawanCode) {
          skippedRows.push(`Baris ${i + 1}: Kode karyawan kosong`)
          continue
        }

        console.log(`\n--- Row ${i + 1}: ${karyawanCode} ---`)
        
        // Check if karyawan exists
        let karyawan = karyawanMap.get(karyawanCode.toLowerCase())
        
        // If karyawan doesn't exist, create it
        if (!karyawan) {
          console.log(`Creating new karyawan: ${karyawanCode}`)
          
          const defaultJabatan = freshJabatan.length > 0 ? freshJabatan[0] : null
          
          const createResponse = await fetch("/api/karyawan", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              kode: karyawanCode,
              nama: karyawanCode,
              jabatanId: defaultJabatan?.id || null,
              status: "TETAP",
              isAktif: true
            })
          })
          
          if (createResponse.ok) {
            const newKaryawan = await createResponse.json()
            karyawanMap.set(karyawanCode.toLowerCase(), newKaryawan)
            newKaryawanCodes.push(karyawanCode)
            karyawan = newKaryawan
            console.log(`Created karyawan ID: ${newKaryawan.id}`)
          } else {
            const error = await createResponse.json()
            console.error(`Failed to create karyawan ${karyawanCode}:`, error)
            skippedRows.push(`Baris ${i + 1}: Gagal membuat karyawan ${karyawanCode}`)
            continue
          }
        }

        if (!karyawan) {
          skippedRows.push(`Baris ${i + 1}: Karyawan ${karyawanCode} tidak dapat diproses`)
          continue
        }

        const pData: PenilaianData = {
          karyawanId: karyawan.id
        }

        // Map values by position (column 1 onwards = nilai untuk setiap subkriteria)
        let hasValidData = false
        let mappedColumns = 0
        
        sortedSubkriteria.forEach((sub: Subkriteria, index: number) => {
          // values[0] is karyawan code, values[1] onwards are nilai
          const value = values[index + 1]
          
          if (value !== undefined && value !== null && value !== '') {
            const numValue = parseInt(value)
            if (!isNaN(numValue) && numValue >= 1 && numValue <= 5) {
              pData[`sub_${sub.id}`] = numValue
              hasValidData = true
              mappedColumns++
            }
          }
        })

        console.log(`Mapped ${mappedColumns}/${sortedSubkriteria.length} columns for ${karyawanCode}`)

        if (hasValidData) {
          importData.push(pData)
        } else {
          skippedRows.push(`Baris ${i + 1}: ${karyawanCode} - tidak ada nilai valid`)
        }
      }

      console.log('Final import data:', importData)
      console.log('Total valid rows:', importData.length)
      console.log('Skipped rows:', skippedRows)

      if (importData.length === 0) {
        toast.error('Tidak Ada Data Valid', {
          description: skippedRows.length > 0 
            ? `${skippedRows.slice(0, 3).join(', ')}${skippedRows.length > 3 ? '...' : ''}`
            : 'Tidak ada data valid untuk diimport'
        })
        return
      }

      // Save imported data
      const response = await fetch("/api/penilaian/batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          penilaianData: importData
        }),
      })

      if (response.ok) {
        toast.success('Import Data Berhasil!', {
          description: newKaryawanCodes.length > 0
            ? `${importData.length} data berhasil diimport. Karyawan baru: ${newKaryawanCodes.join(', ')}`
            : `${importData.length} data karyawan berhasil diimport`,
          duration: 5000
        })
        await fetchKaryawan() // Refresh karyawan list
        fetchPenilaianData()
      } else {
        const error = await response.json()
        toast.error('Gagal Import Data', {
          description: error.error
        })
      }
    } catch (error) {
      console.error("Error importing:", error)
      toast.error('Terjadi Kesalahan', {
        description: 'Gagal melakukan import data'
      })
    } finally {
      setImporting(false)
      // Reset input
      event.target.value = ''
    }
  }

  const handleDownloadTemplate = () => {
    // Create CSV content
    let csvContent = ''
    
    // Header row
    const headers = ['Alternatif']
    
    // Add subkriteria columns grouped by kriteria
    const groupedSubs = subkriteriaList.reduce((acc, sub) => {
      const kriteriaKode = sub.kriteria?.kode || 'Unknown'
      if (!acc[kriteriaKode]) acc[kriteriaKode] = []
      acc[kriteriaKode].push(sub)
      return acc
    }, {} as Record<string, Subkriteria[]>)

    Object.entries(groupedSubs).forEach(([kriteriaKode, subs]) => {
      subs.forEach((sub) => {
        headers.push(`${kriteriaKode}_${sub.kode}`)
      })
    })
    
    csvContent += headers.join(',') + '\n'
    
    // Add data rows for each karyawan
    karyawanList.forEach((karyawan) => {
      const row = [karyawan.kode]
      Object.values(groupedSubs).forEach((subs) => {
        subs.forEach((sub) => {
          row.push((sub.nilaiStandar || 3).toString())
        })
      })
      csvContent += row.join(',') + '\n'
    })

    // Create and download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'Template_Import_Penilaian.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const fetchPenilaianData = async () => {
    try {
      const penilaianRes = await fetch("/api/penilaian/batch");
      if (penilaianRes.ok) {
        const penilaian = await penilaianRes.json();
        
        const initialData = karyawanList.map((k) => {
          const pData: PenilaianData = { karyawanId: k.id }
          const karyawanPenilaian = penilaian.find((p: { karyawanId: number }) => p.karyawanId === k.id)
          
          subkriteriaList.forEach((sub) => {
            const detail = karyawanPenilaian?.detail.find((d: { subkriteriaId: number; nilaiAktual: number }) => d.subkriteriaId === sub.id)
            pData[`sub_${sub.id}`] = detail?.nilaiAktual || sub.nilaiStandar || 3
          })
          return pData
        })
        setPenilaianData(initialData)
      } else {
        // Initialize with default values if no penilaian data exists
        const initialData = karyawanList.map((k) => {
          const pData: PenilaianData = { karyawanId: k.id }
          subkriteriaList.forEach((sub) => {
            pData[`sub_${sub.id}`] = sub.nilaiStandar || 3
          })
          return pData
        })
        setPenilaianData(initialData)
      }
    } catch (error) {
      console.error("Error fetching penilaian data:", error);
    }
  }

  const handleAdd = () => {
    setSelectedKaryawan(null);
    setDialogOpen(true);
  };

  const handleEdit = (karyawan: Karyawan) => {
    setSelectedKaryawan(karyawan);
    setDialogOpen(true);
  };

  const handleDetail = (karyawan: Karyawan) => {
    setSelectedKaryawan(karyawan);
    setDetailDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus karyawan ini? Data penilaian terkait juga akan dihapus.")) return;

    try {
      const response = await fetch(`/api/karyawan/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success('Karyawan Berhasil Dihapus', {
          description: 'Data karyawan dan penilaian terkait telah dihapus'
        });
        fetchKaryawan();
        fetchPenilaianData();
      } else {
        const error = await response.json();
        toast.error('Gagal Menghapus Karyawan', {
          description: error.details || error.error
        });
      }
    } catch (error) {
      console.error("Error deleting karyawan:", error);
      toast.error('Terjadi Kesalahan', {
        description: 'Gagal menghapus karyawan'
      });
    }
  };

  // Group subkriteria by kriteria
  const groupedSubkriteria = subkriteriaList.reduce((acc, sub) => {
    const kriteriaKey = sub.kriteria?.kode || "Unknown"
    if (!acc[kriteriaKey]) {
      acc[kriteriaKey] = {
        nama: sub.kriteria?.nama || "Unknown",
        subkriteria: []
      }
    }
    acc[kriteriaKey].subkriteria.push(sub)
    return acc
  }, {} as Record<string, { nama: string; subkriteria: Subkriteria[] }>)

  const formatDate = (date: string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      TETAP: "bg-green-100 text-green-700",
      KONTRAK: "bg-blue-100 text-blue-700",
      MAGANG: "bg-yellow-100 text-yellow-700",
      PROBATION: "bg-orange-100 text-orange-700",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="space-y-8">
      <div className="border-b pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">
              Data Alternatif
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              Kelola data karyawan sebagai alternatif dalam sistem pendukung
              keputusan
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleDownloadTemplate}
              variant="outline"
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Download Template
            </Button>
            <Button
              onClick={() => document.getElementById('excel-import')?.click()}
              disabled={importing}
              variant="outline"
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              {importing ? "Mengimport..." : "Import CSV"}
            </Button>
            <input
              id="excel-import"
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleImportExcel}
            />
            <Button onClick={handleAdd} className="gap-2">
              <Plus className="h-4 w-4" />
              Tambah Karyawan
            </Button>
          </div>
        </div>
      </div>

      <Card className="border-2 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl text-gray-900">
            <div className="p-2 rounded-lg bg-blue-100">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            Daftar Karyawan
          </CardTitle>
          <CardDescription className="text-base text-gray-600">
            Total {karyawanList.length} karyawan terdaftar
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Memuat data...</div>
          ) : karyawanList.length === 0 ? (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
              Belum ada data karyawan. Klik tombol &quot;Tambah Karyawan&quot;
              untuk menambah data.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Kode
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Nama
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      JK
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Jabatan
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Tanggal Masuk
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Aktif
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {karyawanList.map((karyawan) => (
                    <tr
                      key={karyawan.id}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {karyawan.kode}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {karyawan.nama || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {karyawan.jenisKelamin === "L" ? "L" : karyawan.jenisKelamin === "P" ? "P" : "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {karyawan.jabatan?.nama || "-"}
                        {karyawan.jabatan?.departemen && (
                          <span className="text-xs text-gray-500 block">
                            {karyawan.jabatan.departemen.nama}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {karyawan.status ? (
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                              karyawan.status
                            )}`}
                          >
                            {karyawan.status}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {formatDate(karyawan.tanggalMasuk)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {karyawan.isAktif ? (
                          <UserCheck className="h-4 w-4 text-green-600" />
                        ) : (
                          <UserX className="h-4 w-4 text-red-600" />
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDetail(karyawan)}
                            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            title="Lihat Detail"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(karyawan)}
                            className="h-8 w-8 p-0"
                            title="Edit"
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(karyawan.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Hapus"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabel Penilaian */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3">
                <ClipboardCheck className="h-6 w-6" />
                Penilaian Karyawan
              </CardTitle>
              <CardDescription>
                Nilai karyawan untuk setiap subkriteria (Skala 1-5) - Readonly
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Link href="/gap">
                <Button variant="outline" className="gap-2">
                  <ClipboardCheck className="h-4 w-4" />
                  Isi Penilaian
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600 mb-4">
            {karyawanList.length} karyawan × {subkriteriaList.length} subkriteria
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="border-r-2 border-gray-300 px-4 py-3 text-left font-semibold w-24 bg-white">
                    Kode
                  </th>
                  <th className="border-r-2 border-gray-300 px-4 py-3 text-left font-semibold min-w-[200px] bg-white">
                    Nama Karyawan
                  </th>
                  {Object.entries(groupedSubkriteria).map(([kriteriaKode, { nama, subkriteria }]) => (
                    <th
                      key={kriteriaKode}
                      colSpan={subkriteria.length}
                      className="border-r border-gray-300 px-4 py-2 text-center font-semibold bg-gray-50"
                    >
                      {nama}
                    </th>
                  ))}
                </tr>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="border-r-2 border-gray-300 bg-gray-50"></th>
                  <th className="border-r-2 border-gray-300 bg-gray-50"></th>
                  {subkriteriaList.map((sub) => (
                    <th
                      key={sub.id}
                      className="border-r border-gray-200 px-2 py-3 text-xs font-medium text-center"
                      title={sub.nama}
                      style={{ minWidth: '120px' }}
                    >
                      <div className="flex flex-col items-center gap-1.5">
                        <span className="font-semibold text-center leading-tight block">
                          {sub.nama}
                        </span>
                        <div className="flex items-center gap-1.5 justify-center">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap ${
                            sub.faktor === 'CORE' 
                              ? 'bg-blue-100 text-blue-700' 
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {sub.faktor === 'CORE' ? 'C' : 'S'}
                          </span>
                          <span className="text-gray-500 text-[10px] whitespace-nowrap">
                            Std: {sub.nilaiStandar}
                          </span>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {penilaianData.map((data, index) => {
                  const karyawan = karyawanList.find(k => k.id === data.karyawanId)
                  return (
                    <tr
                      key={data.karyawanId}
                      className={`border-b border-gray-200 hover:bg-gray-50 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                      }`}
                    >
                      <td className="border-r-2 border-gray-300 px-4 py-2 font-medium bg-inherit">
                        {karyawan?.kode}
                      </td>
                      <td className="border-r-2 border-gray-300 px-4 py-2 bg-inherit">
                        {karyawan?.nama || "-"}
                      </td>
                      {subkriteriaList.map((sub) => (
                        <td
                          key={sub.id}
                          className="border-r border-gray-200 px-2 py-2 text-center"
                          style={{ minWidth: '120px' }}
                        >
                          <Input
                            type="number"
                            min="1"
                            max="5"
                            step="0.1"
                            value={data[`sub_${sub.id}`] || sub.nilaiStandar}
                            readOnly
                            className="w-full text-center h-8 px-2 bg-gray-50 cursor-not-allowed"
                          />
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <KaryawanFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        karyawan={selectedKaryawan}
        jabatanList={jabatanList}
        onSuccess={fetchKaryawan}
      />

      <KaryawanDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        karyawan={selectedKaryawan}
      />
    </div>
  );
}
