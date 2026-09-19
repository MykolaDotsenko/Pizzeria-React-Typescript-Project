import { createElement, type ReactNode } from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PizzasProvider } from "../context/PizzasContext";
import { usePizzas } from "./usePizzas";

const wrapper = ({ children }: { children: ReactNode }) =>
  createElement(PizzasProvider, null, children);

describe("usePizzas", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it("adds, updates, deletes, and persists pizzas", async () => {
    const { result } = renderHook(() => usePizzas(), { wrapper });

    act(() =>
      result.current.addPizza({
        title: "New Pizza",
        price: 13.5,
        img: "pizza-2.jpg",
      })
    );

    const added = result.current.pizzas[result.current.pizzas.length - 1];
    expect(added?.title).toBe("New Pizza");

    act(() => {
      if (!added) {
        throw new Error("Expected pizza to be added.");
      }

      result.current.updatePizza({ ...added, price: 15 });
    });

    expect(result.current.pizzas[result.current.pizzas.length - 1]?.price).toBe(
      15
    );

    act(() => {
      if (!added) {
        throw new Error("Expected pizza to be added.");
      }

      result.current.deletePizza(added.id);
    });

    expect(result.current.pizzas.some((pizza) => pizza.id === added?.id)).toBe(
      false
    );

    await waitFor(() => {
      const stored = JSON.parse(
        window.localStorage.getItem("pizzasState") ?? ""
      );
      expect(stored.version).toBe(1);
      expect(stored.pizzas.some((pizza: { id: number }) => pizza.id === added?.id)).toBe(false);
    });
  });

  it("reports persistence failures instead of silently losing changes", async () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Storage unavailable");
    });

    const { result } = renderHook(() => usePizzas(), { wrapper });

    await waitFor(() => {
      expect(result.current.persistenceError).toBe(true);
    });
  });
});
