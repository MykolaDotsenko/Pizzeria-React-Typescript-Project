import { describe, expect, it } from "vitest";
import { pizzaFormSchema, pizzaListSchema } from "./pizza";

describe("pizza domain", () => {
  it("converts user-facing euro input to integer cents", () => {
    expect(
      pizzaFormSchema.parse({
        name: "Nordic Heat",
        price: "14.90",
        image: "pizza-1.jpg",
      }),
    ).toEqual({
      name: "Nordic Heat",
      priceCents: 1490,
      image: "pizza-1.jpg",
    });
  });

  it("accepts a comma decimal separator", () => {
    expect(
      pizzaFormSchema.parse({
        name: "Nordic Heat",
        price: "14,90",
        image: "pizza-1.jpg",
      }).priceCents,
    ).toBe(1490);
  });

  it("rejects sub-cent precision", () => {
    expect(
      pizzaFormSchema.safeParse({
        name: "Tiny Price",
        price: "0.001",
        image: "pizza-1.jpg",
      }).success,
    ).toBe(false);
  });

  it("rejects duplicate ids", () => {
    expect(
      pizzaListSchema.safeParse([
        { id: "a", name: "First", priceCents: 1000, image: "pizza-1.jpg" },
        { id: "a", name: "Second", priceCents: 1100, image: "pizza-2.jpg" },
      ]).success,
    ).toBe(false);
  });
});
