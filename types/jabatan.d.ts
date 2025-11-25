export interface Jabatan {
  id: number
  nama: string
  departemen: {
    nama: string
  } | null
}