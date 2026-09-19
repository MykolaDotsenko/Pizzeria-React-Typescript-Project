import {
  useCallback,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import { createPizzaId, type Pizza, type PizzaDraft } from "./pizza";
import { PizzasContext } from "./PizzasContext";
import { pizzaReducer, type PizzaAction } from "./pizzaReducer";
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

  const commit = useCallback(
    (action: PizzaAction) => {
      const next = pizzaReducer(pizzas, action);

      if (next === pizzas) {
        return;
      }

      setPersistenceError(!repository.save(next));
      dispatch(action);
    },
    [pizzas, repository],
  );

  const addPizza = useCallback(
    (draft: PizzaDraft) => {
      commit({
        type: "pizza/added",
        pizza: { ...draft, id: createPizzaId() },
      });
    },
    [commit],
  );

  const updatePizza = useCallback(
    (pizza: Pizza) => {
      commit({ type: "pizza/updated", pizza });
    },
    [commit],
  );

  const deletePizza = useCallback(
    (id: string) => {
      commit({ type: "pizza/deleted", id });
    },
    [commit],
  );

  const value = useMemo(
    () => ({ pizzas, persistenceError, addPizza, updatePizza, deletePizza }),
    [pizzas, persistenceError, addPizza, updatePizza, deletePizza],
  );

  return <PizzasContext value={value}>{children}</PizzasContext>;
}
