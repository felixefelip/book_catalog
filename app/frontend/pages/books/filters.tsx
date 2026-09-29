import { Form, Link, usePage } from "@inertiajs/react";
import { useTranslation } from "react-i18next";
import { cn } from "cn";

import GenreFilter from "./genre_filter";
import type { BookFilters } from "./types";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

interface FiltersProps {
  filters: BookFilters;
}

export default function Filters({ filters }: FiltersProps) {
  const { t } = useTranslation();
  const { current_user } = usePage().props;
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
            <FieldLabel htmlFor="filter_genres">{t("books.filters.genre")}</FieldLabel>
            <GenreFilter id="filter_genres" defaultValue={filters.genres ?? []} />
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

          {current_user && (
            <label className="flex h-8 items-center gap-2 text-sm sm:col-span-2">
              <input
                type="checkbox"
                name="mine"
                value="1"
                defaultChecked={filters.mine === "1"}
                className="size-4 accent-primary"
              />
              {t("books.filters.mine")}
            </label>
          )}

          <div
            className={cn(
              "flex gap-2 sm:col-span-2 lg:justify-end",
              !current_user && "lg:col-span-4",
            )}
          >
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
