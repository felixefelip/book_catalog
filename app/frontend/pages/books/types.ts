export interface Book {
  id: number
  title: string
  author_name: string
  published_year: number | null
  genres: string[]
  description: string | null
  cover_url: string | null
}

export type BookFormType = Omit<Book, 'id' | 'cover_url'> & {
  genre_names: string[]
  cover: File | null
  open_library_cover_id?: number
}

export type BookFilters = {
  title?: string
  author_name?: string
  genre?: string
  year_from?: string
  year_to?: string
}

export interface OpenLibraryBook {
  id: string
  title: string
  author_name: string
  published_year: number | null
  subjects: string[]
  cover_id: number | null
  cover_url: string | null
}
