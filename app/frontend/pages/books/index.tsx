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
  CardAction,
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
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>
                      <h2>{book.title}</h2>
                    </CardTitle>
                    <CardDescription>
                      {book.author_name}
                      {book.published_year && ` · ${book.published_year}`}
                    </CardDescription>
                    <CardAction>
                      <Badge variant="secondary">{book.genre}</Badge>
                    </CardAction>
                  </CardHeader>
                  {book.description && (
                    <CardContent className="flex-1">
                      <p className="line-clamp-3">{book.description}</p>
                    </CardContent>
                  )}
                  <CardFooter className="mt-auto justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
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
