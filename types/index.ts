export interface Photo {
  id: string
  image_url: string
  story: string
  date_taken: string
  country: string
  year: number
  month: string
  upload_timestamp: string
  created_at?: string
}

export interface UploadFormData {
  file: File | null
  story: string
  dateTaken: string
  country: string
}

export type GroupBy = 'all' | 'country' | 'year' | 'month'

export interface GroupedPhotos {
  [key: string]: Photo[]
}

export interface User {
  id: string
  name: string
  email: string
}
