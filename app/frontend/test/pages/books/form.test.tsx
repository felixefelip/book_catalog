import { router } from "@inertiajs/react";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import Form from "@/pages/books/form";
import { fetchOpenLibraryDescription, searchOpenLibrary } from "@/pages/books/open_library";
import type { Book, OpenLibraryBook } from "@/pages/books/types";

vi.mock("@/pages/books/open_library");

const emptyBook: Book = {
  id: 0,
  title: "",
  authors: [],
  published_year: null,
  genres: [],
  description: null,
  cover_url: null,
  can: { update: false, destroy: false },
};

const dune: OpenLibraryBook = {
  id: "OL1W",
  title: "Duna",
  authors: ["Frank Herbert"],
  published_year: 1965,
  subjects: ["Ficção científica", "Deserto"],
  cover_id: 123,
  cover_url: "https://covers.openlibrary.org/b/id/123-M.jpg",
};

const messiah: OpenLibraryBook = {
  ...dune,
  id: "OL2W",
  title: "O Messias de Duna",
  published_year: 1969,
  subjects: ["Messias"],
  cover_id: 456,
};

const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => (resolve = res));

  return { promise, resolve };
};

const renderForm = (book: Book = emptyBook, method: "post" | "patch" = "post") => {
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  const { container } = render(
    <Form book={book} action="/books" method={method} submitText="Cadastrar livro" />,
  );

  return { user, container, title: screen.getByRole("combobox", { name: "Título" }) };
};

const chooseBook = async (user: ReturnType<typeof userEvent.setup>, book: OpenLibraryBook) => {
  const title = screen.getByRole("combobox", { name: "Título" });
  await user.clear(title);
  await user.type(title, book.title);
  await act(() => vi.advanceTimersByTimeAsync(400));
  await user.click(screen.getByRole("option", { name: new RegExp(`^${book.title}`) }));
};

const chooseBookAndWaitDescription = async (
  user: ReturnType<typeof userEvent.setup>,
  book: OpenLibraryBook,
) => {
  await chooseBook(user, book);
  await waitFor(() => expect(submitButton()).toBeEnabled());
};

const submitButton = () => screen.getByRole("button", { name: /Cadastrar livro|Salvando/ });

const lastVisitOptions = (method: "post" | "patch") => vi.mocked(router[method]).mock.lastCall![2]!;

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  Element.prototype.scrollIntoView = vi.fn();
  vi.mocked(searchOpenLibrary).mockResolvedValue([dune, messiah]);
  vi.mocked(fetchOpenLibraryDescription).mockResolvedValue("Um clássico da ficção científica.");
  vi.spyOn(router, "post").mockImplementation(() => {});
  vi.spyOn(router, "patch").mockImplementation(() => {});
});

afterEach(() => {
  vi.useRealTimers();
  vi.resetAllMocks();
  vi.restoreAllMocks();
});

