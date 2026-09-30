import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import BookCover from "@/pages/books/book_cover";

describe("BookCover", () => {
  it("shows the cover", () => {
    const { container } = render(<BookCover url="/capa.png" />);

    expect(container.querySelector("img")).toHaveAttribute("src", "/capa.png");
  });

  it("shows a placeholder when there is no cover", () => {
    const { container } = render(<BookCover url={null} />);

    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("svg")).toBeInTheDocument();
  });
});
