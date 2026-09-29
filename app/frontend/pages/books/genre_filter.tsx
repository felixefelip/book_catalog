import { Fragment, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";

const DEBOUNCE_MS = 300;
const LOAD_MORE_THRESHOLD_PX = 48;

type GenrePage = { genres: string[]; next_page: number | null };

async function fetchGenres(query: string, page: number, signal: AbortSignal) {
  const params = new URLSearchParams({ q: query, page: String(page) });
  const response = await fetch(`/genres?${params}`, {
    signal,
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error(`Genres request failed: ${response.status}`);

  return (await response.json()) as GenrePage;
}

type GenreFilterProps = {
  id: string;
  defaultValue: string[];
};

export default function GenreFilter({ id, defaultValue }: GenreFilterProps) {
  const { t } = useTranslation();
  const anchor = useComboboxAnchor();
  const [selected, setSelected] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [genres, setGenres] = useState<string[]>([]);
  const [nextPage, setNextPage] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const request = useRef<AbortController | null>(null);

  async function load(page: number, search: string) {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setLoading(true);

    try {
      const result = await fetchGenres(search, page, controller.signal);
      setGenres((current) => (page === 1 ? result.genres : [...current, ...result.genres]));
      setNextPage(result.next_page);
    } catch {
      if (!controller.signal.aborted) setNextPage(null);
    } finally {
      if (request.current === controller) setLoading(false);
    }
  }

  useEffect(() => {
    if (!open) return;

    const timeout = setTimeout(() => load(1, query), DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [open, query]);

  function handleScroll(event: React.UIEvent<HTMLDivElement>) {
    const list = event.currentTarget;
    const nearEnd =
      list.scrollHeight - list.scrollTop - list.clientHeight < LOAD_MORE_THRESHOLD_PX;

    if (nearEnd && nextPage && !loading) load(nextPage, query);
  }

  return (
    <>
      <Combobox
        multiple
        items={genres}
        filter={null}
        value={selected}
        onValueChange={setSelected}
        inputValue={query}
        onInputValueChange={setQuery}
        open={open}
        onOpenChange={setOpen}
      >
        <ComboboxChips ref={anchor}>
          <ComboboxValue>
            {(values: string[]) => (
              <Fragment>
                {values.map((value) => (
                  <ComboboxChip key={value}>{value}</ComboboxChip>
                ))}
                <ComboboxChipsInput
                  id={id}
                  placeholder={values.length ? undefined : t("books.filters.all_genres")}
                />
              </Fragment>
            )}
          </ComboboxValue>
        </ComboboxChips>
        <ComboboxContent anchor={anchor}>
          <ComboboxEmpty>
            {loading ? t("books.filters.loading_genres") : t("books.filters.no_genres")}
          </ComboboxEmpty>
          <ComboboxList onScroll={handleScroll}>
            {(genre: string) => (
              <ComboboxItem key={genre} value={genre}>
                {genre}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>

      {selected.map((genre) => (
        <input key={genre} type="hidden" name="genres[]" value={genre} />
      ))}
    </>
  );
}
