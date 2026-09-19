import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import AddPizzaForm from "./AddPizzaForm";

describe("AddPizzaForm", () => {
  it("submits a validated numeric price", async () => {
    const user = userEvent.setup();
    const addPizza = vi.fn();

    render(<AddPizzaForm addPizza={addPizza} />);

    await user.type(screen.getByLabelText("Pizza name"), "Turku Special");
    await user.type(screen.getByLabelText("Price (€)"), "14.50");
    await user.click(screen.getByRole("button", { name: /add pizza/i }));

    expect(addPizza).toHaveBeenCalledWith({
      title: "Turku Special",
      price: 14.5,
      img: "pizza-1.jpg",
    });
  });

  it("shows a field error and does not submit a zero price", async () => {
    const user = userEvent.setup();
    const addPizza = vi.fn();

    render(<AddPizzaForm addPizza={addPizza} />);

    await user.type(screen.getByLabelText("Pizza name"), "Invalid Pizza");
    await user.type(screen.getByLabelText("Price (€)"), "0");
    await user.click(screen.getByRole("button", { name: /add pizza/i }));

    expect(addPizza).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Price must be at least 0.01"
    );
    expect(screen.getByLabelText("Price (€)")).toHaveAttribute(
      "aria-invalid",
      "true"
    );
  });

  it("rejects sub-cent prices that would be displayed incorrectly", async () => {
    const user = userEvent.setup();
    const addPizza = vi.fn();

    render(<AddPizzaForm addPizza={addPizza} />);

    await user.type(screen.getByLabelText("Pizza name"), "Tiny Pizza");
    await user.type(screen.getByLabelText("Price (€)"), "0.001");
    await user.click(screen.getByRole("button", { name: /add pizza/i }));

    expect(addPizza).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Price must be at least 0.01"
    );
  });
});
