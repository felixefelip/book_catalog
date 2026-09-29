import { type FormComponentProps } from "@inertiajs/core";
import { Form as InertiaForm } from "@inertiajs/react";
import { BookOpen } from "lucide-react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { fetchOpenLibraryDescription } from "./open_library";
import TitleLookup from "./title_lookup";
import type { Book, BookFormType, OpenLibraryBook } from "./types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toFieldErrors } from "@/lib/field_errors";

type FormProps = FormComponentProps<BookFormType> & {
  book: Book;
  submitText: string;
};

type Work = OpenLibraryBook & { description: string | null };

const READ_ONLY_FIELD =
  "read-only:cursor-default read-only:bg-muted dark:read-only:bg-muted";

export default function Form({ book, submitText, ...formProps }: FormProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState(book.title ?? "");
  const [work, setWork] = useState<Work | null>(null);
  const [loadingDescription, setLoadingDescription] = useState(false);
  const selectedWorkId = useRef<string | null>(null);

  const values = work
    ? {
        author_name: work.author_name,
        published_year: work.published_year,
        genres: work.subjects,
        description: work.description,
        cover_url: work.cover_url,
      }
    : book;

  async function selectWork(result: OpenLibraryBook) {
    selectedWorkId.current = result.id;
    setQuery(result.title);
    setWork({ ...result, description: null });
    setLoadingDescription(true);

    const description = await fetchOpenLibraryDescription(result.id).catch(() => null);
    if (selectedWorkId.current !== result.id) return;

    setWork((current) => current && { ...current, description });
    setLoadingDescription(false);
  }

  return (
    <InertiaForm<BookFormType>
      transform={() => ({
        book: work && {
          title: work.title,
          author_name: work.author_name,
          published_year: work.published_year,
          description: work.description,
          genre_names: work.subjects,
          open_library_cover_id: work.cover_id,
        },
      })}
      {...formProps}
    >
      {({ errors, processing }) => (
        <FieldGroup>
          <Field data-invalid={!!errors.title}>
            <FieldLabel htmlFor="title">{t("books.form.title")}</FieldLabel>
            <TitleLookup
              id="title"
              aria-invalid={!!errors.title}
              value={query}
              onChange={setQuery}
              onSelect={selectWork}
            />
            <FieldError errors={toFieldErrors(errors.title)} />
          </Field>

          <Field>
            <FieldLabel htmlFor="author_name">
              {t("books.form.author_name")}
            </FieldLabel>
            <Input
              type="text"
              id="author_name"
              readOnly
              className={READ_ONLY_FIELD}
              value={values.author_name ?? ""}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="published_year">
              {t("books.form.published_year")}
            </FieldLabel>
            <Input
              type="text"
              id="published_year"
              readOnly
              className={READ_ONLY_FIELD}
              value={values.published_year ?? ""}
            />
          </Field>

          <Field>
            <FieldTitle>{t("books.form.genres")}</FieldTitle>
            <ul className="flex max-h-32 min-h-8 flex-wrap content-start gap-1 overflow-y-auto rounded-lg border border-input bg-muted px-2.5 py-1.5">
              {values.genres.map((genre) => (
                <li key={genre}>
                  <Badge variant="secondary">{genre}</Badge>
                </li>
              ))}
              {values.genres.length === 0 && (
                <li className="text-sm text-muted-foreground">
                  {t("books.form.no_genres")}
                </li>
              )}
            </ul>
          </Field>

          <Field>
            <FieldLabel htmlFor="description">
              {t("books.form.description")}
            </FieldLabel>
            <Textarea
              id="description"
              readOnly
              className={READ_ONLY_FIELD}
              value={values.description ?? ""}
              placeholder={
                loadingDescription ? t("books.form.loading_description") : undefined
              }
            />
          </Field>

          <Field>
            <FieldTitle>{t("books.form.cover")}</FieldTitle>
            {values.cover_url ? (
              <img
                src={values.cover_url}
                alt=""
                className="aspect-2/3 w-24 rounded-md object-cover"
              />
            ) : (
              <div className="flex aspect-2/3 w-24 items-center justify-center rounded-md bg-muted text-muted-foreground">
                <BookOpen aria-hidden="true" />
              </div>
            )}
          </Field>

          <div>
            <Button
              type="submit"
              disabled={!work || loadingDescription || processing}
            >
              {processing ? t("books.form.processing") : submitText}
            </Button>
          </div>
        </FieldGroup>
      )}
    </InertiaForm>
  );
}
