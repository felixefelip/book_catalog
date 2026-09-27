import { Head, Link, usePage } from '@inertiajs/react'
import { useTranslation } from 'react-i18next'

import type { Book } from './types'

interface IndexProps {
  books: Book[]
}

export default function Index({ books }: IndexProps) {
  const { t } = useTranslation()
  const { flash } = usePage()

  return (
    <>
      <Head title={t('books.index.title')} />

      {flash.notice && (
        <p style={{ color: 'green' }}>{flash.notice}</p>
      )}

      <h1>{t('books.index.title')}</h1>

      <Link href="/books/new">{t('books.index.new_book')}</Link>

      {books.length === 0 ? (
        <p>{t('books.index.empty')}</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>{t('books.form.title')}</th>
              <th>{t('books.form.author_name')}</th>
              <th>{t('books.form.published_year')}</th>
              <th>{t('books.form.genre')}</th>
              <th>{t('books.index.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {books.map(book => (
              <tr key={book.id}>
                <td>{book.title}</td>
                <td>{book.author_name}</td>
                <td>{book.published_year}</td>
                <td>{book.genre}</td>
                <td>
                  <Link href={`/books/${book.id}/edit`}>{t('books.index.edit')}</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  )
}
