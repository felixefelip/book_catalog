import { Head, Link } from "@inertiajs/react";
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

const CARD_GENRES_LIMIT = 3;

interface IndexProps {
  books: Book[];
  pagination: Pagination;
  filters: BookFilters;
  books_count: number;
}

export default function Index({
  books,
  pagination,
  filters,
  books_count,
}: IndexProps) {
  const { t } = useTranslation();
  const hasBooks = books_count > 0;
  const hasFilters = Object.keys(filters).length > 0;

  return (
    <>
      <Head title={t("books.index.title")} />

      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-baseline gap-3">
            <h1 className="text-2xl font-semibold">{t("books.index.title")}</h1>
            {hasBooks && (
              <span className="text-sm text-muted-foreground">
                {hasFilters
                  ? t("books.index.filtered_count", {
                      filtered: pagination.total_count,
                      count: books_count,
                    })
                  : t("books.index.count", { count: books_count })}
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
              <Filters filters={filters} />
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
                    <div className="flex items-start gap-2">
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
                      <CardHeader className="min-w-0 flex-1 grid-cols-[minmax(0,1fr)]">
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
                          {[book.authors.join(", "), book.published_year]
                            .filter(Boolean)
                            .join(" · ")}
                        </CardDescription>
                      </CardHeader>
                    </div>
                    {(book.genres.length > 0 || book.description) && (
                      <CardContent className="flex flex-col gap-3">
                        {book.genres.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {book.genres.slice(0, CARD_GENRES_LIMIT).map((genre) => (
                              <Badge
                                key={genre}
                                variant="secondary"
                                title={genre}
                                className="max-w-full"
                              >
                                <span className="truncate">{genre}</span>
                              </Badge>
                            ))}
                            {book.genres.length > CARD_GENRES_LIMIT && (
                              <Badge variant="outline">
                                +{book.genres.length - CARD_GENRES_LIMIT}
                              </Badge>
                            )}
                          </div>
                        )}
                        {book.description && (
                          <p className="line-clamp-3">{book.description}</p>
                        )}
                      </CardContent>
                    )}
                    {book.can.update && (
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
                    )}
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
