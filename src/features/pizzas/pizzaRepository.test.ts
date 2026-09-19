import { beforeEach, describe, expect, it } from "vitest";
import { createLocalStoragePizzaRepository } from "./pizzaRepository";
import { seedPizzas } from "./seedPizzas";

describe("pizzaRepository", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("uses seed data when storage is empty", () => {
    expect(createLocalStoragePizzaRepository(window.localStorage).load()).toEqual(
      seedPizzas,
    );
  });

  it("persists the current versioned model", () => {
    const repository = createLocalStoragePizzaRepository(window.localStorage);
    const pizzas = [
      {
        id: "new-id",
        name: "Test Pizza",
        priceCents: 1250,
        image: "pizza-1.jpg" as const,
      },
    ];

    expect(repository.save(pizzas)).toBe(true);
    expect(JSON.parse(window.localStorage.getItem("pizzasState") ?? "")).toEqual({
      version: 2,
      pizzas,
    });
    expect(repository.load()).toEqual(pizzas);
  });

  it("migrates version 1 money and ids to the current domain model", () => {
    window.localStorage.setItem(
      "pizzasState",
      JSON.stringify({
        version: 1,
        pizzas: [{ id: 7, title: "Legacy Pizza", price: "14.50", img: "pizza-2.jpg" }],
      }),
    );

    expect(createLocalStoragePizzaRepository(window.localStorage).load()).toEqual([
      {
        id: "7",
        name: "Legacy Pizza",
        priceCents: 1450,
        image: "pizza-2.jpg",
      },
    ]);
  });

  it("preserves valid legacy rows while dropping corrupt rows", () => {
    window.localStorage.setItem(
      "pizzasState",
      JSON.stringify([
        { id: 7, title: "Good Pizza", price: "10", img: "pizza-1.jpg" },
        { id: 8, title: "Broken Pizza", price: null, img: "pizza-2.jpg" },
      ]),
    );

    expect(createLocalStoragePizzaRepository(window.localStorage).load()).toEqual([
      {
        id: "7",
        name: "Good Pizza",
        priceCents: 1000,
        image: "pizza-1.jpg",
      },
    ]);
  });

  it("recovers from corrupted JSON", () => {
    window.localStorage.setItem("pizzasState", "{broken");
    const repository = createLocalStoragePizzaRepository(window.localStorage);

    expect(repository.load()).toEqual(seedPizzas);
    expect(window.localStorage.getItem("pizzasState")).toBeNull();
  });

  it("reports unavailable storage without throwing", () => {
    const repository = createLocalStoragePizzaRepository(null);

    expect(repository.load()).toEqual(seedPizzas);
    expect(repository.isWritable()).toBe(false);
    expect(repository.save(seedPizzas)).toBe(false);
  });

  it("preserves unknown-version data and blocks downgrade writes", () => {
    const futureData = JSON.stringify({
      version: 99,
      pizzas: [
        { id: "future", name: "Future Pizza", priceCents: 900, image: "pizza-1.jpg" },
      ],
      futureField: "must-survive",
    });
    window.localStorage.setItem("pizzasState", futureData);

    const repository = createLocalStoragePizzaRepository(window.localStorage);

    expect(repository.load()).toEqual(seedPizzas);
    expect(repository.isWritable()).toBe(false);
    expect(repository.save(seedPizzas)).toBe(false);
    expect(window.localStorage.getItem("pizzasState")).toBe(futureData);
  });
});
