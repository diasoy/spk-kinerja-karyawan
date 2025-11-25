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
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  UserCheck,
  UserX,
  Eye,
} from "lucide-react";
import { KaryawanFormDialog } from "@/components/karyawan-form-dialog";
import { KaryawanDetailDialog } from "@/components/karyawan-detail-dialog";
import { Karyawan } from "@/types/karyawan";
import { Jabatan } from "@/types/jabatan";
import Link from "next/link";

export default function DataAlternatifPage() {
  const [karyawanList, setKaryawanList] = useState<Karyawan[]>([]);
  const [jabatanList, setJabatanList] = useState<Jabatan[]>([]);
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
  }, []);

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
            <Link href="/data-alternatif/penilaian">
              <Button className="gap-2 bg-green-600 text-white hover:bg-green-700">
                <Pencil className="h-4 w-4" />
                Penilaian Karyawan
              </Button>
            </Link>
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
