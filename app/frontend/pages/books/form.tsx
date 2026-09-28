import { type FormComponentProps } from "@inertiajs/core";
import { Form as InertiaForm } from "@inertiajs/react";
import { useTranslation } from "react-i18next";

import type { Book, BookFormType } from "./types";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type FormProps = FormComponentProps<BookFormType> & {
  book: Book;
  submitText: string;
};

const toFieldErrors = (messages?: string[]) =>
  messages?.map((message) => ({ message }));

export default function Form({ book, submitText, ...formProps }: FormProps) {
  const { t } = useTranslation();

  return (
    <InertiaForm<BookFormType>
      transform={(data) => ({ book: data })}
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
