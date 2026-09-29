import { Head, Link, usePage } from "@inertiajs/react";
import { BookOpen } from "lucide-react";
import { useTranslation } from "react-i18next";

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
  book: Book;
}

export default function Show({ book }: ShowProps) {
  const { t } = useTranslation();
  const { current_user } = usePage().props;

  return (
    <div className="mx-auto max-w-2xl">
      <Head title={book.title} />

      <Card>
        <div className="flex flex-col gap-(--card-spacing) sm:flex-row">
          {book.cover_url ? (
            <img
              src={book.cover_url}
              alt=""
              className="mx-(--card-spacing) aspect-2/3 w-40 shrink-0 rounded-md object-cover sm:mr-0"
            />
          ) : (
            <div className="mx-(--card-spacing) flex aspect-2/3 w-40 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground sm:mr-0">
              <BookOpen aria-hidden="true" className="size-8" />
            </div>
          )}

          <div className="flex min-w-0 flex-1 flex-col gap-(--card-spacing)">
            <CardHeader>
              <CardTitle>
                <h1 className="text-xl">{book.title}</h1>
              </CardTitle>
              <CardDescription>{book.author_name}</CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col gap-4">
              <dl className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-2">
                <dt className="text-muted-foreground">
                  {t("books.form.published_year")}
                </dt>
                <dd>{book.published_year}</dd>
                <dt className="text-muted-foreground">
                  {t("books.form.genres")}
                </dt>
                <dd className="flex flex-wrap gap-1">
                  {book.genres.map((genre) => (
                    <Badge key={genre} variant="secondary">
                      {genre}
                    </Badge>
                  ))}
                </dd>
              </dl>

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
          {current_user && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                nativeButton={false}
                render={<Link href={`/books/${book.id}/edit`} />}
              >
                {t("books.show.edit")}
              </Button>
              <DeleteDialog book={book} />
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
