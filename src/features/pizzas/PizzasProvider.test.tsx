import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { createPresetPizzaImage, type Pizza, type PizzaDraft } from "./pizza";
import { usePizzas } from "./PizzasContext";
import { PizzasProvider } from "./PizzasProvider";
import type { PizzaRepository } from "./pizzaRepository";

const createDraft = (name: string, priceCents: number): PizzaDraft => ({
  name,
  description: `${name} with a complete menu description.`,
  category: "classic",
  priceCents,
  image: createPresetPizzaImage("pizza-1.jpg"),
});

function DoubleMutationHarness() {
  const { pizzas, addPizza } = usePizzas();

  return (
    <>
      <output aria-label="Pizza count">{pizzas.length}</output>
      <button
        type="button"
        onClick={() => {
          addPizza(createDraft("First", 1000));
          addPizza(createDraft("Second", 1200));
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
    const save = vi.fn<(pizzas: readonly Pizza[]) => boolean>(() => true);
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
