export interface SubKriteria {
  id: string
  kode: string
  namaSubKriteria: string
  faktor: string
  nilaiStandar: number
}

export interface Kriteria {
  id: string
  kode: string
  namaKriteria: string
  subKriteria: SubKriteria[]
}