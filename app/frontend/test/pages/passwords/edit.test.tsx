import { router } from "@inertiajs/react";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import Edit from "@/pages/passwords/edit";

const lastVisit = () => vi.mocked(router.put).mock.lastCall!;

const resetPassword = async () => {
  const user = userEvent.setup();
  render(<Edit token="abc123" />);
  await user.type(screen.getByLabelText("Nova senha"), "newsecret");
  await user.type(screen.getByLabelText("Confirmação da senha"), "newsecret");
  await user.click(screen.getByRole("button", { name: "Salvar" }));
};

beforeEach(() => {
  vi.spyOn(router, "put").mockImplementation(() => {});
});

afterEach(() => vi.restoreAllMocks());

describe("Passwords edit", () => {
  it("renders the new password form", () => {
    render(<Edit token="abc123" />);

    expect(screen.getByRole("heading", { level: 1, name: "Redefinir senha" })).toBeInTheDocument();
    expect(screen.getByLabelText("Nova senha")).toHaveAttribute("minlength", "8");
    expect(screen.getByLabelText("Nova senha")).toHaveAttribute("autocomplete", "new-password");
    expect(screen.getByLabelText("Confirmação da senha")).toHaveAttribute("maxlength", "72");
  });

  it("submits the new password to the token endpoint", async () => {
    await resetPassword();

    expect(lastVisit()[0]).toBe("/passwords/abc123");
    expect(lastVisit()[1]).toEqual({ password: "newsecret", password_confirmation: "newsecret" });
  });

  it("shows the validation errors and clears the fields", async () => {
    await resetPassword();

    act(() =>
      lastVisit()[2]!.onError!({
        password: ["é muito curta"],
        password_confirmation: ["não é igual a Senha"],
      } as never),
    );

    expect(screen.getByText("é muito curta")).toBeInTheDocument();
    expect(screen.getByText("não é igual a Senha")).toBeInTheDocument();
    expect(screen.getByLabelText("Nova senha")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText("Nova senha")).toHaveValue("");
    expect(screen.getByLabelText("Confirmação da senha")).toHaveValue("");
  });

  it("disables the submit while saving", async () => {
    await resetPassword();

    act(() => lastVisit()[2]!.onStart!({} as never));
    expect(screen.getByRole("button", { name: "Salvar" })).toBeDisabled();

    act(() => lastVisit()[2]!.onFinish!({} as never));
    expect(screen.getByRole("button", { name: "Salvar" })).toBeEnabled();
  });
});
