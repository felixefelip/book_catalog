import { Head, Link } from "@inertiajs/react";
import { useTranslation } from "react-i18next";

import Form from "./form";
import type { Book } from "./types";

interface NewProps {
  book: Book;
}

export default function New({ book }: NewProps) {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-sm">
      <Head title={t("books.new.title")} />

      <h1>{t("books.new.title")}</h1>

      <Form
        book={book}
        action="/books"
        method="post"
        submitText={t("books.new.submit")}
      />

      <br />

      <div>
        <Link href="/books">{t("books.new.back")}</Link>
      </div>
    </div>
  );
}
