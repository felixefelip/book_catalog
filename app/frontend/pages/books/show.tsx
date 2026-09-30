import { Head, Link } from "@inertiajs/react";
import { useTranslation } from "react-i18next";

import BookCover from "./book_cover";
import DeleteDialog from "./delete_dialog";
import type { Book } from "./types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ShowProps {
  book: Book & { creator_name: string; created_on: string };
}

export default function Show({ book }: ShowProps) {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-2xl">
      <Head title={book.title} />

      <Card>
        <div className="flex flex-col gap-(--card-spacing) sm:flex-row">
          <BookCover
            url={book.cover_url}
            className="mx-(--card-spacing) w-40 shrink-0 self-start sm:mr-0"
            iconClassName="size-8"
          />

          <div className="flex min-w-0 flex-1 flex-col gap-(--card-spacing)">
            <CardHeader>
              <CardTitle>
                <h1 className="text-xl">{book.title}</h1>
              </CardTitle>
              {book.authors.length > 0 && (
                <CardDescription>{book.authors.join(", ")}</CardDescription>
              )}
              <p className="text-xs text-muted-foreground">
                {t("books.show.created_by", {
                  name: book.creator_name,
                  date: book.created_on,
                })}
              </p>
            </CardHeader>

            <CardContent className="flex flex-col gap-4">
              {(book.published_year || book.genres.length > 0) && (
                <dl className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-4 gap-y-2">
                  {book.published_year && (
                    <>
                      <dt className="text-muted-foreground">
                        {t("books.form.published_year")}
                      </dt>
                      <dd>{book.published_year}</dd>
                    </>
                  )}
                  {book.genres.length > 0 && (
                    <>
                      <dt className="text-muted-foreground">
                        {t("books.form.genres")}
                      </dt>
                      <dd className="flex flex-wrap gap-1">
                        {book.genres.map((genre) => (
                          <Badge
                            key={genre}
                            variant="secondary"
                            className="h-auto max-w-full whitespace-normal"
                          >
                            {genre}
                          </Badge>
                        ))}
                      </dd>
                    </>
                  )}
                </dl>
              )}

              <div className="flex flex-col gap-1">
                <h2 className="text-muted-foreground">
                  {t("books.form.description")}
                </h2>
                {book.description ? (
                  <p className="whitespace-pre-line">{book.description}</p>
                ) : (
                  <p className="text-muted-foreground italic">
                    {t("books.show.no_description")}
                  </p>
                )}
              </div>
            </CardContent>
          </div>
        </div>

        <CardFooter className="justify-between gap-2">
          <Link href="/books">{t("books.show.back")}</Link>
          <div className="flex gap-2">
            {book.can.update && (
              <Button
                variant="outline"
                size="sm"
                nativeButton={false}
                render={<Link href={`/books/${book.id}/edit`} />}
              >
                {t("books.show.edit")}
              </Button>
            )}
            {book.can.destroy && <DeleteDialog book={book} />}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
