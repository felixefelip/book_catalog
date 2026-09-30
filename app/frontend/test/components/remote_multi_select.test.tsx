import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import RemoteMultiSelect from "@/components/remote_multi_select";

type NamesPage = { names: string[]; next_page: number | null };

const jsonResponse = (body: NamesPage) =>
  ({ ok: true, status: 200, json: async () => body }) as Response;

const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => (resolve = res));

  return { promise, resolve };
};

const fetchMock = () => vi.mocked(globalThis.fetch);

const requestedParams = (call = fetchMock().mock.lastCall!) => {
  const url = new URL(String(call[0]), "http://localhost");
  expect(url.pathname).toBe("/authors");

  return url.searchParams;
};

const renderSelect = (defaultValue: string[] = []) => {
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  const { container } = render(
    <RemoteMultiSelect
      id="authors"
      name="authors"
      url="/authors"
      defaultValue={defaultValue}
      placeholder="Todos os autores"
      loadingText="Carregando autores..."
      emptyText="Nenhum autor encontrado."
    />,
  );

  return { user, container, input: screen.getByRole("combobox") };
};

const hiddenValues = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLInputElement>('input[name="authors[]"]')).map(
    (input) => input.value,
  );

const openAndLoad = async (user: ReturnType<typeof userEvent.setup>, input: HTMLElement) => {
  await user.click(input);
  await act(() => vi.advanceTimersByTimeAsync(300));
};

const scrollToEnd = (list: HTMLElement) => {
  Object.defineProperty(list, "scrollHeight", { configurable: true, value: 500 });
  Object.defineProperty(list, "clientHeight", { configurable: true, value: 200 });
  list.scrollTop = 290;
  fireEvent.scroll(list);
};

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  Element.prototype.scrollIntoView = vi.fn();
  vi.spyOn(globalThis, "fetch").mockResolvedValue(
    jsonResponse({ names: ["Frank Herbert", "Isaac Asimov"], next_page: null }),
  );
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("RemoteMultiSelect", () => {
  it("shows the placeholder when nothing is selected", () => {
    const { input, container } = renderSelect();

    expect(input).toHaveAttribute("placeholder", "Todos os autores");
    expect(hiddenValues(container)).toEqual([]);
  });

  it("renders the default values as chips and hidden inputs", () => {
    const { input, container } = renderSelect(["Frank Herbert"]);

    expect(screen.getByText("Frank Herbert")).toBeInTheDocument();
    expect(input).not.toHaveAttribute("placeholder");
    expect(hiddenValues(container)).toEqual(["Frank Herbert"]);
  });

  it("does not fetch until it is opened", async () => {
    renderSelect();

    await act(() => vi.advanceTimersByTimeAsync(1000));

    expect(fetch).not.toHaveBeenCalled();
  });

  it("loads the first page when opened", async () => {
    const { user, input } = renderSelect();

    await openAndLoad(user, input);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(requestedParams().get("q")).toBe("");
    expect(requestedParams().get("page")).toBe("1");
    expect(fetchMock().mock.lastCall![1]).toEqual(
      expect.objectContaining({ headers: { Accept: "application/json" } }),
    );
    expect(screen.getByRole("option", { name: "Frank Herbert" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Isaac Asimov" })).toBeInTheDocument();
  });

  it("debounces the search while typing", async () => {
    const { user, input } = renderSelect();

    await openAndLoad(user, input);
    fetchMock().mockClear();

    await user.type(input, "fra");
    await act(() => vi.advanceTimersByTimeAsync(300));

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(requestedParams().get("q")).toBe("fra");
  });

  it("adds and removes the selected options as hidden inputs", async () => {
    const { user, input, container } = renderSelect();

    await openAndLoad(user, input);
    await user.click(screen.getByRole("option", { name: "Frank Herbert" }));

    expect(hiddenValues(container)).toEqual(["Frank Herbert"]);

    await user.click(container.querySelector("[data-slot=combobox-chip-remove]")!);

    expect(hiddenValues(container)).toEqual([]);
  });

  it("shows the loading text while fetching and the empty text when there are no results", async () => {
    const response = deferred<Response>();
    fetchMock().mockReturnValueOnce(response.promise);
    const { user, input } = renderSelect();

    await openAndLoad(user, input);

    expect(screen.getByText("Carregando autores...")).toBeInTheDocument();

    await act(async () => response.resolve(jsonResponse({ names: [], next_page: null })));

    expect(screen.getByText("Nenhum autor encontrado.")).toBeInTheDocument();
  });

  it("appends the next page when scrolling near the end of the list", async () => {
    fetchMock()
      .mockResolvedValueOnce(jsonResponse({ names: ["Frank Herbert"], next_page: 2 }))
      .mockResolvedValueOnce(jsonResponse({ names: ["Isaac Asimov"], next_page: null }));
    const { user, input } = renderSelect();

    await openAndLoad(user, input);
    await act(async () => scrollToEnd(screen.getByRole("listbox")));

    expect(requestedParams().get("page")).toBe("2");
    expect(screen.getByRole("option", { name: "Frank Herbert" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Isaac Asimov" })).toBeInTheDocument();

    await act(async () => scrollToEnd(screen.getByRole("listbox")));

    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("does not load more when scrolling far from the end", async () => {
    fetchMock().mockResolvedValueOnce(jsonResponse({ names: ["Frank Herbert"], next_page: 2 }));
    const { user, input } = renderSelect();

    await openAndLoad(user, input);
    const list = screen.getByRole("listbox");
    Object.defineProperty(list, "scrollHeight", { configurable: true, value: 500 });
    Object.defineProperty(list, "clientHeight", { configurable: true, value: 200 });
    list.scrollTop = 0;
    await act(async () => fireEvent.scroll(list));

    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("stops paginating when the request fails", async () => {
    fetchMock()
      .mockResolvedValueOnce(jsonResponse({ names: ["Frank Herbert"], next_page: 2 }))
      .mockResolvedValueOnce({ ok: false, status: 500 } as Response);
    const { user, input } = renderSelect();

    await openAndLoad(user, input);
    await act(async () => scrollToEnd(screen.getByRole("listbox")));
    await act(async () => scrollToEnd(screen.getByRole("listbox")));

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(screen.getByRole("option", { name: "Frank Herbert" })).toBeInTheDocument();
  });

  it("aborts the previous request when a new search starts", async () => {
    fetchMock()
      .mockImplementationOnce(
        (_url, init) =>
          new Promise((_resolve, reject) =>
            init!.signal!.addEventListener("abort", () =>
              reject(new DOMException("Aborted", "AbortError")),
            ),
          ),
      )
      .mockResolvedValueOnce(jsonResponse({ names: ["Frank Herbert"], next_page: null }));
    const { user, input } = renderSelect();

    await openAndLoad(user, input);
    await user.type(input, "fra");
    await act(() => vi.advanceTimersByTimeAsync(300));

    expect(fetchMock().mock.calls[0][1]!.signal!.aborted).toBe(true);
    expect(screen.getByRole("option", { name: "Frank Herbert" })).toBeInTheDocument();
    expect(screen.queryByText("Carregando autores...")).not.toBeInTheDocument();
  });
});
