import { router } from "@inertiajs/react";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import New from "@/pages/registrations/new";

const lastVisit = () => vi.mocked(router.post).mock.lastCall!;

const signUp = async () => {
  const user = userEvent.setup();
  render(<New />);
  await user.type(screen.getByLabelText("Nome"), "Felipe");
  await user.type(screen.getByLabelText("Sobrenome"), "Felix");
  await user.type(screen.getByLabelText("E-mail"), "felipe@example.com");
  await user.type(screen.getByLabelText("Senha"), "secret123");
  await user.type(screen.getByLabelText("Confirmação da senha"), "secret123");
  await user.click(screen.getByRole("button", { name: "Criar conta" }));
};

beforeEach(() => {
  vi.spyOn(router, "post").mockImplementation(() => {});
});

afterEach(() => vi.restoreAllMocks());

describe("Registrations new", () => {
  it("renders the sign up form", () => {
    render(<New />);

    expect(screen.getByRole("heading", { level: 1, name: "Criar conta" })).toBeInTheDocument();
    expect(screen.getByLabelText("Nome")).toHaveAttribute("autocomplete", "given-name");
    expect(screen.getByLabelText("Sobrenome")).toHaveAttribute("autocomplete", "family-name");
    expect(screen.getByLabelText("Senha")).toHaveAttribute("minlength", "8");
    expect(screen.getByRole("link", { name: "Já tem conta? Entrar" })).toHaveAttribute("href", "/session/new");
  });

  it("submits the user data to the registration endpoint", async () => {
    await signUp();

    expect(lastVisit()[0]).toBe("/registration");
    expect(lastVisit()[1]).toEqual({
      name: "Felipe",
      last_name: "Felix",
      email_address: "felipe@example.com",
      password: "secret123",
      password_confirmation: "secret123",
    });
  });

  it("shows the validation errors and clears only the passwords", async () => {
    await signUp();

    act(() =>
      lastVisit()[2]!.onError!({
        name: ["não pode ficar em branco"],
        last_name: ["é muito longo"],
        email_address: ["já está em uso"],
        password: ["é muito curta"],
        password_confirmation: ["não é igual a Senha"],
      } as never),
    );

    expect(screen.getByText("não pode ficar em branco")).toBeInTheDocument();
    expect(screen.getByText("é muito longo")).toBeInTheDocument();
    expect(screen.getByText("já está em uso")).toBeInTheDocument();
    expect(screen.getByText("é muito curta")).toBeInTheDocument();
    expect(screen.getByText("não é igual a Senha")).toBeInTheDocument();
    expect(screen.getByLabelText("E-mail")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText("E-mail")).toHaveValue("felipe@example.com");
    expect(screen.getByLabelText("Senha")).toHaveValue("");
    expect(screen.getByLabelText("Confirmação da senha")).toHaveValue("");
  });

  it("disables the submit while signing up", async () => {
    await signUp();

    act(() => lastVisit()[2]!.onStart!({} as never));
    expect(screen.getByRole("button", { name: "Criar conta" })).toBeDisabled();

    act(() => lastVisit()[2]!.onFinish!({} as never));
    expect(screen.getByRole("button", { name: "Criar conta" })).toBeEnabled();
  });
});
