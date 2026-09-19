import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import { createPizzaId, type Pizza, type PizzaDraft } from "./pizza";
import { PizzasContext } from "./PizzasContext";
import { pizzaReducer } from "./pizzaReducer";
import {
  browserPizzaRepository,
  type PizzaRepository,
} from "./pizzaRepository";

interface PizzasProviderProps {
  children: ReactNode;
  repository?: PizzaRepository;
}

export function PizzasProvider({
  children,
  repository = browserPizzaRepository,
}: PizzasProviderProps) {
  const [pizzas, dispatch] = useReducer(
    pizzaReducer,
    repository,
    (pizzaRepository) => pizzaRepository.load(),
  );
  const [persistenceError, setPersistenceError] = useState(false);

  useEffect(() => {
    setPersistenceError(!repository.save(pizzas));
  }, [pizzas, repository]);

  const addPizza = useCallback((draft: PizzaDraft) => {
    dispatch({
      type: "pizza/added",
      pizza: { ...draft, id: createPizzaId() },
    });
  }, []);

  const updatePizza = useCallback((pizza: Pizza) => {
    dispatch({ type: "pizza/updated", pizza });
  }, []);

  const deletePizza = useCallback((id: string) => {
    dispatch({ type: "pizza/deleted", id });
  }, []);

  const value = useMemo(
    () => ({ pizzas, persistenceError, addPizza, updatePizza, deletePizza }),
    [pizzas, persistenceError, addPizza, updatePizza, deletePizza],
  );

  return <PizzasContext value={value}>{children}</PizzasContext>;
}
