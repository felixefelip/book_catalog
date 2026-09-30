import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import BookCover from "./book_cover";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { toFieldErrors } from "@/lib/field_errors";

const COVER_TYPES = "image/jpeg,image/png,image/webp";

type CoverFieldProps = {
  file: File | null;
  url: string | null;
  errors?: string[];
  onSelect: (file: File) => void;
  onRemove: () => void;
};

export default function CoverField({
  file,
  url,
  errors,
  onSelect,
  onRemove,
}: CoverFieldProps) {
  const { t } = useTranslation();
  const input = useRef<HTMLInputElement>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setFileUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setFileUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const previewUrl = fileUrl ?? url;

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const chosen = event.target.files?.[0];
    event.target.value = "";
    if (chosen) onSelect(chosen);
  }

  return (
    <Field data-invalid={!!errors} className="sm:col-span-2">
      <FieldLabel htmlFor="cover">{t("books.form.cover")}</FieldLabel>
      <div className="flex items-end gap-4">
        <BookCover url={previewUrl} className="w-24" />
        <div className="flex flex-col items-start gap-2">
          <input
            ref={input}
            type="file"
            id="cover"
            accept={COVER_TYPES}
            aria-invalid={!!errors}
            className="sr-only"
            onChange={handleChange}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => input.current?.click()}
          >
            {previewUrl
              ? t("books.form.change_cover")
              : t("books.form.upload_cover")}
          </Button>
          {previewUrl && (
            <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
              {t("books.form.remove_cover")}
            </Button>
          )}
        </div>
      </div>
      <FieldDescription>{t("books.form.cover_hint")}</FieldDescription>
      <FieldError errors={toFieldErrors(errors)} />
    </Field>
  );
}
