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

const chips = (container: HTMLElement, id: string) =>
  Array.from(
    container
      .querySelector(`#${id}`)!
      .closest("[data-slot=combobox-chips]")!
      .querySelectorAll("[data-slot=combobox-chip]"),
  ).map((chip) => chip.textContent);

const namesResponse = (names: string[]) =>
  ({ ok: true, status: 200, json: async () => ({ names, next_page: null }) }) as Response;

const typeInSelect = async (user: ReturnType<typeof userEvent.setup>, label: string, text: string) => {
  const input = screen.getByLabelText(label);
  await user.click(input);
  await user.type(input, text);
  await act(() => vi.advanceTimersByTimeAsync(300));
};

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  Element.prototype.scrollIntoView = vi.fn();
  vi.mocked(searchOpenLibrary).mockResolvedValue([dune, messiah]);
  vi.mocked(fetchOpenLibraryDescription).mockResolvedValue("Um clássico da ficção científica.");
  vi.spyOn(router, "post").mockImplementation(() => {});
  vi.spyOn(router, "patch").mockImplementation(() => {});
  vi.spyOn(globalThis, "fetch").mockImplementation(async (url) =>
    namesResponse(String(url).startsWith("/authors") ? ["Frank Herbert", "Brian Herbert"] : ["Romance"]),
  );
});

afterEach(() => {
  vi.useRealTimers();
  vi.resetAllMocks();
  vi.restoreAllMocks();
});

