import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Show from "@/pages/books/show";
import type { Book } from "@/pages/books/types";

type ShowBook = Book & { creator_name: string; created_on: string };

const buildBook = (attributes: Partial<ShowBook> = {}): ShowBook => ({
  id: 1,
  title: "Dom Casmurro",
  authors: ["Machado de Assis"],
  published_year: 1899,
  genres: ["Romance", "Realismo"],
  description: "Bentinho e Capitu.",
  cover_url: null,
  can: { update: false, destroy: false },
  creator_name: "Felipe Felix",
  created_on: "29/09/2026",
  ...attributes,
});

describe("Books show", () => {
  it("shows the book details", () => {
    render(<Show book={buildBook()} />);

    expect(screen.getByRole("heading", { level: 1, name: "Dom Casmurro" })).toBeInTheDocument();
    expect(screen.getByText("Machado de Assis")).toBeInTheDocument();
    expect(screen.getByText("Cadastrado por Felipe Felix em 29/09/2026")).toBeInTheDocument();
    expect(screen.getByText("1899")).toBeInTheDocument();
    expect(screen.getByText("Romance")).toBeInTheDocument();
    expect(screen.getByText("Realismo")).toBeInTheDocument();
    expect(screen.getByText("Bentinho e Capitu.")).toBeInTheDocument();
  });

  it("hides the optional details when they are missing", () => {
    render(<Show book={buildBook({ authors: [], published_year: null, genres: [], description: null })} />);

    expect(screen.queryByText("Ano de publicação")).not.toBeInTheDocument();
    expect(screen.queryByText("Gêneros")).not.toBeInTheDocument();
    expect(screen.getByText("Este livro ainda não tem descrição.")).toBeInTheDocument();
  });

  it("hides the year when only the genres are present", () => {
    render(<Show book={buildBook({ published_year: null })} />);

    expect(screen.queryByText("Ano de publicação")).not.toBeInTheDocument();
    expect(screen.getByText("Gêneros")).toBeInTheDocument();
  });

  it("hides the genres when only the year is present", () => {
    render(<Show book={buildBook({ genres: [] })} />);

    expect(screen.queryByText("Gêneros")).not.toBeInTheDocument();
    expect(screen.getByText("Ano de publicação")).toBeInTheDocument();
  });

  it("links back to the books list", () => {
    render(<Show book={buildBook()} />);

    expect(screen.getByRole("link", { name: "Voltar para a lista" })).toHaveAttribute("href", "/books");
  });

  it("hides the edit and delete actions when the user cannot manage the book", () => {
    render(<Show book={buildBook()} />);

    expect(screen.queryByRole("button", { name: "Editar" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Excluir" })).not.toBeInTheDocument();
  });

  it("shows the edit action when the user can update the book", () => {
    render(<Show book={buildBook({ can: { update: true, destroy: false } })} />);

    expect(screen.getByRole("button", { name: "Editar" })).toHaveAttribute("href", "/books/1/edit");
    expect(screen.queryByRole("button", { name: "Excluir" })).not.toBeInTheDocument();
  });

  it("shows the delete action when the user can destroy the book", () => {
    render(<Show book={buildBook({ can: { update: false, destroy: true } })} />);

    expect(screen.getByRole("button", { name: "Excluir" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Editar" })).not.toBeInTheDocument();
  });
});
