import { router } from "@inertiajs/react";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import New from "@/pages/passwords/new";

const lastVisit = () => vi.mocked(router.post).mock.lastCall!;

const requestReset = async () => {
  const user = userEvent.setup();
  render(<New />);
  await user.type(screen.getByLabelText("E-mail"), "felipe@example.com");
  await user.click(screen.getByRole("button", { name: "Enviar instruções" }));
};

beforeEach(() => {
  vi.spyOn(router, "post").mockImplementation(() => {});
});

afterEach(() => vi.restoreAllMocks());

describe("Passwords new", () => {
  it("renders the password recovery form", () => {
    render(<New />);

    expect(screen.getByRole("heading", { level: 1, name: "Esqueceu a senha?" })).toBeInTheDocument();
    expect(screen.getByLabelText("E-mail")).toHaveAttribute("type", "email");
    expect(screen.getByRole("link", { name: "Voltar para o login" })).toHaveAttribute("href", "/session/new");
  });

  it("submits the email to the passwords endpoint", async () => {
    await requestReset();

    expect(lastVisit()[0]).toBe("/passwords");
    expect(lastVisit()[1]).toEqual({ email_address: "felipe@example.com" });
  });

  it("disables the submit while sending", async () => {
    await requestReset();

    act(() => lastVisit()[2]!.onStart!({} as never));
    expect(screen.getByRole("button", { name: "Enviar instruções" })).toBeDisabled();

    act(() => lastVisit()[2]!.onFinish!({} as never));
    expect(screen.getByRole("button", { name: "Enviar instruções" })).toBeEnabled();
  });
});
