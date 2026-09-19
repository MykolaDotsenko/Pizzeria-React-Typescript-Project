import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { usePizzas } from "./usePizzas";

describe("usePizzas", () => {
  beforeEach(() => window.localStorage.clear());

  it("adds, updates, deletes, and persists pizzas", () => {
    const { result } = renderHook(() => usePizzas());

    act(() => result.current.addPizza({ title: "New Pizza", price: 13.5, img: "pizza-2.jpg" }));
    const added = result.current.pizzas[result.current.pizzas.length - 1];
    expect(added?.title).toBe("New Pizza");

    act(() => {
      if (!added) throw new Error("Expected pizza to be added.");
      result.current.updatePizza({ ...added, price: 15 });
    });
    expect(result.current.pizzas[result.current.pizzas.length - 1]?.price).toBe(15);

    act(() => {
      if (!added) throw new Error("Expected pizza to be added.");
      result.current.deletePizza(added.id);
    });

    expect(result.current.pizzas.some((pizza) => pizza.id === added?.id)).toBe(false);
    expect(window.localStorage.getItem("pizzasState")).not.toBeNull();
  });
});
