import { describe, expect, it } from "vitest";
import { createPresetPizzaImage, pizzaFormSchema, pizzaListSchema } from "./pizza";

const baseForm = {
  name: "Nordic Heat",
  description: "Smoky pepperoni, mozzarella, chili, and roasted tomato.",
  category: "spicy" as const,
  image: createPresetPizzaImage("pizza-1.jpg"),
};

describe("pizza domain", () => {
  it("converts user-facing euro input to integer cents", () => {
    expect(
      pizzaFormSchema.parse({
        ...baseForm,
        price: "14.90",
      }),
    ).toEqual({
      ...baseForm,
      priceCents: 1490,
    });
  });

  it("accepts a comma decimal separator", () => {
    expect(
      pizzaFormSchema.parse({
        ...baseForm,
        price: "14,90",
      }).priceCents,
    ).toBe(1490);
  });

  it("rejects sub-cent precision", () => {
    expect(
      pizzaFormSchema.safeParse({
        ...baseForm,
        price: "0.001",
      }).success,
    ).toBe(false);
  });

  it("rejects descriptions that are too short", () => {
    expect(
      pizzaFormSchema.safeParse({
        ...baseForm,
        description: "Too short",
        price: "12.00",
      }).success,
    ).toBe(false);
  });

  it("rejects duplicate ids", () => {
    const image = createPresetPizzaImage("pizza-1.jpg");

    expect(
      pizzaListSchema.safeParse([
        {
          id: "a",
          name: "First",
          description: "A complete pizza description.",
          category: "classic",
          priceCents: 1000,
          image,
        },
        {
          id: "a",
          name: "Second",
          description: "Another complete pizza description.",
          category: "special",
          priceCents: 1100,
          image,
        },
      ]).success,
    ).toBe(false);
  });
});
