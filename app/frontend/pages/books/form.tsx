import { type FormComponentProps } from "@inertiajs/core";
import { Form as InertiaForm } from "@inertiajs/react";
import { BookOpen } from "lucide-react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { fetchOpenLibraryDescription } from "./open_library";
import TitleLookup from "./title_lookup";
import type { Book, BookFormType, OpenLibraryBook } from "./types";
import RemoteMultiSelect from "@/components/remote_multi_select";
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

export default function Form({ book, submitText, ...formProps }: FormProps) {
  const { t } = useTranslation();
  const [title, setTitle] = useState(book.title ?? "");
  const [authors, setAuthors] = useState(book.authors);
  const [publishedYear, setPublishedYear] = useState(
    book.published_year?.toString() ?? "",
  );
  const [genres, setGenres] = useState(book.genres);
  const [description, setDescription] = useState(book.description ?? "");
  const [work, setWork] = useState<OpenLibraryBook | null>(null);
  const [loadingDescription, setLoadingDescription] = useState(false);
  const selectedWorkId = useRef<string | null>(null);

  const coverUrl = work ? work.cover_url : book.cover_url;

  async function selectWork(result: OpenLibraryBook) {
    selectedWorkId.current = result.id;
    setWork(result);
    setTitle(result.title);
    setAuthors(result.authors);
    setPublishedYear(result.published_year?.toString() ?? "");
    setGenres(result.subjects);
    setDescription("");
    setLoadingDescription(true);

    const fetchedDescription = await fetchOpenLibraryDescription(result.id).catch(
      () => null,
    );
    if (selectedWorkId.current !== result.id) return;

    setDescription(fetchedDescription ?? "");
    setLoadingDescription(false);
  }

  return (
    <InertiaForm<BookFormType>
      transform={() => ({
        book: {
          title: title.trim(),
          author_names: authors,
          published_year: publishedYear.trim() || null,
          description: description.trim() || null,
          genre_names: genres,
          ...(work && { open_library_cover_id: work.cover_id }),
        },
      })}
      {...formProps}
    >
      {({ errors, processing }) => (
        <FieldGroup className="grid sm:grid-cols-2">
          <Field data-invalid={!!errors.title} className="sm:col-span-2">
            <FieldLabel htmlFor="title">{t("books.form.title")}</FieldLabel>
            <TitleLookup
              id="title"
              aria-invalid={!!errors.title}
              value={title}
              onChange={setTitle}
              onSelect={selectWork}
            />
            <FieldError errors={toFieldErrors(errors.title)} />
          </Field>

          <Field>
            <FieldLabel htmlFor="authors">{t("books.form.authors")}</FieldLabel>
            <RemoteMultiSelect
              id="authors"
              url="/authors"
              value={authors}
              onValueChange={setAuthors}
              placeholder={t("books.form.authors_placeholder")}
              loadingText={t("books.form.loading_authors")}
              emptyText={t("books.form.no_authors")}
              createText={(name) => t("books.form.add_option", { name })}
            />
          </Field>

          <Field data-invalid={!!errors.published_year}>
            <FieldLabel htmlFor="published_year">
              {t("books.form.published_year")}
            </FieldLabel>
            <Input
              type="text"
              inputMode="numeric"
              id="published_year"
              aria-invalid={!!errors.published_year}
              value={publishedYear}
              onChange={(event) => setPublishedYear(event.target.value)}
            />
            <FieldError errors={toFieldErrors(errors.published_year)} />
          </Field>

          <Field className="sm:col-span-2">
            <FieldLabel htmlFor="genres">{t("books.form.genres")}</FieldLabel>
            <RemoteMultiSelect
              id="genres"
              url="/genres"
              value={genres}
              onValueChange={setGenres}
              placeholder={t("books.form.genres_placeholder")}
              loadingText={t("books.form.loading_genres")}
              emptyText={t("books.form.no_genres")}
              createText={(name) => t("books.form.add_option", { name })}
            />
          </Field>

          <Field className="sm:col-span-2">
            <FieldLabel htmlFor="description">
              {t("books.form.description")}
            </FieldLabel>
            <Textarea
              id="description"
              readOnly={loadingDescription}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder={
                loadingDescription
                  ? t("books.form.loading_description")
                  : undefined
              }
            />
          </Field>

          <Field className="sm:col-span-2">
            <FieldTitle>{t("books.form.cover")}</FieldTitle>
            {coverUrl ? (
              <img
                src={coverUrl}
                alt=""
                className="aspect-2/3 w-24 rounded-md object-cover"
              />
            ) : (
              <div className="flex aspect-2/3 w-24 items-center justify-center rounded-md bg-muted text-muted-foreground">
                <BookOpen aria-hidden="true" />
              </div>
            )}
          </Field>

          <div className="sm:col-span-2">
            <Button
              type="submit"
              disabled={!title.trim() || loadingDescription || processing}
            >
              {processing ? t("books.form.processing") : submitText}
            </Button>
          </div>
        </FieldGroup>
      )}
    </InertiaForm>
  );
}
