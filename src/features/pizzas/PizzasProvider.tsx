import {
  useCallback,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPizzaId, type Pizza, type PizzaDraft } from "./pizza";
import { PizzasContext } from "./PizzasContext";
import { pizzaReducer, type PizzaAction } from "./pizzaReducer";
import { browserPizzaRepository, type PizzaRepository } from "./pizzaRepository";

interface PizzasProviderProps {
  children: ReactNode;
  repository?: PizzaRepository;
}

export function PizzasProvider({
  children,
  repository = browserPizzaRepository,
}: PizzasProviderProps) {
  const [pizzas, dispatch] = useReducer(pizzaReducer, repository, (pizzaRepository) =>
    pizzaRepository.load(),
  );
  const pizzasRef = useRef(pizzas);
  const [persistenceError, setPersistenceError] = useState(
    () => !repository.isWritable(),
  );

  const commit = useCallback(
    (action: PizzaAction) => {
      const current = pizzasRef.current;
      const next = pizzaReducer(current, action);

      if (next === current) {
        return;
      }

      pizzasRef.current = next;
      setPersistenceError(!repository.save(next));
      dispatch(action);
    },
    [repository],
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

  const restorePizza = useCallback(
    (pizza: Pizza, index: number) => {
      commit({ type: "pizza/restored", pizza, index });
    },
    [commit],
  );

  const reorderPizza = useCallback(
    (sourceId: string, targetId: string) => {
      commit({ type: "pizza/reordered", sourceId, targetId });
    },
    [commit],
  );

  const movePizza = useCallback(
    (id: string, direction: -1 | 1) => {
      commit({ type: "pizza/moved", id, direction });
    },
    [commit],
  );

  const value = useMemo(
    () => ({
      pizzas,
      persistenceError,
      addPizza,
      updatePizza,
      deletePizza,
      restorePizza,
      reorderPizza,
      movePizza,
    }),
    [
      pizzas,
      persistenceError,
      addPizza,
      updatePizza,
      deletePizza,
      restorePizza,
      reorderPizza,
      movePizza,
    ],
  );

  return <PizzasContext value={value}>{children}</PizzasContext>;
}
