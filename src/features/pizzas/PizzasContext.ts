import { createContext, useContext } from "react";
import type { Pizza, PizzaDraft } from "./pizza";

export interface PizzasContextValue {
  pizzas: readonly Pizza[];
  persistenceError: boolean;
  addPizza: (draft: PizzaDraft) => void;
  updatePizza: (pizza: Pizza) => void;
  deletePizza: (id: string) => void;
  restorePizza: (pizza: Pizza, index: number) => void;
  reorderPizza: (sourceId: string, targetId: string) => void;
  movePizza: (id: string, direction: -1 | 1) => void;
}

export const PizzasContext = createContext<PizzasContextValue | null>(null);

export function usePizzas(): PizzasContextValue {
  const context = useContext(PizzasContext);

  if (!context) {
    throw new Error("usePizzas must be used inside PizzasProvider.");
  }

  return context;
}
