import { Form, Link } from "@inertiajs/react";
import { useTranslation } from "react-i18next";

import type { BookFilters } from "./types";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

interface FiltersProps {
  filters: BookFilters;
  genres: string[];
}

export default function Filters({ filters, genres }: FiltersProps) {
  const { t } = useTranslation();
  const hasFilters = Object.keys(filters).length > 0;

  return (
    <Form<BookFilters>
      method="get"
      action="/books"
      transform={(data) =>
        Object.fromEntries(Object.entries(data).filter(([, value]) => value))
      }
      options={{ preserveScroll: true, preserveState: true, replace: true }}
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6 lg:items-end"
    >
      {({ processing }) => (
        <>
          <Field className="lg:col-span-2">
            <FieldLabel htmlFor="filter_title">{t("books.filters.title")}</FieldLabel>
            <Input
              type="search"
              name="title"
              id="filter_title"
              defaultValue={filters.title ?? ""}
            />
          </Field>

          <Field className="lg:col-span-2">
            <FieldLabel htmlFor="filter_author_name">
              {t("books.filters.author_name")}
            </FieldLabel>
            <Input
              type="search"
              name="author_name"
              id="filter_author_name"
              defaultValue={filters.author_name ?? ""}
            />
          </Field>

          <Field className="lg:col-span-2">
            <FieldLabel htmlFor="filter_genre">{t("books.filters.genre")}</FieldLabel>
            <select
              name="genre"
              id="filter_genre"
              defaultValue={filters.genre ?? ""}
              className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"
            >
              <option value="">{t("books.filters.all_genres")}</option>
              {genres.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          </Field>

          <Field>
            <FieldLabel htmlFor="filter_year_from">
              {t("books.filters.year_from")}
            </FieldLabel>
            <Input
              type="number"
              step="1"
              min="0"
              name="year_from"
              id="filter_year_from"
              defaultValue={filters.year_from ?? ""}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="filter_year_to">
              {t("books.filters.year_to")}
            </FieldLabel>
            <Input
              type="number"
              step="1"
              min="0"
              name="year_to"
              id="filter_year_to"
              defaultValue={filters.year_to ?? ""}
            />
          </Field>

          <div className="flex gap-2 sm:col-span-2 lg:col-span-4 lg:justify-end">
            {hasFilters && (
              <Button
                variant="ghost"
                nativeButton={false}
                render={<Link href="/books" />}
              >
                {t("books.filters.clear")}
              </Button>
            )}
            <Button type="submit" disabled={processing}>
              {t("books.filters.submit")}
            </Button>
          </div>
        </>
      )}
    </Form>
  );
}
