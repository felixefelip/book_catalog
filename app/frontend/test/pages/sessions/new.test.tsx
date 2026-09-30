import { router } from "@inertiajs/react";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import New from "@/pages/sessions/new";

const lastVisit = () => vi.mocked(router.post).mock.lastCall!;

const signIn = async () => {
  const user = userEvent.setup();
  render(<New />);
  await user.type(screen.getByLabelText("E-mail"), "felipe@example.com");
  await user.type(screen.getByLabelText("Senha"), "secret123");
  await user.click(screen.getByRole("button", { name: "Entrar" }));
};

beforeEach(() => {
  vi.spyOn(router, "post").mockImplementation(() => {});
});

afterEach(() => vi.restoreAllMocks());

describe("Sessions new", () => {
  it("renders the sign in form", () => {
    render(<New />);

    expect(screen.getByRole("heading", { level: 1, name: "Entrar" })).toBeInTheDocument();
    expect(screen.getByLabelText("E-mail")).toHaveAttribute("autocomplete", "username");
    expect(screen.getByLabelText("Senha")).toHaveAttribute("autocomplete", "current-password");
    expect(screen.getByLabelText("Senha")).toHaveAttribute("maxlength", "72");
  });

  it("links to the password recovery and sign up pages", () => {
    render(<New />);

    expect(screen.getByRole("link", { name: "Esqueceu a senha?" })).toHaveAttribute("href", "/passwords/new");
    expect(screen.getByRole("link", { name: "Criar conta" })).toHaveAttribute("href", "/registration/new");
  });

  it("submits the credentials to the session endpoint", async () => {
    await signIn();

    expect(lastVisit()[0]).toBe("/session");
    expect(lastVisit()[1]).toEqual({ email_address: "felipe@example.com", password: "secret123" });
  });

  it("disables the submit while signing in", async () => {
    await signIn();

    act(() => lastVisit()[2]!.onStart!({} as never));
    expect(screen.getByRole("button", { name: "Entrar" })).toBeDisabled();

    act(() => lastVisit()[2]!.onFinish!({} as never));
    expect(screen.getByRole("button", { name: "Entrar" })).toBeEnabled();
  });
});