describe("Books form", () => {
  it("starts empty and keeps the submit disabled until a title is typed", async () => {
    const { user, title, container } = renderForm();

    expect(chips(container, "authors")).toEqual([]);
    expect(chips(container, "genres")).toEqual([]);
    expect(submitButton()).toBeDisabled();

    await user.type(title, "Livro sem cadastro");

    expect(submitButton()).toBeEnabled();
  });

  it("shows the current values of the book being edited", () => {
    const { title, container } = renderForm({
      ...emptyBook,
      id: 1,
      title: "Dom Casmurro",
      authors: ["Machado de Assis"],
      published_year: 1899,
      genres: ["Romance"],
      description: "Bentinho e Capitu.",
    });

    expect(title).toHaveValue("Dom Casmurro");
    expect(chips(container, "authors")).toEqual(["Machado de Assis"]);
    expect(screen.getByLabelText("Ano de publicação")).toHaveValue("1899");
    expect(chips(container, "genres")).toEqual(["Romance"]);
    expect(screen.getByLabelText("Descrição")).toHaveValue("Bentinho e Capitu.");
    expect(submitButton()).toBeEnabled();
  });

  it("fills the fields with the chosen book and its description", async () => {
    const { user, title, container } = renderForm();

    await chooseBookAndWaitDescription(user, dune);

    expect(title).toHaveValue("Duna");
    expect(chips(container, "authors")).toEqual(["Frank Herbert"]);
    expect(screen.getByLabelText("Ano de publicação")).toHaveValue("1965");
    expect(chips(container, "genres")).toEqual(["Ficção científica", "Deserto"]);
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
    expect(screen.getByLabelText("Descrição")).toHaveAttribute("readonly");
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
          published_year: "1965",
          description: "Um clássico da ficção científica.",
          genre_names: ["Ficção científica", "Deserto"],
          open_library_cover_id: 123,
        },
      },
      expect.any(Object),
    );
  });

  it("submits the fields edited after choosing a book", async () => {
    const { user } = renderForm();

    await chooseBookAndWaitDescription(user, dune);
    await user.clear(screen.getByLabelText("Ano de publicação"));
    await user.type(screen.getByLabelText("Ano de publicação"), "1966");
    await user.clear(screen.getByLabelText("Descrição"));
    await user.type(screen.getByLabelText("Descrição"), "Arrakis.");
    await user.click(submitButton());

    expect(router.post).toHaveBeenCalledWith(
      "/books",
      { book: expect.objectContaining({ published_year: "1966", description: "Arrakis.", open_library_cover_id: 123 }) },
      expect.any(Object),
    );
  });

  it("submits the edited book without touching its cover when no book is chosen", async () => {
    const { user, title } = renderForm(
      {
        ...emptyBook,
        id: 1,
        title: "Dom Casmurro",
        authors: ["Machado de Assis"],
        published_year: 1899,
        genres: ["Romance"],
        description: "Bentinho e Capitu.",
      },
      "patch",
    );

    await user.type(title, " (edição revisada)");
    await user.clear(screen.getByLabelText("Ano de publicação"));
    await user.click(submitButton());

    expect(router.patch).toHaveBeenCalledWith(
      "/books",
      {
        book: {
          title: "Dom Casmurro (edição revisada)",
          author_names: ["Machado de Assis"],
          published_year: null,
          description: "Bentinho e Capitu.",
          genre_names: ["Romance"],
        },
      },
      expect.any(Object),
    );
  });

  it("adds an existing author suggested by the autocomplete", async () => {
    const { user, title, container } = renderForm();

    await user.type(title, "Duna");
    await typeInSelect(user, "Autores", "herb");

    expect(fetch).toHaveBeenLastCalledWith("/authors?q=herb&page=1", expect.any(Object));

    await user.click(screen.getByRole("option", { name: "Frank Herbert" }));

    expect(chips(container, "authors")).toEqual(["Frank Herbert"]);
  });

  it("offers to add authors and genres that do not exist yet", async () => {
    const { user, title, container } = renderForm();

    await user.type(title, "Livro novo");
    await typeInSelect(user, "Autores", "Autora Nova");
    await user.click(screen.getByRole("option", { name: 'Adicionar "Autora Nova"' }));
    await typeInSelect(user, "Gêneros", "Fantasia{Enter}");

    expect(chips(container, "authors")).toEqual(["Autora Nova"]);
    expect(chips(container, "genres")).toEqual(["Fantasia"]);

    await user.click(submitButton());

    expect(router.post).toHaveBeenCalledWith(
      "/books",
      { book: expect.objectContaining({ author_names: ["Autora Nova"], genre_names: ["Fantasia"] }) },
      expect.any(Object),
    );
  });

  it("does not offer to add a name that is already suggested", async () => {
    const { user } = renderForm();

    await typeInSelect(user, "Autores", "frank herbert");

    expect(screen.getByRole("option", { name: "Frank Herbert" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: /Adicionar/ })).not.toBeInTheDocument();
  });

  it("removes a genre", async () => {
    const { user, container } = renderForm({ ...emptyBook, id: 1, title: "Duna", genres: ["Romance", "Deserto"] });

    await user.click(
      container
        .querySelector("#genres")!
        .closest("[data-slot=combobox-chips]")!
        .querySelector("[data-slot=combobox-chip-remove]")!,
    );

    expect(chips(container, "genres")).toEqual(["Deserto"]);
  });

  it("submits blank names so the removed authors and genres are cleared", async () => {
    const { user, container } = renderForm(
      { ...emptyBook, id: 1, title: "Duna", authors: ["Frank Herbert"], genres: ["Deserto"] },
      "patch",
    );

    for (const remove of container.querySelectorAll("[data-slot=combobox-chip-remove]")) {
      await user.click(remove);
    }
    await user.click(submitButton());

    expect(router.patch).toHaveBeenCalledWith(
      "/books",
      { book: expect.objectContaining({ author_names: [""], genre_names: [""] }) },
      expect.any(Object),
    );
  });

  describe("cover", () => {
    const image = new File(["png"], "capa.png", { type: "image/png" });
    const withCover = { ...emptyBook, id: 1, title: "Duna", cover_url: "/capa-atual.png" };

    beforeEach(() => {
      URL.createObjectURL = vi.fn(() => "blob:capa");
      URL.revokeObjectURL = vi.fn();
    });

    const coverImage = (container: HTMLElement) => container.querySelector("img");

    it("uploads the chosen image instead of the Open Library cover", async () => {
      const { user, container } = renderForm();

      await chooseBookAndWaitDescription(user, dune);
      await user.upload(screen.getByLabelText("Capa"), image);

      expect(coverImage(container)).toHaveAttribute("src", "blob:capa");

      await user.click(submitButton());

      const { book } = vi.mocked(router.post).mock.lastCall![1] as { book: Record<string, unknown> };
      expect(book.cover).toBe(image);
      expect(book).not.toHaveProperty("open_library_cover_id");
    });

    it("replaces the uploaded image when another book is chosen", async () => {
      const { user, container } = renderForm();

      await user.upload(screen.getByLabelText("Capa"), image);
      await chooseBookAndWaitDescription(user, dune);

      expect(coverImage(container)).toHaveAttribute("src", dune.cover_url);
      expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:capa");

      await user.click(submitButton());

      expect(router.post).toHaveBeenCalledWith(
        "/books",
        { book: expect.objectContaining({ open_library_cover_id: 123 }) },
        expect.any(Object),
      );
    });

    it("removes the current cover when the chosen book has none", async () => {
      vi.mocked(searchOpenLibrary).mockResolvedValue([{ ...dune, cover_id: null, cover_url: null }]);
      const { user, container } = renderForm(withCover, "patch");

      await chooseBookAndWaitDescription(user, dune);

      expect(coverImage(container)).toBeNull();

      await user.click(submitButton());

      const { book } = vi.mocked(router.patch).mock.lastCall![1] as { book: Record<string, unknown> };
      expect(book.cover).toBeNull();
      expect(book).not.toHaveProperty("open_library_cover_id");
    });

    it("removes the current cover", async () => {
      const { user, container } = renderForm(withCover, "patch");

      expect(coverImage(container)).toHaveAttribute("src", "/capa-atual.png");

      await user.click(screen.getByRole("button", { name: "Remover capa" }));

      expect(coverImage(container)).toBeNull();
      expect(screen.queryByRole("button", { name: "Remover capa" })).not.toBeInTheDocument();

      await user.click(submitButton());

      expect(router.patch).toHaveBeenCalledWith(
        "/books",
        { book: expect.objectContaining({ cover: null }) },
        expect.any(Object),
      );
    });

    it("offers to upload an image when there is no cover", () => {
      renderForm();

      expect(screen.getByRole("button", { name: "Enviar imagem" })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Remover capa" })).not.toBeInTheDocument();
    });

    it("shows the cover errors returned by the server", async () => {
      const { user } = renderForm(withCover, "patch");

      await user.click(submitButton());
      act(() => lastVisitOptions("patch").onError!({ cover: ["deve ser uma imagem"] } as never));

      expect(screen.getByText("deve ser uma imagem")).toBeInTheDocument();
      expect(screen.getByLabelText("Capa")).toHaveAttribute("aria-invalid", "true");
    });
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
    act(() =>
      lastVisitOptions("post").onError!({
        title: ["já foi cadastrado"],
        published_year: ["não é um número"],
      } as never),
    );

    expect(screen.getByText("já foi cadastrado")).toBeInTheDocument();
    expect(title).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("não é um número")).toBeInTheDocument();
    expect(screen.getByLabelText("Ano de publicação")).toHaveAttribute("aria-invalid", "true");
  });
});
