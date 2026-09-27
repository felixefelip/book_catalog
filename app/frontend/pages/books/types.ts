export interface Book {
  id: number
  title: string
  author_name: string
  published_year: number | null
  genre: string
  description: string | null
}

export type BookFormType = Omit<Book, 'id'>
