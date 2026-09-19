import { useCallback, useState } from "react";
import { pizzaRepository } from "../data/pizzaRepository";
import type { Pizza, PizzaInput } from "../models/Pizza";

type PizzaUpdater = (current: Pizza[]) => Pizza[];

export const usePizzas = () => {
  const [pizzas, setPizzas] = useState<Pizza[]>(() => pizzaRepository.load());

  const commit = useCallback((update: PizzaUpdater) => {
    setPizzas((current) => {
      const next = update(current);
      pizzaRepository.save(next);
      return next;
    });
  }, []);

  const addPizza = useCallback((input: PizzaInput) => {
    commit((current) => {
      const nextId = Math.max(0, ...current.map((pizza) => pizza.id)) + 1;
      return [...current, { ...input, id: nextId }];
    });
  }, [commit]);

  const updatePizza = useCallback((updatedPizza: Pizza) => {
    commit((current) => current.map((pizza) => pizza.id === updatedPizza.id ? updatedPizza : pizza));
  }, [commit]);

  const deletePizza = useCallback((id: number) => {
    commit((current) => current.filter((pizza) => pizza.id !== id));
  }, [commit]);

  return { pizzas, addPizza, updatePizza, deletePizza };
};
