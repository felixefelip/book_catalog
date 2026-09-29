import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import PaginationNav from "@/components/pagination_nav";

const renderNav = (current_page: number, total_pages: number, params = {}) =>
  render(
    <PaginationNav
      pagination={{ current_page, total_pages, total_count: total_pages * 12 }}
      path="/books"
      params={params}
    />,
  );

describe("PaginationNav", () => {
  it("renders nothing when there is a single page", () => {
    const { container } = renderNav(1, 1);

    expect(container).toBeEmptyDOMElement();
  });

  it("marks the current page and disables previous on the first page", () => {
    renderNav(1, 3);

    expect(screen.getByRole("button", { name: "Página 1" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: "Ir para a página anterior" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Ir para a próxima página" })).toHaveAttribute(
      "href",
      "/books?page=2",
    );
  });

  it("collapses distant pages into ellipses", () => {
    renderNav(5, 10);

    const pages = screen
      .getAllByRole("button", { name: /^Página/ })
      .map((link) => link.textContent);
    expect(pages).toEqual(["1", "4", "5", "6", "10"]);
    expect(screen.getAllByText("More pages")).toHaveLength(2);
  });

  it("keeps the filters in the page links", () => {
    renderNav(1, 2, { title: "dune", genres: ["Ficção", "Drama"] });

    expect(screen.getByRole("button", { name: "Página 2" })).toHaveAttribute(
      "href",
      "/books?title=dune&genres%5B%5D=Fic%C3%A7%C3%A3o&genres%5B%5D=Drama&page=2",
    );
  });
});
