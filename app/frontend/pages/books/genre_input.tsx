import { XIcon } from "lucide-react";
import { useId, useState } from "react";
import { useTranslation } from "react-i18next";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

type GenreInputProps = {
  id: string;
  value: string[];
  onChange: (genres: string[]) => void;
  suggestions: string[];
  invalid?: boolean;
};

export function addGenre(genres: string[], genre: string) {
  const name = genre.trim().replace(/\s+/g, " ");
  const exists = genres.some(
    (current) => current.toLowerCase() === name.toLowerCase(),
  );

  return name && !exists ? [...genres, name] : genres;
}

export default function GenreInput({
  id,
  value,
  onChange,
  suggestions,
  invalid,
}: GenreInputProps) {
  const { t } = useTranslation();
  const listId = useId();
  const [draft, setDraft] = useState("");

  function commitDraft() {
    onChange(addGenre(value, draft));
    setDraft("");
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      commitDraft();
    } else if (event.key === "Backspace" && !draft && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {value.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {value.map((genre) => (
            <li key={genre}>
              <Badge variant="secondary" className="pr-1">
                {genre}
                <button
                  type="button"
                  onClick={() => onChange(value.filter((current) => current !== genre))}
                  aria-label={t("books.form.remove_genre", { genre })}
                  className="rounded-full hover:bg-foreground/10"
                >
                  <XIcon />
                </button>
              </Badge>
            </li>
          ))}
        </ul>
      )}

      <Input
        type="text"
        id={id}
        list={listId}
        autoComplete="off"
        aria-invalid={invalid}
        placeholder={t("books.form.genre_placeholder")}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={commitDraft}
      />
      <datalist id={listId}>
        {suggestions
          .filter((genre) => !value.includes(genre))
          .map((genre) => (
            <option key={genre} value={genre} />
          ))}
      </datalist>
    </div>
  );
}
