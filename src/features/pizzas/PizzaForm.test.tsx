import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PizzaForm } from "./PizzaForm";

describe("PizzaForm", () => {
  it("submits normalized domain data", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<PizzaForm submitLabel="Add to menu" onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("Pizza name"), "Nordic Heat");
    await user.type(screen.getByLabelText("Price (€)"), "14.90");
    await user.click(screen.getByRole("button", { name: "Add to menu" }));

    expect(onSubmit).toHaveBeenCalledWith({
      name: "Nordic Heat",
      priceCents: 1490,
      image: "pizza-1.jpg",
    });
  });

  it("shows field-level validation without submitting invalid input", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<PizzaForm submitLabel="Add to menu" onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("Pizza name"), "X");
    await user.type(screen.getByLabelText("Price (€)"), "0.001");
    await user.click(screen.getByRole("button", { name: "Add to menu" }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Pizza name")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText("Price (€)")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getAllByRole("alert")).toHaveLength(2);
  });
});
