import { type FormComponentProps } from "@inertiajs/core";
import { Form as InertiaForm } from "@inertiajs/react";
import { useTranslation } from "react-i18next";

import type { Book, BookFormType } from "./types";
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
  submitText: string;
};

export default function Form({ book, submitText, ...formProps }: FormProps) {
  const { t } = useTranslation();

  return (
    <InertiaForm<BookFormType>
      transform={({ cover, ...data }) => ({
        book: cover?.size ? { ...data, cover } : data,
      })}
      {...formProps}
    >
      {({ errors, processing }) => (
        <FieldGroup>
          <Field data-invalid={!!errors.title}>
            <FieldLabel htmlFor="title">{t("books.form.title")}</FieldLabel>
            <Input
              type="text"
              name="title"
              id="title"
              aria-invalid={!!errors.title}
              defaultValue={book.title ?? ""}
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
              defaultValue={book.author_name ?? ""}
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
              defaultValue={book.published_year ?? ""}
            />
            <FieldError errors={toFieldErrors(errors.published_year)} />
          </Field>

          <Field data-invalid={!!errors.genre}>
            <FieldLabel htmlFor="genre">{t("books.form.genre")}</FieldLabel>
            <Input
              type="text"
              name="genre"
              id="genre"
              aria-invalid={!!errors.genre}
              defaultValue={book.genre ?? ""}
            />
            <FieldError errors={toFieldErrors(errors.genre)} />
          </Field>

          <Field data-invalid={!!errors.description}>
            <FieldLabel htmlFor="description">
              {t("books.form.description")}
            </FieldLabel>
            <Textarea
              name="description"
              id="description"
              aria-invalid={!!errors.description}
              defaultValue={book.description ?? ""}
            />
            <FieldError errors={toFieldErrors(errors.description)} />
          </Field>

          <Field data-invalid={!!errors.cover}>
            <FieldLabel htmlFor="cover">{t("books.form.cover")}</FieldLabel>
            {book.cover_url && (
              <img
                src={book.cover_url}
                alt={t("books.form.current_cover")}
                className="w-24 rounded-md object-cover"
              />
            )}
            <Input
              type="file"
              name="cover"
              id="cover"
              accept="image/jpeg,image/png,image/webp"
              aria-invalid={!!errors.cover}
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
