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

    expect(addPizza).toHaveBeenCalledWith({ title: "Turku Special", price: 14.5, img: "pizza-1.jpg" });
  });

  it("shows an error and does not submit an invalid price", async () => {
    const user = userEvent.setup();
    const addPizza = vi.fn();
    render(<AddPizzaForm addPizza={addPizza} />);

    await user.type(screen.getByLabelText("Pizza name"), "Invalid Pizza");
    await user.type(screen.getByLabelText("Price (€)"), "0");
    await user.click(screen.getByRole("button", { name: /add pizza/i }));

    expect(addPizza).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent("Price must be greater than 0");
  });
});
