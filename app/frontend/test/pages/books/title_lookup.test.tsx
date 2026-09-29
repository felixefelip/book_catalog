import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { searchOpenLibrary } from "@/pages/books/open_library";
import TitleLookup from "@/pages/books/title_lookup";
import type { OpenLibraryBook } from "@/pages/books/types";

vi.mock("@/pages/books/open_library");

const buildBook = (attributes: Partial<OpenLibraryBook> = {}): OpenLibraryBook => ({
  id: "OL1W",
  title: "Duna",
  authors: ["Frank Herbert"],
  published_year: 1965,
  subjects: [],
  cover_id: null,
  cover_url: null,
  ...attributes,
});

const books = [
  buildBook(),
  buildBook({ id: "OL2W", title: "O Messias de Duna", published_year: 1969 }),
  buildBook({ id: "OL3W", title: "Os Filhos de Duna", published_year: 1976 }),
];

function Wrapper({ onSelect }: { onSelect: (book: OpenLibraryBook) => void }) {
  const [value, setValue] = useState("");

  return <TitleLookup aria-label="Título" value={value} onChange={setValue} onSelect={onSelect} />;
}

const renderLookup = () => {
  const onSelect = vi.fn();
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  render(<Wrapper onSelect={onSelect} />);

  return { user, onSelect, input: screen.getByRole("combobox", { name: "Título" }) };
};

const waitDebounce = () => act(() => vi.advanceTimersByTimeAsync(400));

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  Element.prototype.scrollIntoView = vi.fn();
  vi.mocked(searchOpenLibrary).mockResolvedValue(books);
});

afterEach(() => {
  vi.useRealTimers();
  vi.resetAllMocks();
});

describe("TitleLookup", () => {
  it("does not search with fewer than 3 characters", async () => {
    const { user, input } = renderLookup();

    await user.type(input, "du");
    await waitDebounce();

    expect(searchOpenLibrary).not.toHaveBeenCalled();
  });

  it("searches only once after the user stops typing", async () => {
    const { user, input } = renderLookup();

    await user.type(input, "duna ");
    expect(searchOpenLibrary).not.toHaveBeenCalled();

    await waitDebounce();

    expect(searchOpenLibrary).toHaveBeenCalledTimes(1);
    expect(searchOpenLibrary).toHaveBeenCalledWith("duna", expect.any(AbortSignal));
  });

  it("lists the suggestions with authors and year", async () => {
    const { user, input } = renderLookup();

    await user.type(input, "duna");
    await waitDebounce();

    expect(input).toHaveAttribute("aria-expanded", "true");
    expect(screen.getAllByRole("option")).toHaveLength(3);
    expect(screen.getByText("Frank Herbert · 1969")).toBeInTheDocument();
  });

  it("selects a suggestion on click and closes the list", async () => {
    const { user, input, onSelect } = renderLookup();

    await user.type(input, "duna");
    await waitDebounce();
    await user.click(screen.getByRole("option", { name: /O Messias de Duna/ }));

    expect(onSelect).toHaveBeenCalledWith(books[1]);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("navigates the suggestions with the arrow keys and selects with Enter", async () => {
    const { user, input, onSelect } = renderLookup();

    await user.type(input, "duna");
    await waitDebounce();

    await user.keyboard("{ArrowDown}");
    expect(screen.getAllByRole("option")[0]).toHaveAttribute("aria-selected", "true");

    await user.keyboard("{ArrowUp}");
    const last = screen.getAllByRole("option")[2];
    expect(last).toHaveAttribute("aria-selected", "true");
    expect(input).toHaveAttribute("aria-activedescendant", last.id);

    await user.keyboard("{ArrowDown}{Enter}");
    expect(onSelect).toHaveBeenCalledWith(books[0]);
  });

  it("closes the suggestions with Escape", async () => {
    const { user, input, onSelect } = renderLookup();

    await user.type(input, "duna");
    await waitDebounce();
    await user.keyboard("{Escape}");

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(input).toHaveAttribute("aria-expanded", "false");
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("shows a loading message while searching", async () => {
    vi.mocked(searchOpenLibrary).mockReturnValue(new Promise(() => {}));
    const { user, input } = renderLookup();

    await user.type(input, "duna");
    await waitDebounce();

    expect(screen.getByText("Buscando na Open Library...")).toBeInTheDocument();
  });

  it("shows an error message when the search fails", async () => {
    vi.mocked(searchOpenLibrary).mockRejectedValue(new Error("boom"));
    const { user, input } = renderLookup();

    await user.type(input, "duna");
    await waitDebounce();

    expect(screen.getByText("Não foi possível consultar a Open Library.")).toBeInTheDocument();
  });

  it("shows a message when nothing is found", async () => {
    vi.mocked(searchOpenLibrary).mockResolvedValue([]);
    const { user, input } = renderLookup();

    await user.type(input, "xyzw");
    await waitDebounce();

    expect(screen.getByText("Nenhum livro encontrado na Open Library.")).toBeInTheDocument();
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });
});
