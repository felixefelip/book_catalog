import { type FormComponentProps } from "@inertiajs/core";
import { Form as InertiaForm } from "@inertiajs/react";
import { BookOpen } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { fetchOpenLibraryDescription } from "./open_library";
import TitleLookup from "./title_lookup";
import type { Book, BookFormType, OpenLibraryBook } from "./types";
import RemoteMultiSelect from "@/components/remote_multi_select";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toFieldErrors } from "@/lib/field_errors";

const COVER_TYPES = "image/jpeg,image/png,image/webp";

const namesOrBlank = (names: string[]) => (names.length ? names : [""]);

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
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverFileUrl, setCoverFileUrl] = useState<string | null>(null);
  const [removeCover, setRemoveCover] = useState(false);
  const [loadingDescription, setLoadingDescription] = useState(false);
  const selectedWorkId = useRef<string | null>(null);
  const coverInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!coverFile) {
      setCoverFileUrl(null);
      return;
    }

    const url = URL.createObjectURL(coverFile);
    setCoverFileUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [coverFile]);

  const coverUrl =
    coverFileUrl ??
    (removeCover ? null : work ? work.cover_url : book.cover_url);

  function chooseCoverFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setCoverFile(file);
    setRemoveCover(false);
  }

  function clearCover() {
    setCoverFile(null);
    setRemoveCover(true);
  }

  function coverParams() {
    if (coverFile) return { cover: coverFile };
    if (removeCover) return { cover: null };
    if (work) {
      return work.cover_id
        ? { open_library_cover_id: work.cover_id }
        : { cover: null };
    }
    return {};
  }

  async function selectWork(result: OpenLibraryBook) {
    selectedWorkId.current = result.id;
    setWork(result);
    setTitle(result.title);
    setAuthors(result.authors);
    setPublishedYear(result.published_year?.toString() ?? "");
    setGenres(result.subjects);
    setDescription("");
    setCoverFile(null);
    setRemoveCover(false);
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
          author_names: namesOrBlank(authors),
          published_year: publishedYear.trim() || null,
          description: description.trim() || null,
          genre_names: namesOrBlank(genres),
          ...coverParams(),
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

          <Field data-invalid={!!errors.cover} className="sm:col-span-2">
            <FieldLabel htmlFor="cover">{t("books.form.cover")}</FieldLabel>
            <div className="flex items-end gap-4">
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
              <div className="flex flex-col items-start gap-2">
                <input
                  ref={coverInput}
                  type="file"
                  id="cover"
                  accept={COVER_TYPES}
                  aria-invalid={!!errors.cover}
                  className="sr-only"
                  onChange={chooseCoverFile}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => coverInput.current?.click()}
                >
                  {coverUrl
                    ? t("books.form.change_cover")
                    : t("books.form.upload_cover")}
                </Button>
                {coverUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={clearCover}
                  >
                    {t("books.form.remove_cover")}
                  </Button>
                )}
              </div>
            </div>
            <FieldDescription>{t("books.form.cover_hint")}</FieldDescription>
            <FieldError errors={toFieldErrors(errors.cover)} />
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
