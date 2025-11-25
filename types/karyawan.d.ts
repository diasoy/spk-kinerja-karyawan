export interface Karyawan {
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