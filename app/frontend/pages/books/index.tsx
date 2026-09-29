import { Head, Link, usePage } from "@inertiajs/react";
import { BookOpen, SearchX } from "lucide-react";
import { useTranslation } from "react-i18next";

import Filters from "./filters";
import type { Book, BookFilters } from "./types";
import PaginationNav from "@/components/pagination_nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Pagination } from "@/types";

interface IndexProps {
  books: Book[];
  pagination: Pagination;
  filters: BookFilters;
  genres: string[];
}

export default function Index({ books, pagination, filters, genres }: IndexProps) {
  const { t } = useTranslation();
  const { flash } = usePage();
  const hasBooks = genres.length > 0;

  return (
    <>
      <Head title={t("books.index.title")} />

      {flash.notice && <p className="text-green-600 dark:text-green-400">{flash.notice}</p>}

      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-baseline gap-3">
            <h1 className="text-2xl font-semibold">{t("books.index.title")}</h1>
            {hasBooks && (
              <span className="text-sm text-muted-foreground">
                {t("books.index.count", { count: pagination.total_count })}
              </span>
            )}
          </div>
          {hasBooks && (
            <Button nativeButton={false} render={<Link href="/books/new" />}>
              {t("books.index.new_book")}
            </Button>
          )}
        </div>

        {hasBooks && (
          <Card>
            <CardContent>
              <Filters filters={filters} genres={genres} />
            </CardContent>
          </Card>
        )}

        {!hasBooks ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <BookOpen />
              </EmptyMedia>
              <EmptyTitle>{t("books.index.empty")}</EmptyTitle>
            </EmptyHeader>
            <EmptyContent>
              <Button nativeButton={false} render={<Link href="/books/new" />}>
                {t("books.index.new_book")}
              </Button>
            </EmptyContent>
          </Empty>
        ) : books.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <SearchX />
              </EmptyMedia>
              <EmptyTitle>{t("books.index.no_results")}</EmptyTitle>
              <EmptyDescription>{t("books.index.no_results_hint")}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {books.map((book) => (
                <li key={book.id}>
                  <Card className="relative h-full transition-shadow hover:ring-foreground/30">
                    <div className="flex flex-1 items-start gap-2">
                      {book.cover_url ? (
                        <img
                          src={book.cover_url}
                          alt=""
                          className="ml-(--card-spacing) aspect-2/3 w-20 shrink-0 rounded-md object-cover"
                        />
                      ) : (
                        <div className="ml-(--card-spacing) flex aspect-2/3 w-20 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                          <BookOpen aria-hidden="true" />
                        </div>
                      )}
                      <div className="flex min-w-0 flex-1 flex-col gap-(--card-spacing)">
                        <CardHeader>
                          <CardTitle>
                            <h2>
                              <Link
                                href={`/books/${book.id}`}
                                className="after:absolute after:inset-0"
                              >
                                {book.title}
                              </Link>
                            </h2>
                          </CardTitle>
                          <CardDescription>
                            {book.author_name}
                            {book.published_year && ` · ${book.published_year}`}
                          </CardDescription>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {book.genres.map((genre) => (
                              <Badge key={genre} variant="secondary">
                                {genre}
                              </Badge>
                            ))}
                          </div>
                        </CardHeader>
                        {book.description && (
                          <CardContent>
                            <p className="line-clamp-3">{book.description}</p>
                          </CardContent>
                        )}
                      </div>
                    </div>
                    <CardFooter className="mt-auto justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="relative z-10"
                        nativeButton={false}
                        render={<Link href={`/books/${book.id}/edit`} />}
                      >
                        {t("books.index.edit")}
                      </Button>
                    </CardFooter>
                  </Card>
                </li>
              ))}
            </ul>
            <PaginationNav pagination={pagination} path="/books" params={filters} />
          </>
        )}
      </div>
    </>
  );
}
