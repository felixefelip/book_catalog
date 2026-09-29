import { router, usePage } from "@inertiajs/react";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import Filters from "@/pages/books/filters";
import type { BookFilters } from "@/pages/books/types";
import type { CurrentUser } from "@/types";

vi.mock("@inertiajs/react", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@inertiajs/react")>()),
  usePage: vi.fn(),
}));

const user: CurrentUser = {
  id: 1,
  name: "Felipe",
  last_name: "Felix",
  email_address: "felipe@example.com",
};

const renderFilters = (filters: BookFilters = {}, current_user: CurrentUser | null = user) => {
  vi.mocked(usePage).mockReturnValue({ url: "/books", props: { current_user, locale: "pt-BR" } } as never);

  return render(<Filters filters={filters} />);
};

const submit = () => userEvent.click(screen.getByRole("button", { name: "Filtrar" }));

const lastVisit = () => vi.mocked(router.get).mock.lastCall!;

const visitedQuery = () => {
  const url = new URL(String(lastVisit()[0]), "http://localhost");
  expect(url.pathname).toBe("/books");

  return url.searchParams;
};

beforeEach(() => {
  vi.spyOn(router, "get").mockImplementation(() => {});
});

afterEach(() => vi.restoreAllMocks());

describe("Books filters", () => {
  it("fills the fields with the current filters", () => {
    const { container } = renderFilters({
      title: "duna",
      authors: ["Frank Herbert"],
      genres: ["Ficção científica"],
      year_from: "1960",
      year_to: "1970",
      mine: "1",
    });

    expect(screen.getByLabelText("Título")).toHaveValue("duna");
    expect(screen.getByLabelText("Publicado a partir de")).toHaveValue(1960);
    expect(screen.getByLabelText("Publicado até")).toHaveValue(1970);
    expect(screen.getByRole("checkbox", { name: "Somente cadastrados por mim" })).toBeChecked();
    expect(container.querySelector('input[name="authors[]"]')).toHaveValue("Frank Herbert");
    expect(container.querySelector('input[name="genres[]"]')).toHaveValue("Ficção científica");
  });

  it("hides the only mine option from guests", () => {
    renderFilters({}, null);

    expect(screen.queryByRole("checkbox", { name: "Somente cadastrados por mim" })).not.toBeInTheDocument();
  });

  it("shows the clear link only when there are filters", () => {
    const { unmount } = renderFilters();
    expect(screen.queryByRole("button", { name: "Limpar filtros" })).not.toBeInTheDocument();
    unmount();

    renderFilters({ title: "duna" });
    expect(screen.getByRole("button", { name: "Limpar filtros" })).toHaveAttribute("href", "/books");
  });

  it("submits the typed filters in the query string", async () => {
    renderFilters();

    await userEvent.type(screen.getByLabelText("Título"), "duna");
    await userEvent.type(screen.getByLabelText("Publicado até"), "1970");
    await submit();

    const query = visitedQuery();
    expect(query.get("title")).toBe("duna");
    expect(query.get("year_to")).toBe("1970");
    expect(lastVisit()[2]).toEqual(
      expect.objectContaining({ preserveScroll: true, preserveState: true, replace: true }),
    );
  });

  it("submits the selected authors, genres and the only mine option", async () => {
    renderFilters({ authors: ["Frank Herbert"], genres: ["Ficção científica"] });

    await userEvent.click(screen.getByRole("checkbox", { name: "Somente cadastrados por mim" }));
    await submit();

    const query = visitedQuery();
    expect(query.getAll("authors[]")).toEqual(["Frank Herbert"]);
    expect(query.getAll("genres[]")).toEqual(["Ficção científica"]);
    expect(query.get("mine")).toBe("1");
  });

  it("disables the submit while filtering", async () => {
    renderFilters();

    await submit();
    act(() => lastVisit()[2]!.onStart!({} as never));
    expect(screen.getByRole("button", { name: "Filtrar" })).toBeDisabled();

    act(() => lastVisit()[2]!.onFinish!({} as never));
    expect(screen.getByRole("button", { name: "Filtrar" })).toBeEnabled();
  });
});
