import { beforeEach, describe, expect, it } from "vitest";
import demoPizzas from "../demoPizzas";
import { pizzaRepository } from "./pizzaRepository";

describe("pizzaRepository", () => {
  beforeEach(() => window.localStorage.clear());

  it("returns demo pizzas when storage is empty", () => {
    expect(pizzaRepository.load()).toEqual(demoPizzas);
  });

  it("saves and loads valid pizzas", () => {
    const pizzas = [{ id: 9, title: "Test Pizza", price: 12.5, img: "pizza-1.jpg" as const }];
    expect(pizzaRepository.save(pizzas)).toBe(true);
    expect(pizzaRepository.load()).toEqual(pizzas);
  });

  it("falls back safely when JSON is corrupted", () => {
    window.localStorage.setItem("pizzasState", "{broken");
    expect(pizzaRepository.load()).toEqual(demoPizzas);
  });

  it("rejects invalid stored data", () => {
    window.localStorage.setItem("pizzasState", JSON.stringify([{ id: 1, title: "Broken", price: null, img: "pizza-1.jpg" }]));
    expect(pizzaRepository.load()).toEqual(demoPizzas);
    expect(window.localStorage.getItem("pizzasState")).toBeNull();
  });
});
