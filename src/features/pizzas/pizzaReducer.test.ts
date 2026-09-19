import { describe, expect, it } from "vitest";
import { createPresetPizzaImage, type Pizza } from "./pizza";
import { pizzaReducer } from "./pizzaReducer";

const first: Pizza = {
  id: "1",
  name: "Pepperoni",
  description: "Tomato, mozzarella, pepperoni, and oregano.",
  category: "classic",
  priceCents: 800,
  image: createPresetPizzaImage("pizza-1.jpg"),
};

const second: Pizza = {
  id: "2",
  name: "Margherita",
  description: "Tomato, mozzarella, basil, and olive oil.",
  category: "vegetarian",
  priceCents: 900,
  image: createPresetPizzaImage("pizza-2.jpg"),
};

const third: Pizza = {
  id: "3",
  name: "Special",
  description: "A seasonal house special with fresh toppings.",
  category: "special",
  priceCents: 1300,
  image: createPresetPizzaImage("pizza-3.jpg"),
};

describe("pizzaReducer", () => {
  it("adds without mutating the previous state", () => {
    const state = [first];

    const next = pizzaReducer(state, { type: "pizza/added", pizza: second });

    expect(next).toEqual([first, second]);
    expect(state).toEqual([first]);
  });

  it("ignores duplicate ids", () => {
    const state = [first];
    expect(pizzaReducer(state, { type: "pizza/added", pizza: first })).toBe(state);
  });

  it("updates only an existing record", () => {
    const updated = { ...first, priceCents: 999 };
    expect(pizzaReducer([first], { type: "pizza/updated", pizza: updated })).toEqual([
      updated,
    ]);
  });

  it("deletes and restores at the original index", () => {
    const deleted = pizzaReducer([first, second, third], {
      type: "pizza/deleted",
      id: second.id,
    });

    expect(
      pizzaReducer(deleted, {
        type: "pizza/restored",
        pizza: second,
        index: 1,
      }),
    ).toEqual([first, second, third]);
  });

  it("reorders one pizza to the target position", () => {
    expect(
      pizzaReducer([first, second, third], {
        type: "pizza/reordered",
        sourceId: third.id,
        targetId: first.id,
      }),
    ).toEqual([third, first, second]);
  });

  it("supports accessible one-step movement", () => {
    expect(
      pizzaReducer([first, second, third], {
        type: "pizza/moved",
        id: second.id,
        direction: 1,
      }),
    ).toEqual([first, third, second]);
  });
});
