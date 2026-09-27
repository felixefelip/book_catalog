import { type FormComponentProps } from '@inertiajs/core'
import { Form as InertiaForm } from '@inertiajs/react'
import { useTranslation } from 'react-i18next'

import type { Book, BookFormType } from './types'

type FormProps = FormComponentProps<BookFormType> & {
  book: Book
  submitText: string
}

export default function Form({ book, submitText, ...formProps }: FormProps) {
  const { t } = useTranslation()

  return (
    <InertiaForm<BookFormType>
      transform={data => ({ book: data })}
      {...formProps}
    >
      {({ errors, processing }) => (
        <>
          <div>
            <label style={{ display: 'block' }} htmlFor="title">
              {t('books.form.title')}
            </label>
            <input
              type="text"
              name="title"
              id="title"
              defaultValue={book.title ?? ''}
            />
            {errors.title && (
              <div style={{ color: 'red' }}>{errors.title.join(', ')}</div>
            )}
          </div>

          <div>
            <label style={{ display: 'block' }} htmlFor="author_name">
              {t('books.form.author_name')}
            </label>
            <input
              type="text"
              name="author_name"
              id="author_name"
              defaultValue={book.author_name ?? ''}
            />
            {errors.author_name && (
              <div style={{ color: 'red' }}>{errors.author_name.join(', ')}</div>
            )}
          </div>

          <div>
            <label style={{ display: 'block' }} htmlFor="published_year">
              {t('books.form.published_year')}
            </label>
            <input
              type="number"
              step="1"
              name="published_year"
              id="published_year"
              defaultValue={book.published_year ?? ''}
            />
            {errors.published_year && (
              <div style={{ color: 'red' }}>{errors.published_year.join(', ')}</div>
            )}
          </div>

          <div>
            <label style={{ display: 'block' }} htmlFor="genre">
              {t('books.form.genre')}
            </label>
            <input
              type="text"
              name="genre"
              id="genre"
              defaultValue={book.genre ?? ''}
            />
            {errors.genre && (
              <div style={{ color: 'red' }}>{errors.genre.join(', ')}</div>
            )}
          </div>

          <div>
            <label style={{ display: 'block' }} htmlFor="description">
              {t('books.form.description')}
            </label>
            <textarea
              name="description"
              id="description"
              defaultValue={book.description ?? ''}
            />
            {errors.description && (
              <div style={{ color: 'red' }}>{errors.description.join(', ')}</div>
            )}
          </div>

          <div>
            <button type="submit" disabled={processing}>
              {processing ? t('books.form.processing') : submitText}
            </button>
          </div>
        </>
      )}
    </InertiaForm>
  )
}
