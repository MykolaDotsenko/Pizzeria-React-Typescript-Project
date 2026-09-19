import { describe, expect, it } from "vitest";
import {
  pizzaInputSchema,
  pizzaListSchema,
  type Pizza,
} from "./Pizza";

describe("pizza schemas", () => {
  it("accepts normal currency values", () => {
    expect(
      pizzaInputSchema.safeParse({
        title: "Turku Special",
        price: 12.34,
        img: "pizza-1.jpg",
      }).success
    ).toBe(true);
  });

  it("rejects prices below one cent", () => {
    expect(
      pizzaInputSchema.safeParse({
        title: "Tiny Price",
        price: 0.001,
        img: "pizza-1.jpg",
      }).success
    ).toBe(false);
  });

  it("rejects more than two decimal places", () => {
    expect(
      pizzaInputSchema.safeParse({
        title: "Too Precise",
        price: 12.345,
        img: "pizza-1.jpg",
      }).success
    ).toBe(false);
  });

  it("rejects duplicate pizza ids", () => {
    const pizzas: Pizza[] = [
      { id: 1, title: "First", price: 10, img: "pizza-1.jpg" },
      { id: 1, title: "Second", price: 11, img: "pizza-2.jpg" },
    ];

    expect(pizzaListSchema.safeParse(pizzas).success).toBe(false);
  });
});
