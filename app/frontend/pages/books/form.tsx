import { type FormComponentProps } from "@inertiajs/core";
import { Form as InertiaForm } from "@inertiajs/react";
import { useTranslation } from "react-i18next";

import type { Book, BookFormType } from "./types";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type FormProps = FormComponentProps<BookFormType> & {
  book: Book;
  submitText: string;
};

export default function Form({ book, submitText, ...formProps }: FormProps) {
  const { t } = useTranslation();

  return (
    <InertiaForm<BookFormType>
      transform={(data) => ({ book: data })}
      {...formProps}
      className="w-full max-w-sm"
    >
      {({ errors, processing }) => (
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="title">{t("books.form.title")}</FieldLabel>
            <Input
              type="text"
              name="title"
              id="title"
              defaultValue={book.title ?? ""}
            />
            {errors.title && (
              <div style={{ color: "red" }}>{errors.title.join(", ")}</div>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="author_name">
              {t("books.form.author_name")}
            </FieldLabel>
            <Input
              type="text"
              name="author_name"
              id="author_name"
              defaultValue={book.author_name ?? ""}
            />
            {errors.author_name && (
              <div style={{ color: "red" }}>
                {errors.author_name.join(", ")}
              </div>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="published_year">
              {t("books.form.published_year")}
            </FieldLabel>
            <Input
              type="number"
              step="1"
              name="published_year"
              id="published_year"
              defaultValue={book.published_year ?? ""}
            />
            {errors.published_year && (
              <div style={{ color: "red" }}>
                {errors.published_year.join(", ")}
              </div>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="genre">{t("books.form.genre")}</FieldLabel>
            <Input
              type="text"
              name="genre"
              id="genre"
              defaultValue={book.genre ?? ""}
            />
            {errors.genre && (
              <div style={{ color: "red" }}>{errors.genre.join(", ")}</div>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="description">
              {t("books.form.description")}
            </FieldLabel>
            <Textarea
              name="description"
              id="description"
              defaultValue={book.description ?? ""}
            />
            {errors.description && (
              <div style={{ color: "red" }}>
                {errors.description.join(", ")}
              </div>
            )}
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
