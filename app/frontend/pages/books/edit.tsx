import { Head, Link } from '@inertiajs/react'
import { useTranslation } from 'react-i18next'

import Form from './form'
import type { Book } from './types'

interface EditProps {
  book: Book
}

export default function Edit({ book }: EditProps) {
  const { t } = useTranslation()

  return (
    <>
      <Head title={t('books.edit.title')} />

      <h1>{t('books.edit.title')}</h1>

      <Form
        book={book}
        action={`/books/${book.id}`}
        method="patch"
        submitText={t('books.edit.submit')}
      />

      <br />

      <div>
        <Link href="/books">{t('books.edit.back')}</Link>
      </div>
    </>
  )
}
