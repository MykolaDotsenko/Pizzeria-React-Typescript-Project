import type { Pizza } from "./pizza";

export type PizzaAction =
  | { type: "pizza/added"; pizza: Pizza }
  | { type: "pizza/updated"; pizza: Pizza }
  | { type: "pizza/deleted"; id: string }
  | { type: "pizza/restored"; pizza: Pizza; index: number }
  | { type: "pizza/reordered"; sourceId: string; targetId: string }
  | { type: "pizza/moved"; id: string; direction: -1 | 1 };

function moveItem<T>(
  items: readonly T[],
  fromIndex: number,
  toIndex: number,
): readonly T[] {
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= items.length ||
    toIndex >= items.length ||
    fromIndex === toIndex
  ) {
    return items;
  }

  const next = [...items];
  const [item] = next.splice(fromIndex, 1);

  if (item === undefined) {
    return items;
  }

  next.splice(toIndex, 0, item);
  return next;
}

export function pizzaReducer(
  state: readonly Pizza[],
  action: PizzaAction,
): readonly Pizza[] {
  switch (action.type) {
    case "pizza/added":
      return state.some((pizza) => pizza.id === action.pizza.id)
        ? state
        : [...state, action.pizza];

    case "pizza/updated":
      if (!state.some((pizza) => pizza.id === action.pizza.id)) {
        return state;
      }

      return state.map((pizza) =>
        pizza.id === action.pizza.id ? action.pizza : pizza,
      );

    case "pizza/deleted":
      return state.some((pizza) => pizza.id === action.id)
        ? state.filter((pizza) => pizza.id !== action.id)
        : state;

    case "pizza/restored": {
      if (state.some((pizza) => pizza.id === action.pizza.id)) {
        return state;
      }

      const next = [...state];
      const index = Math.min(Math.max(action.index, 0), next.length);
      next.splice(index, 0, action.pizza);
      return next;
    }

    case "pizza/reordered": {
      const fromIndex = state.findIndex((pizza) => pizza.id === action.sourceId);
      const toIndex = state.findIndex((pizza) => pizza.id === action.targetId);
      return moveItem(state, fromIndex, toIndex);
    }

    case "pizza/moved": {
      const fromIndex = state.findIndex((pizza) => pizza.id === action.id);
      return moveItem(state, fromIndex, fromIndex + action.direction);
    }
  }
}
