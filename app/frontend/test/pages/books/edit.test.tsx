import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import Edit from "@/pages/books/edit";
import Form from "@/pages/books/form";
import type { Book } from "@/pages/books/types";

vi.mock("@/pages/books/form", () => ({ default: vi.fn(() => null) }));

const buildBook = (can: Book["can"] = { update: true, destroy: false }): Book => ({
  id: 7,
  title: "Dom Casmurro",
  authors: ["Machado de Assis"],
  published_year: 1899,
  genres: ["Romance"],
  description: null,
  cover_url: null,
  can,
});

describe("Books edit", () => {
  it("renders the form patching the book endpoint", () => {
    const book = buildBook();
    render(<Edit book={book} />);

    expect(screen.getByRole("heading", { level: 1, name: "Editar livro" })).toBeInTheDocument();
    expect(Form).toHaveBeenCalledWith(
      { book, action: "/books/7", method: "patch", submitText: "Salvar alterações" },
      undefined,
    );
    expect(screen.getByRole("link", { name: "Voltar para a lista" })).toHaveAttribute("href", "/books");
  });

  it("shows the delete button only when the book can be destroyed", () => {
    const { unmount } = render(<Edit book={buildBook()} />);
    expect(screen.queryByRole("button", { name: "Excluir" })).not.toBeInTheDocument();
    unmount();

    render(<Edit book={buildBook({ update: true, destroy: true })} />);
    expect(screen.getByRole("button", { name: "Excluir" })).toBeInTheDocument();
  });
});
