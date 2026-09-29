export interface Book {
  id: number
  title: string
  authors: string[]
  published_year: number | null
  genres: string[]
  description: string | null
  cover_url: string | null
  can: { update: boolean; destroy: boolean }
}

export type BookFormType = Omit<Book, 'id' | 'cover_url' | 'authors' | 'genres' | 'can'> & {
  author_names: string[]
  genre_names: string[]
  open_library_cover_id: number | null
}

export type BookFilters = {
  title?: string
  authors?: string[]
  genres?: string[]
  year_from?: string
  year_to?: string
  mine?: string
}

export interface OpenLibraryBook {
  id: string
  title: string
  authors: string[]
  published_year: number | null
  subjects: string[]
  cover_id: number | null
  cover_url: string | null
}
