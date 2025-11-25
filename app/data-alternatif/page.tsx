/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [karyawanList, subkriteriaList]);

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
    if (!confirm("Apakah Anda yakin ingin menghapus karyawan ini?")) return;

    try {
      const response = await fetch(`/api/karyawan/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchKaryawan();
      } else {
        alert("Gagal menghapus karyawan");
      }
    } catch (error) {
      console.error("Error deleting karyawan:", error);
      alert("Terjadi kesalahan saat menghapus karyawan");
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
