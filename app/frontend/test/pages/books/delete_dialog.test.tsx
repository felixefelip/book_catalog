import { router } from "@inertiajs/react";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import DeleteDialog from "@/pages/books/delete_dialog";
import type { Book } from "@/pages/books/types";

const book: Book = {
  id: 7,
  title: "Dom Casmurro",
  authors: [],
  published_year: null,
  genres: [],
  description: null,
  cover_url: null,
  can: { update: true, destroy: true },
};

const openDialog = async () => {
  const user = userEvent.setup();
  render(<DeleteDialog book={book} />);
  await user.click(screen.getByRole("button", { name: "Excluir" }));

  return { user, dialog: await screen.findByRole("alertdialog", { name: "Excluir livro?" }) };
};

const lastVisitOptions = () => vi.mocked(router.delete).mock.lastCall![1]!;

beforeEach(() => {
  vi.spyOn(router, "delete").mockImplementation(() => {});
});

afterEach(() => vi.restoreAllMocks());

describe("DeleteDialog", () => {
  it("asks for confirmation before deleting", async () => {
    const { dialog } = await openDialog();

    expect(dialog).toBeInTheDocument();
    expect(router.delete).not.toHaveBeenCalled();
  });

  it("closes without deleting when cancelled", async () => {
    const { user } = await openDialog();

    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(router.delete).not.toHaveBeenCalled();
  });

  it("deletes the book when confirmed", async () => {
    const { user, dialog } = await openDialog();

    await user.click(within(dialog).getByRole("button", { name: "Excluir" }));

    expect(router.delete).toHaveBeenCalledWith("/books/7", expect.any(Object));
  });

  it("disables the confirmation while the request is in progress", async () => {
    const { user, dialog } = await openDialog();
    await user.click(within(dialog).getByRole("button", { name: "Excluir" }));

    act(() => lastVisitOptions().onStart!({} as never));
    expect(within(dialog).getByRole("button", { name: "Excluindo..." })).toBeDisabled();

    act(() => lastVisitOptions().onFinish!({} as never));
    expect(within(dialog).getByRole("button", { name: "Excluir" })).toBeEnabled();
  });
});
