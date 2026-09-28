import { router } from "@inertiajs/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import type { Book } from "./types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export default function DeleteDialog({ book }: { book: Book }) {
  const { t } = useTranslation();
  const [processing, setProcessing] = useState(false);

  const destroy = () =>
    router.delete(`/books/${book.id}`, {
      onStart: () => setProcessing(true),
      onFinish: () => setProcessing(false),
    });

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={<Button variant="destructive" size="sm" />}
      >
        {t("books.delete.trigger")}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("books.delete.title")}</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("books.delete.cancel")}</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={processing}
            onClick={destroy}
          >
            {processing
              ? t("books.delete.processing")
              : t("books.delete.confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
