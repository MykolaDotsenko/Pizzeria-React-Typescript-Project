import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { usePizzas } from "./PizzasContext";
import { PizzasProvider } from "./PizzasProvider";
import type { PizzaRepository } from "./pizzaRepository";

function DoubleMutationHarness() {
  const { pizzas, addPizza } = usePizzas();

  return (
    <>
      <output aria-label="Pizza count">{pizzas.length}</output>
      <button
        type="button"
        onClick={() => {
          addPizza({ name: "First", priceCents: 1000, image: "pizza-1.jpg" });
          addPizza({ name: "Second", priceCents: 1200, image: "pizza-2.jpg" });
        }}
      >
        Add twice
      </button>
    </>
  );
}

describe("PizzasProvider", () => {
  it("composes synchronous mutations before persisting", async () => {
    const user = userEvent.setup();
    const save = vi.fn(() => true);
    const repository: PizzaRepository = {
      load: () => [],
      save,
      isWritable: () => true,
    };

    render(
      <PizzasProvider repository={repository}>
        <DoubleMutationHarness />
      </PizzasProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Add twice" }));

    expect(screen.getByLabelText("Pizza count")).toHaveTextContent("2");
    expect(save).toHaveBeenCalledTimes(2);
    expect(save.mock.calls.at(-1)?.[0]).toHaveLength(2);
  });
});
