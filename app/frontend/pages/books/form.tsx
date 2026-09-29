import { type FormComponentProps } from "@inertiajs/core";
import { Form as InertiaForm } from "@inertiajs/react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { fetchOpenLibraryDescription } from "./open_library";
import GenreInput, { addGenre } from "./genre_input";
import TitleLookup from "./title_lookup";
import type { Book, BookFormType, OpenLibraryBook } from "./types";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toFieldErrors } from "@/lib/field_errors";

type FormProps = FormComponentProps<BookFormType> & {
  book: Book;
  genres: string[];
  submitText: string;
};

export default function Form({
  book,
  genres: availableGenres,
  submitText,
  ...formProps
}: FormProps) {
  const { t } = useTranslation();
  const [fields, setFields] = useState({
    title: book.title ?? "",
    author_name: book.author_name ?? "",
    published_year: book.published_year?.toString() ?? "",
    description: book.description ?? "",
  });
  const [genres, setGenres] = useState(book.genres);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [openLibraryCover, setOpenLibraryCover] = useState<Pick<
    OpenLibraryBook,
    "cover_id" | "cover_url"
  > | null>(null);
  const selectedWorkId = useRef<string | null>(null);
  const coverInput = useRef<HTMLInputElement>(null);

  function setField(name: keyof typeof fields, value: string) {
    setFields((current) => ({ ...current, [name]: value }));
  }

  async function fillFromOpenLibrary(result: OpenLibraryBook) {
    selectedWorkId.current = result.id;
    setSubjects(result.subjects);
    setOpenLibraryCover(result.cover_id ? result : null);
    if (result.cover_id && coverInput.current) coverInput.current.value = "";
    setFields((current) => ({
      ...current,
      title: result.title,
      author_name: result.author_name || current.author_name,
      published_year: result.published_year?.toString() ?? current.published_year,
    }));

    const description = await fetchOpenLibraryDescription(result.id).catch(() => null);
    if (description && selectedWorkId.current === result.id) {
      setField("description", description);
    }
  }

  return (
    <InertiaForm<BookFormType>
      transform={({ cover, ...data }) => {
        const book = { ...data, genre_names: genres.length ? genres : [""] };
        if (cover?.size) return { book: { ...book, cover } };
        if (openLibraryCover?.cover_id) {
          return { book: { ...book, open_library_cover_id: openLibraryCover.cover_id } };
        }
        return { book };
      }}
      {...formProps}
    >
      {({ errors, processing }) => (
        <FieldGroup>
          <Field data-invalid={!!errors.title}>
            <FieldLabel htmlFor="title">{t("books.form.title")}</FieldLabel>
            <TitleLookup
              name="title"
              id="title"
              aria-invalid={!!errors.title}
              value={fields.title}
              onChange={(value) => setField("title", value)}
              onSelect={fillFromOpenLibrary}
            />
            <FieldError errors={toFieldErrors(errors.title)} />
          </Field>

          <Field data-invalid={!!errors.author_name}>
            <FieldLabel htmlFor="author_name">
              {t("books.form.author_name")}
            </FieldLabel>
            <Input
              type="text"
              name="author_name"
              id="author_name"
              aria-invalid={!!errors.author_name}
              value={fields.author_name}
              onChange={(event) => setField("author_name", event.target.value)}
            />
            <FieldError errors={toFieldErrors(errors.author_name)} />
          </Field>

          <Field data-invalid={!!errors.published_year}>
            <FieldLabel htmlFor="published_year">
              {t("books.form.published_year")}
            </FieldLabel>
            <Input
              type="number"
              step="1"
              name="published_year"
              id="published_year"
              aria-invalid={!!errors.published_year}
              value={fields.published_year}
              onChange={(event) => setField("published_year", event.target.value)}
            />
            <FieldError errors={toFieldErrors(errors.published_year)} />
          </Field>

          <Field data-invalid={!!errors.genres}>
            <FieldLabel htmlFor="genres">{t("books.form.genres")}</FieldLabel>
            <GenreInput
              id="genres"
              value={genres}
              onChange={setGenres}
              suggestions={availableGenres}
              invalid={!!errors.genres}
            />
            {subjects.length > 0 && (
              <FieldDescription className="flex flex-wrap items-center gap-1.5">
                {t("books.form.lookup.genre_suggestions")}
                {subjects
                  .filter((subject) => !genres.includes(subject))
                  .map((subject) => (
                  <Badge
                    key={subject}
                    variant="outline"
                    className="cursor-pointer hover:bg-muted"
                    render={
                      <button
                        type="button"
                        onClick={() => setGenres((current) => addGenre(current, subject))}
                      />
                    }
                  >
                    {subject}
                  </Badge>
                ))}
              </FieldDescription>
            )}
            <FieldError errors={toFieldErrors(errors.genres)} />
          </Field>

          <Field data-invalid={!!errors.description}>
            <FieldLabel htmlFor="description">
              {t("books.form.description")}
            </FieldLabel>
            <Textarea
              name="description"
              id="description"
              aria-invalid={!!errors.description}
              value={fields.description}
              onChange={(event) => setField("description", event.target.value)}
            />
            <FieldError errors={toFieldErrors(errors.description)} />
          </Field>

          <Field data-invalid={!!errors.cover}>
            <FieldLabel htmlFor="cover">{t("books.form.cover")}</FieldLabel>
            {openLibraryCover?.cover_url ? (
              <div className="flex items-end gap-3">
                <img
                  src={openLibraryCover.cover_url}
                  alt={t("books.form.open_library_cover")}
                  className="w-24 rounded-md object-cover"
                />
                <div className="flex flex-col items-start gap-1">
                  <FieldDescription>
                    {t("books.form.open_library_cover")}
                  </FieldDescription>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setOpenLibraryCover(null)}
                  >
                    {t("books.form.discard_open_library_cover")}
                  </Button>
                </div>
              </div>
            ) : (
              book.cover_url && (
                <img
                  src={book.cover_url}
                  alt={t("books.form.current_cover")}
                  className="w-24 rounded-md object-cover"
                />
              )
            )}
            <Input
              type="file"
              name="cover"
              id="cover"
              ref={coverInput}
              accept="image/jpeg,image/png,image/webp"
              aria-invalid={!!errors.cover}
              onChange={(event) => {
                if (event.target.files?.length) setOpenLibraryCover(null);
              }}
            />
            <FieldDescription>{t("books.form.cover_hint")}</FieldDescription>
            <FieldError errors={toFieldErrors(errors.cover)} />
          </Field>

          <div>
            <Button type="submit" disabled={processing}>
              {processing ? t("books.form.processing") : submitText}
            </Button>
          </div>
        </FieldGroup>
      )}
    </InertiaForm>
  );
}
