import { beforeEach, describe, expect, it } from "vitest";
import demoPizzas from "../demoPizzas";
import { pizzaRepository } from "./pizzaRepository";

describe("pizzaRepository", () => {
  beforeEach(() => window.localStorage.clear());

  it("returns demo pizzas when storage is empty", () => {
    expect(pizzaRepository.load()).toEqual(demoPizzas);
  });

  it("saves current data in a versioned envelope", () => {
    const pizzas = [
      { id: 9, title: "Test Pizza", price: 12.5, img: "pizza-1.jpg" as const },
    ];

    expect(pizzaRepository.save(pizzas)).toBe(true);
    expect(JSON.parse(window.localStorage.getItem("pizzasState") ?? "")).toEqual({
      version: 1,
      pizzas,
    });
    expect(pizzaRepository.load()).toEqual(pizzas);
  });

  it("migrates old string prices instead of resetting the menu", () => {
    window.localStorage.setItem(
      "pizzasState",
      JSON.stringify([
        { id: 7, title: "Legacy Pizza", price: "14.50", img: "pizza-2.jpg" },
      ])
    );

    expect(pizzaRepository.load()).toEqual([
      { id: 7, title: "Legacy Pizza", price: 14.5, img: "pizza-2.jpg" },
    ]);

    expect(JSON.parse(window.localStorage.getItem("pizzasState") ?? "")).toEqual({
      version: 1,
      pizzas: [
        { id: 7, title: "Legacy Pizza", price: 14.5, img: "pizza-2.jpg" },
      ],
    });
  });

  it("preserves valid legacy items while dropping unrecoverable items", () => {
    window.localStorage.setItem(
      "pizzasState",
      JSON.stringify([
        { id: 7, title: "Good Pizza", price: "10", img: "pizza-1.jpg" },
        { id: 8, title: "Broken Pizza", price: null, img: "pizza-2.jpg" },
      ])
    );

    expect(pizzaRepository.load()).toEqual([
      { id: 7, title: "Good Pizza", price: 10, img: "pizza-1.jpg" },
    ]);
  });

  it("deduplicates legacy ids so React keys and mutations stay stable", () => {
    window.localStorage.setItem(
      "pizzasState",
      JSON.stringify([
        { id: 3, title: "Keep Me", price: 10, img: "pizza-1.jpg" },
        { id: 3, title: "Drop Me", price: 11, img: "pizza-2.jpg" },
      ])
    );

    expect(pizzaRepository.load()).toEqual([
      { id: 3, title: "Keep Me", price: 10, img: "pizza-1.jpg" },
    ]);
  });

  it("falls back safely and removes storage when JSON is corrupted", () => {
    window.localStorage.setItem("pizzasState", "{broken");

    expect(pizzaRepository.load()).toEqual(demoPizzas);
    expect(window.localStorage.getItem("pizzasState")).toBeNull();
  });

  it("falls back when every stored item is invalid", () => {
    window.localStorage.setItem(
      "pizzasState",
      JSON.stringify([
        { id: 1, title: "Broken", price: null, img: "pizza-1.jpg" },
      ])
    );

    expect(pizzaRepository.load()).toEqual(demoPizzas);
    expect(window.localStorage.getItem("pizzasState")).toBeNull();
  });
});
