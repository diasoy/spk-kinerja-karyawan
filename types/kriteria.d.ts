export interface Kriteria {
  id: number
  kode: string
  nama: string
  deskripsi: string | null
  urutan: number | null
  subkriteria?: Subkriteria[]
}

export interface Subkriteria {
  id: number
  kriteriaId: number
  kriteria?: {
    kode: string
    nama: string
  }
  kode: string
  nama: string
  deskripsi: string | null
  faktor: FaktorType
  nilaiStandar: number
}

export type FaktorType = "CORE" | "SECONDARY"
