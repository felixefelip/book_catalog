import { router, usePage } from "@inertiajs/react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import AppLayout from "@/layouts/app_layout";
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

const renderLayout = ({ url = "/", current_user = null as CurrentUser | null } = {}) => {
  vi.mocked(usePage).mockReturnValue({ url, props: { current_user, locale: "pt-BR" } } as never);

  return render(
    <AppLayout>
      <p>Conteúdo da página</p>
    </AppLayout>,
  );
};

beforeEach(() => {
  vi.stubGlobal("matchMedia", () => ({
    matches: false,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
  vi.spyOn(router, "delete").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("AppLayout", () => {
  it("renders the page content", () => {
    renderLayout();

    expect(screen.getByRole("main")).toHaveTextContent("Conteúdo da página");
  });

  it("shows the sign in and sign up links to guests", () => {
    renderLayout();

    expect(screen.getByRole("link", { name: "Entrar" })).toHaveAttribute("href", "/session/new");
    expect(screen.getByRole("link", { name: "Criar conta" })).toHaveAttribute("href", "/registration/new");
    expect(screen.queryByRole("button", { name: /Felipe Felix/ })).not.toBeInTheDocument();
  });

  it.each(["/", "/books", "/books?page=2"])("marks home as active on %s", (url) => {
    renderLayout({ url });

    expect(screen.getByRole("link", { name: "Início" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Entrar" })).not.toHaveAttribute("aria-current");
  });

  it("marks the current account page as active", () => {
    renderLayout({ url: "/session/new" });

    expect(screen.getByRole("link", { name: "Entrar" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Início" })).not.toHaveAttribute("aria-current");
  });

  it("shows the user menu to signed in users", async () => {
    renderLayout({ current_user: user });

    expect(screen.queryByRole("link", { name: "Entrar" })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Felipe Felix" }));

    expect(await screen.findByText("felipe@example.com")).toBeInTheDocument();
  });

  it("signs the user out", async () => {
    renderLayout({ current_user: user });

    await userEvent.click(screen.getByRole("button", { name: "Felipe Felix" }));
    await userEvent.click(await screen.findByRole("menuitem", { name: "Sair" }));

    expect(router.delete).toHaveBeenCalledWith("/session");
  });
});