describe("Books form", () => {
  it("starts empty and keeps the submit disabled until a book is chosen", () => {
    renderForm();

    expect(screen.getByLabelText("Autores")).toHaveValue("");
    expect(screen.getByText("Nenhum gênero informado.")).toBeInTheDocument();
    expect(submitButton()).toBeDisabled();
  });

  it("shows the current values of the book being edited", () => {
    const { title } = renderForm({
      ...emptyBook,
      id: 1,
      title: "Dom Casmurro",
      authors: ["Machado de Assis"],
      published_year: 1899,
      genres: ["Romance"],
      description: "Bentinho e Capitu.",
    });

    expect(title).toHaveValue("Dom Casmurro");
    expect(screen.getByLabelText("Autores")).toHaveValue("Machado de Assis");
    expect(screen.getByLabelText("Ano de publicação")).toHaveValue("1899");
    expect(screen.getByText("Romance")).toBeInTheDocument();
    expect(screen.getByLabelText("Descrição")).toHaveValue("Bentinho e Capitu.");
    expect(submitButton()).toBeDisabled();
  });

  it("fills the fields with the chosen book and its description", async () => {
    const { user, title, container } = renderForm();

    await chooseBookAndWaitDescription(user, dune);

    expect(title).toHaveValue("Duna");
    expect(screen.getByLabelText("Autores")).toHaveValue("Frank Herbert");
    expect(screen.getByLabelText("Ano de publicação")).toHaveValue("1965");
    expect(screen.getByText("Ficção científica")).toBeInTheDocument();
    expect(container.querySelector("img")).toHaveAttribute("src", dune.cover_url);
    expect(fetchOpenLibraryDescription).toHaveBeenCalledWith("OL1W");
    expect(screen.getByLabelText("Descrição")).toHaveValue("Um clássico da ficção científica.");
    expect(submitButton()).toBeEnabled();
  });

  it("keeps the submit disabled while the description is loading", async () => {
    const description = deferred<string | null>();
    vi.mocked(fetchOpenLibraryDescription).mockReturnValue(description.promise);
    const { user } = renderForm();

    await chooseBook(user, dune);

    expect(screen.getByLabelText("Descrição")).toHaveAttribute("placeholder", "Carregando descrição...");
    expect(submitButton()).toBeDisabled();

    await act(async () => description.resolve("Um clássico."));

    expect(screen.getByLabelText("Descrição")).toHaveValue("Um clássico.");
    expect(submitButton()).toBeEnabled();
  });

  it("allows submitting without a description when it fails to load", async () => {
    vi.mocked(fetchOpenLibraryDescription).mockRejectedValue(new Error("boom"));
    const { user } = renderForm();

    await chooseBookAndWaitDescription(user, dune);

    expect(screen.getByLabelText("Descrição")).toHaveValue("");
    expect(submitButton()).toBeEnabled();

    await user.click(submitButton());

    expect(router.post).toHaveBeenCalledWith(
      "/books",
      { book: expect.objectContaining({ description: null }) },
      expect.any(Object),
    );
  });

  it("ignores the description of a previously chosen book that arrives late", async () => {
    const duneDescription = deferred<string | null>();
    const messiahDescription = deferred<string | null>();
    vi.mocked(fetchOpenLibraryDescription)
      .mockReturnValueOnce(duneDescription.promise)
      .mockReturnValueOnce(messiahDescription.promise);
    const { user } = renderForm();

    await chooseBook(user, dune);
    await chooseBook(user, messiah);
    await act(async () => messiahDescription.resolve("Paul Atreides imperador."));
    await act(async () => duneDescription.resolve("Paul Atreides em Arrakis."));

    expect(screen.getByLabelText("Descrição")).toHaveValue("Paul Atreides imperador.");
    expect(screen.getByLabelText("Ano de publicação")).toHaveValue("1969");
  });

  it("submits the chosen book to the given action", async () => {
    const { user } = renderForm();

    await chooseBookAndWaitDescription(user, dune);
    await user.click(submitButton());

    expect(router.post).toHaveBeenCalledWith(
      "/books",
      {
        book: {
          title: "Duna",
          author_names: ["Frank Herbert"],
          published_year: 1965,
          description: "Um clássico da ficção científica.",
          genre_names: ["Ficção científica", "Deserto"],
          open_library_cover_id: 123,
        },
      },
      expect.any(Object),
    );
  });

  it("uses the given method", async () => {
    const { user } = renderForm({ ...emptyBook, id: 1, title: "Dom Casmurro" }, "patch");

    await chooseBookAndWaitDescription(user, dune);
    await user.click(submitButton());

    expect(router.patch).toHaveBeenCalledWith("/books", expect.any(Object), expect.any(Object));
    expect(router.post).not.toHaveBeenCalled();
  });

  it("shows the progress while saving", async () => {
    const { user } = renderForm();

    await chooseBookAndWaitDescription(user, dune);
    await user.click(submitButton());

    act(() => lastVisitOptions("post").onStart!({} as never));
    expect(submitButton()).toHaveTextContent("Salvando...");
    expect(submitButton()).toBeDisabled();

    act(() => lastVisitOptions("post").onFinish!({} as never));
    expect(submitButton()).toHaveTextContent("Cadastrar livro");
    expect(submitButton()).toBeEnabled();
  });

  it("shows the validation errors returned by the server", async () => {
    const { user, title } = renderForm();

    await chooseBookAndWaitDescription(user, dune);
    await user.click(submitButton());
    act(() => lastVisitOptions("post").onError!({ title: ["já foi cadastrado"] } as never));

    expect(screen.getByText("já foi cadastrado")).toBeInTheDocument();
    expect(title).toHaveAttribute("aria-invalid", "true");
  });
});
