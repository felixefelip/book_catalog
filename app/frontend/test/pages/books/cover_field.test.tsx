import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import CoverField from "@/pages/books/cover_field";

const image = new File(["png"], "capa.png", { type: "image/png" });

const renderField = (props: Partial<React.ComponentProps<typeof CoverField>> = {}) => {
  const onSelect = vi.fn();
  const onRemove = vi.fn();
  const utils = render(
    <CoverField file={null} url={null} onSelect={onSelect} onRemove={onRemove} {...props} />,
  );

  return { ...utils, onSelect, onRemove, user: userEvent.setup() };
};

beforeEach(() => {
  URL.createObjectURL = vi.fn(() => "blob:capa");
  URL.revokeObjectURL = vi.fn();
});

describe("CoverField", () => {
  it("shows a placeholder and only the upload button when there is no cover", () => {
    const { container } = renderField();

    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByRole("button", { name: "Enviar imagem" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Remover capa" })).not.toBeInTheDocument();
    expect(screen.getByText("JPEG, PNG ou WebP de até 5 MB.")).toBeInTheDocument();
  });

  it("shows the given cover with the change and remove buttons", () => {
    const { container } = renderField({ url: "/capa.png" });

    expect(container.querySelector("img")).toHaveAttribute("src", "/capa.png");
    expect(screen.getByRole("button", { name: "Trocar imagem" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Remover capa" })).toBeInTheDocument();
  });

  it("previews the chosen file over the given cover and revokes its url when it changes", () => {
    const { container, rerender, onSelect, onRemove } = renderField({ url: "/capa.png", file: image });

    expect(container.querySelector("img")).toHaveAttribute("src", "blob:capa");

    rerender(<CoverField file={null} url="/capa.png" onSelect={onSelect} onRemove={onRemove} />);

    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:capa");
    expect(container.querySelector("img")).toHaveAttribute("src", "/capa.png");
  });

  it("reports the chosen file and the removal", async () => {
    const { user, onSelect, onRemove } = renderField({ url: "/capa.png" });

    await user.upload(screen.getByLabelText("Capa"), image);
    await user.click(screen.getByRole("button", { name: "Remover capa" }));

    expect(onSelect).toHaveBeenCalledWith(image);
    expect(onRemove).toHaveBeenCalled();
  });

  it("opens the file picker from the upload button", async () => {
    const { user } = renderField();
    const click = vi.spyOn(screen.getByLabelText("Capa"), "click");

    await user.click(screen.getByRole("button", { name: "Enviar imagem" }));

    expect(click).toHaveBeenCalled();
  });

  it("shows the errors", () => {
    renderField({ errors: ["deve ser uma imagem"] });

    expect(screen.getByText("deve ser uma imagem")).toBeInTheDocument();
    expect(screen.getByLabelText("Capa")).toHaveAttribute("aria-invalid", "true");
  });
});
