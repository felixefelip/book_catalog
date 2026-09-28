import { Head, Link } from "@inertiajs/react";
import { useTranslation } from "react-i18next";

import Form from "./form";
import type { Book } from "./types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface EditProps {
  book: Book;
}

export default function Edit({ book }: EditProps) {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-sm">
      <Head title={t("books.edit.title")} />

      <Card>
        <CardHeader>
          <CardTitle>
            <h1>{t("books.edit.title")}</h1>
          </CardTitle>
          <CardDescription>{t("books.edit.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form
            book={book}
            action={`/books/${book.id}`}
            method="patch"
            submitText={t("books.edit.submit")}
          />
        </CardContent>
        <CardFooter>
          <Link href="/books">{t("books.edit.back")}</Link>
        </CardFooter>
      </Card>
    </div>
  );
}
