import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { pizzaRepository } from "../data/pizzaRepository";
import type { Pizza, PizzaInput } from "../models/Pizza";

interface PizzasContextValue {
  pizzas: Pizza[];
  persistenceError: boolean;
  addPizza: (input: PizzaInput) => void;
  updatePizza: (pizza: Pizza) => void;
  deletePizza: (id: number) => void;
}

const PizzasContext = createContext<PizzasContextValue | undefined>(undefined);

export const PizzasProvider = ({ children }: { children: ReactNode }) => {
  const [pizzas, setPizzas] = useState<Pizza[]>(() => pizzaRepository.load());
  const [persistenceError, setPersistenceError] = useState(false);

  useEffect(() => {
    setPersistenceError(!pizzaRepository.save(pizzas));
  }, [pizzas]);

  const addPizza = useCallback((input: PizzaInput) => {
    setPizzas((current) => {
      const nextId = Math.max(0, ...current.map((pizza) => pizza.id)) + 1;
      return [...current, { ...input, id: nextId }];
    });
  }, []);

  const updatePizza = useCallback((updatedPizza: Pizza) => {
    setPizzas((current) =>
      current.map((pizza) =>
        pizza.id === updatedPizza.id ? updatedPizza : pizza
      )
    );
  }, []);

  const deletePizza = useCallback((id: number) => {
    setPizzas((current) => current.filter((pizza) => pizza.id !== id));
  }, []);

  const value = useMemo(
    () => ({
      pizzas,
      persistenceError,
      addPizza,
      updatePizza,
      deletePizza,
    }),
    [pizzas, persistenceError, addPizza, updatePizza, deletePizza]
  );

  return (
    <PizzasContext.Provider value={value}>{children}</PizzasContext.Provider>
  );
};

export const usePizzas = () => {
  const context = useContext(PizzasContext);

  if (!context) {
    throw new Error("usePizzas must be used within PizzasProvider");
  }

  return context;
};
