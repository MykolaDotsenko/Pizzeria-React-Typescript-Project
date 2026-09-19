import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { describe, expect, it } from "vitest";
import { PizzasContext, type PizzasContextValue } from "./PizzasContext";
import { PizzaDetailsPage } from "./PizzaDetailsPage";
import { seedPizzas } from "./seedPizzas";

const contextValue: PizzasContextValue = {
  pizzas: seedPizzas,
  persistenceError: false,
  addPizza: () => undefined,
  updatePizza: () => undefined,
  deletePizza: () => undefined,
  restorePizza: () => undefined,
  reorderPizza: () => undefined,
  movePizza: () => undefined,
};

function renderRoute(path: string) {
  return render(
    <PizzasContext value={contextValue}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/pizza/:id" element={<PizzaDetailsPage />} />
        </Routes>
      </MemoryRouter>
    </PizzasContext>,
  );
}

describe("PizzaDetailsPage", () => {
  it("renders customer-facing pizza details", () => {
    renderRoute("/pizza/1");

    expect(screen.getByRole("heading", { name: "Pepperoni" })).toBeInTheDocument();
    expect(
      screen.getByText("Tomato, mozzarella, pepperoni, and a crisp oregano finish."),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Classic").length).toBeGreaterThan(0);
  });

  it("renders a safe not-found state for an invalid id", () => {
    renderRoute("/pizza/%2F");

    expect(
      screen.getByRole("heading", {
        name: "This pizza is no longer on the menu.",
      }),
    ).toBeInTheDocument();
  });
});
