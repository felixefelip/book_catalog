import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import Form from "@/pages/books/form";
import New from "@/pages/books/new";
import type { Book } from "@/pages/books/types";

vi.mock("@/pages/books/form", () => ({ default: vi.fn(() => null) }));

const book: Book = {
  id: 0,
  title: "",
  authors: [],
  published_year: null,
  genres: [],
  description: null,
  cover_url: null,
  can: { update: false, destroy: false },
};

describe("Books new", () => {
  it("renders the form posting to the books endpoint", () => {
    render(<New book={book} />);

    expect(screen.getByRole("heading", { level: 1, name: "Novo livro" })).toBeInTheDocument();
    expect(Form).toHaveBeenCalledWith(
      { book, action: "/books", method: "post", submitText: "Cadastrar livro" },
      undefined,
    );
  });

  it("links back to the books list", () => {
    render(<New book={book} />);

    expect(screen.getByRole("link", { name: "Voltar para a lista" })).toHaveAttribute("href", "/books");
  });
});
