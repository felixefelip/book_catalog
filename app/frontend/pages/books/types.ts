export interface Book {
  id: number
  title: string
  author_name: string
  published_year: number | null
  genre: string
  description: string | null
  cover_url: string | null
}

export type BookFormType = Omit<Book, 'id' | 'cover_url'> & {
  cover: File | null
}

export type BookFilters = {
  title?: string
  author_name?: string
  genre?: string
  year_from?: string
  year_to?: string
}
