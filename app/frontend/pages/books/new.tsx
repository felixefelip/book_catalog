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

interface NewProps {
  book: Book;
}

export default function New({ book }: NewProps) {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-2xl">
      <Head title={t("books.new.title")} />

      <Card>
        <CardHeader>
          <CardTitle>
            <h1>{t("books.new.title")}</h1>
          </CardTitle>
          <CardDescription>{t("books.new.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form
            book={book}
            action="/books"
            method="post"
            submitText={t("books.new.submit")}
          />
        </CardContent>
        <CardFooter>
          <Link href="/books">{t("books.new.back")}</Link>
        </CardFooter>
      </Card>
    </div>
  );
}
