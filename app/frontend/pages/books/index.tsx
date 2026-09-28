import { Head, Link, usePage } from "@inertiajs/react";
import { BookOpen } from "lucide-react";
import { useTranslation } from "react-i18next";

import type { Book } from "./types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
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

interface IndexProps {
  books: Book[];
}

export default function Index({ books }: IndexProps) {
  const { t } = useTranslation();
  const { flash } = usePage();

  return (
    <>
      <Head title={t("books.index.title")} />

      {flash.notice && <p className="text-green-600">{flash.notice}</p>}

      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold">{t("books.index.title")}</h1>
          {books.length > 0 && (
            <Button nativeButton={false} render={<Link href="/books/new" />}>
              {t("books.index.new_book")}
            </Button>
          )}
        </div>

        {books.length === 0 ? (
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
        ) : (
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
                        <Badge variant="secondary" className="mt-1">
                          {book.genre}
                        </Badge>
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
        )}
      </div>
    </>
  );
}
