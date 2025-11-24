export interface Karyawan {
  id: string
  nip: string
  nama: string
  jabatan: string
  departemen: string
  nilaiKinerja: number
  createdAt: Date
  updatedAt: Date
}

export interface CreateKaryawanInput {
  nip: string
  nama: string
  jabatan: string
  departemen: string
  nilaiKinerja: number
}

export interface CreateKaryawanWithPenilaianInput {
  nip: string
  nama: string
  jabatan: string
  departemen: string
  penilaian: {
    subKriteriaId: string
    nilai: number
  }[]
}