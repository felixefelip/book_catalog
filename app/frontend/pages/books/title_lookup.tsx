import { useEffect, useId, useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "cn";

import { searchOpenLibrary } from "./open_library";
import type { OpenLibraryBook } from "./types";
import { FieldDescription } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const MIN_QUERY_LENGTH = 3;
const DEBOUNCE_MS = 400;

type TitleLookupProps = Omit<
  React.ComponentProps<"input">,
  "value" | "onChange" | "onSelect"
> & {
  value: string;
  onChange: (value: string) => void;
  onSelect: (book: OpenLibraryBook) => void;
};

export default function TitleLookup({
  value,
  onChange,
  onSelect,
  ...inputProps
}: TitleLookupProps) {
  const { t } = useTranslation();
  const listId = useId();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<OpenLibraryBook[] | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    setResults(null);
    setStatus("idle");
    if (query.trim().length < MIN_QUERY_LENGTH) return;

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setStatus("loading");
      try {
        setResults(await searchOpenLibrary(query.trim(), controller.signal));
        setActiveIndex(-1);
        setStatus("idle");
      } catch {
        if (!controller.signal.aborted) setStatus("error");
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  const suggestions = open && results ? results : [];
  const showList = suggestions.length > 0;

  useEffect(() => {
    if (!showList || activeIndex < 0) return;

    document
      .getElementById(`${listId}-${activeIndex}`)
      ?.scrollIntoView({ block: "nearest" });
  }, [showList, activeIndex, listId]);

  function select(book: OpenLibraryBook) {
    onSelect(book);
    setQuery("");
    setOpen(false);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!showList) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (index <= 0 ? suggestions.length - 1 : index - 1));
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      select(suggestions[activeIndex]);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <>
      <div className="relative">
        <Input
          {...inputProps}
          type="text"
          role="combobox"
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={showList}
          aria-controls={listId}
          aria-activedescendant={
            showList && activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined
          }
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={handleKeyDown}
        />

        {showList && (
          <ul
            id={listId}
            role="listbox"
            className="absolute z-10 mt-1 max-h-80 w-full overflow-y-auto rounded-lg border bg-popover text-popover-foreground shadow-md"
          >
            {suggestions.map((book, index) => (
              <li
                key={book.id}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={index === activeIndex}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => select(book)}
                className={cn(
                  "flex cursor-pointer items-center gap-3 px-2.5 py-2 text-sm",
                  index === activeIndex && "bg-accent text-accent-foreground",
                )}
              >
                {book.cover_url ? (
                  <img
                    src={book.cover_url}
                    alt=""
                    loading="lazy"
                    className="h-12 w-8 shrink-0 rounded object-cover"
                  />
                ) : (
                  <div className="h-12 w-8 shrink-0 rounded bg-muted" />
                )}
                <div className="min-w-0">
                  <p className="truncate font-medium">{book.title}</p>
                  <p className="truncate text-muted-foreground">
                    {[book.author_name, book.published_year]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {status === "loading" && (
        <FieldDescription>{t("books.form.lookup.loading")}</FieldDescription>
      )}
      {status === "error" && (
        <FieldDescription>{t("books.form.lookup.error")}</FieldDescription>
      )}
      {open && results?.length === 0 && (
        <FieldDescription>{t("books.form.lookup.no_results")}</FieldDescription>
      )}
    </>
  );
}
