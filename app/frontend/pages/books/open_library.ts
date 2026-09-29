import type { OpenLibraryBook } from "./types";

async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, {
    signal,
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error(`Open Library request failed: ${response.status}`);

  return response.json();
}

export function searchOpenLibrary(query: string, signal?: AbortSignal) {
  return getJson<OpenLibraryBook[]>(
    `/open_library/books?q=${encodeURIComponent(query)}`,
    signal,
  );
}

export async function fetchOpenLibraryDescription(id: string) {
  const { description } = await getJson<{ description: string | null }>(
    `/open_library/books/${id}`,
  );

  return description;
}
