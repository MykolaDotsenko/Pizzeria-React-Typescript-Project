import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PizzaForm } from "./PizzaForm";

describe("PizzaForm", () => {
  it("submits normalized domain data with product metadata", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<PizzaForm submitLabel="Add to menu" onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("Pizza name"), "Nordic Heat");
    await user.type(
      screen.getByLabelText("Description"),
      "Smoky pepperoni, mozzarella, chili, and roasted tomato.",
    );
    await user.selectOptions(screen.getByLabelText("Category"), "spicy");
    await user.type(screen.getByLabelText("Price (€)"), "14.90");
    await user.click(screen.getByRole("button", { name: "Add to menu" }));

    expect(onSubmit).toHaveBeenCalledWith({
      name: "Nordic Heat",
      description: "Smoky pepperoni, mozzarella, chili, and roasted tomato.",
      category: "spicy",
      priceCents: 1490,
      image: { kind: "preset", value: "pizza-1.jpg" },
    });
  });

  it("shows field-level validation without submitting invalid input", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<PizzaForm submitLabel="Add to menu" onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("Pizza name"), "X");
    await user.type(screen.getByLabelText("Description"), "Short");
    await user.type(screen.getByLabelText("Price (€)"), "0.001");
    await user.click(screen.getByRole("button", { name: "Add to menu" }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Pizza name")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText("Description")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(screen.getByLabelText("Price (€)")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getAllByRole("alert")).toHaveLength(3);
  });

  it("rejects unsupported uploads before image decoding", async () => {
    const user = userEvent.setup({ applyAccept: false });
    render(<PizzaForm submitLabel="Add to menu" onSubmit={vi.fn()} />);

    const file = new File(["gif-data"], "pizza.gif", { type: "image/gif" });
    await user.upload(screen.getByLabelText("Upload own photo"), file);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Use a JPG, PNG, or WebP image.",
    );
  });
});
