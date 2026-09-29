import { afterEach, describe, expect, it, vi } from "vitest";

import { fetchOpenLibraryDescription, searchOpenLibrary } from "@/pages/books/open_library";

const mockFetch = (body: unknown, ok = true, status = 200) =>
  vi.spyOn(globalThis, "fetch").mockResolvedValue({
    ok,
    status,
    json: () => Promise.resolve(body),
  } as Response);

afterEach(() => vi.restoreAllMocks());

describe("searchOpenLibrary", () => {
  it("requests the encoded query and returns the books", async () => {
    const books = [{ id: "OL1W", title: "Dom Casmurro" }];
    const fetch = mockFetch(books);

    await expect(searchOpenLibrary("dom casmurro & cia")).resolves.toEqual(books);
    expect(fetch).toHaveBeenCalledWith(
      "/open_library/books?q=dom%20casmurro%20%26%20cia",
      expect.objectContaining({ headers: { Accept: "application/json" } }),
    );
  });

  it("throws when the response is not ok", async () => {
    mockFetch({}, false, 502);

    await expect(searchOpenLibrary("dune")).rejects.toThrow("Open Library request failed: 502");
  });
});

describe("fetchOpenLibraryDescription", () => {
  it("returns the description of the book", async () => {
    const fetch = mockFetch({ description: "Um clássico." });

    await expect(fetchOpenLibraryDescription("OL1W")).resolves.toBe("Um clássico.");
    expect(fetch).toHaveBeenCalledWith("/open_library/books/OL1W", expect.anything());
  });
});
