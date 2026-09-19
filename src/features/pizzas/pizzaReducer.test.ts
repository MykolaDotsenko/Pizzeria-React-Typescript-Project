import { describe, expect, it } from "vitest";
import type { Pizza } from "./pizza";
import { pizzaReducer } from "./pizzaReducer";

const first: Pizza = {
  id: "1",
  name: "Pepperoni",
  priceCents: 800,
  image: "pizza-1.jpg",
};

describe("pizzaReducer", () => {
  it("adds without mutating the previous state", () => {
    const state = [first];
    const second: Pizza = {
      id: "2",
      name: "Margherita",
      priceCents: 900,
      image: "pizza-2.jpg",
    };

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

  it("deletes by id", () => {
    expect(pizzaReducer([first], { type: "pizza/deleted", id: first.id })).toEqual([]);
  });
});
