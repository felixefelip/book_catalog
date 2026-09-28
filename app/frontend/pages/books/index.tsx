import { Head, Link, usePage } from "@inertiajs/react";
import { BookOpen } from "lucide-react";
import { useTranslation } from "react-i18next";

import type { Book } from "./types";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface IndexProps {
  books: Book[];
}

export default function Index({ books }: IndexProps) {
  const { t } = useTranslation();
  const { flash } = usePage();

  return (
    <>
      <Head title={t("books.index.title")} />

      {flash.notice && <p style={{ color: "green" }}>{flash.notice}</p>}

      <h1>{t("books.index.title")}</h1>

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
        <>
          <Button nativeButton={false} render={<Link href="/books/new" />}>
            {t("books.index.new_book")}
          </Button>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("books.form.title")}</TableHead>
                <TableHead>{t("books.form.author_name")}</TableHead>
                <TableHead>{t("books.form.published_year")}</TableHead>
                <TableHead>{t("books.form.genre")}</TableHead>
                <TableHead className="text-right">
                  {t("books.index.actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {books.map((book) => (
                <TableRow key={book.id}>
                  <TableCell className="font-medium">{book.title}</TableCell>
                  <TableCell>{book.author_name}</TableCell>
                  <TableCell>{book.published_year}</TableCell>
                  <TableCell>{book.genre}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      nativeButton={false}
                      render={<Link href={`/books/${book.id}/edit`} />}
                    >
                      {t("books.index.edit")}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      )}
    </>
  );
}
