import { Fragment, useEffect, useRef, useState } from "react";

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

type NamesPage = { names: string[]; next_page: number | null };

async function fetchNames(url: string, query: string, page: number, signal: AbortSignal) {
  const params = new URLSearchParams({ q: query, page: String(page) });
  const response = await fetch(`${url}?${params}`, {
    signal,
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error(`Request to ${url} failed: ${response.status}`);

  return (await response.json()) as NamesPage;
}

type RemoteMultiSelectProps = {
  id: string;
  name: string;
  url: string;
  defaultValue: string[];
  placeholder: string;
  loadingText: string;
  emptyText: string;
};

export default function RemoteMultiSelect({
  id,
  name,
  url,
  defaultValue,
  placeholder,
  loadingText,
  emptyText,
}: RemoteMultiSelectProps) {
  const anchor = useComboboxAnchor();
  const [selected, setSelected] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<string[]>([]);
  const [nextPage, setNextPage] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const request = useRef<AbortController | null>(null);

  async function load(page: number, search: string) {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setLoading(true);

    try {
      const result = await fetchNames(url, search, page, controller.signal);
      setOptions((current) => (page === 1 ? result.names : [...current, ...result.names]));
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
        items={options}
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
                  placeholder={values.length ? undefined : placeholder}
                />
              </Fragment>
            )}
          </ComboboxValue>
        </ComboboxChips>
        <ComboboxContent anchor={anchor}>
          <ComboboxEmpty>
            {loading ? loadingText : emptyText}
          </ComboboxEmpty>
          <ComboboxList onScroll={handleScroll}>
            {(option: string) => (
              <ComboboxItem key={option} value={option}>
                {option}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>

      {selected.map((value) => (
        <input key={value} type="hidden" name={`${name}[]`} value={value} />
      ))}
    </>
  );
}
