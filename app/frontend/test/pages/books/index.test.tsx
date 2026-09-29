import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import Index from "@/pages/books";
import type { Book } from "@/pages/books/types";

vi.mock("@/pages/books/filters", () => ({ default: () => null }));

const buildBook = (attributes: Partial<Book> = {}): Book => ({
  id: 1,
  title: "Dom Casmurro",
  authors: ["Machado de Assis"],
  published_year: 1899,
  genres: [],
  description: null,
  cover_url: null,
  can: { update: false, destroy: false },
  ...attributes,
});

const renderIndex = (books: Book[], { books_count = books.length, filters = {} } = {}) =>
  render(
    <Index
      books={books}
      pagination={{ current_page: 1, total_pages: 1, total_count: books.length }}
      filters={filters}
      books_count={books_count}
    />,
  );

describe("Books index", () => {
  it("shows the empty state when there are no books", () => {
    renderIndex([], { books_count: 0 });

    expect(screen.getByText("Nenhum livro cadastrado.")).toBeInTheDocument();
  });

  it("shows the no results state when the filters match nothing", () => {
    renderIndex([], { books_count: 3, filters: { title: "xyz" } });

    expect(screen.getByText("Nenhum livro encontrado.")).toBeInTheDocument();
    expect(screen.getByText("0 de 3 livros")).toBeInTheDocument();
  });

  it("links the title to the book and shows authors and year", () => {
    renderIndex([buildBook()]);

    expect(screen.getByRole("link", { name: "Dom Casmurro" })).toHaveAttribute("href", "/books/1");
    expect(screen.getByText("Machado de Assis · 1899")).toBeInTheDocument();
    expect(screen.getByText("1 livro")).toBeInTheDocument();
  });

  it("shows the edit icon only for books the user can update", () => {
    renderIndex([
      buildBook({ id: 1, title: "Meu livro", can: { update: true, destroy: true } }),
      buildBook({ id: 2, title: "Livro alheio" }),
    ]);

    const editLinks = screen.getAllByRole("button", { name: "Editar" });
    expect(editLinks).toHaveLength(1);
    expect(editLinks[0]).toHaveAttribute("href", "/books/1/edit");
  });

  it("limits the genres shown on the card", () => {
    renderIndex([buildBook({ genres: ["Romance", "Drama", "Clássico", "Realismo", "Brasil"] })]);

    expect(screen.getByText("Clássico")).toBeInTheDocument();
    expect(screen.queryByText("Realismo")).not.toBeInTheDocument();
    expect(screen.getByText("+2")).toBeInTheDocument();
  });
});
