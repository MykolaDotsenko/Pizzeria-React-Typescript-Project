import { useEffect, useMemo, useState } from "react";
import {
  PIZZA_CATEGORY_OPTIONS,
  getPizzaCategoryLabel,
  pizzaCategorySchema,
  type Pizza,
  type PizzaCategory,
} from "./pizza";
import { PizzaCard } from "./PizzaCard";
import { PizzaForm } from "./PizzaForm";
import { usePizzas } from "./PizzasContext";

interface PendingUndo {
  pizza: Pizza;
  index: number;
}

export function MenuPage() {
  const {
    pizzas,
    persistenceError,
    addPizza,
    updatePizza,
    deletePizza,
    restorePizza,
    reorderPizza,
    movePizza,
  } = usePizzas();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"all" | PizzaCategory>("all");
  const [pendingUndo, setPendingUndo] = useState<PendingUndo | null>(null);
  const [reorderAnnouncement, setReorderAnnouncement] = useState("");

  useEffect(() => {
    if (!pendingUndo) {
      return;
    }

    const timer = window.setTimeout(() => {
      setPendingUndo(null);
    }, 7000);

    return () => window.clearTimeout(timer);
  }, [pendingUndo]);

  const normalizedQuery = query.trim().toLocaleLowerCase("en");
  const reorderEnabled = normalizedQuery === "" && category === "all";

  const visiblePizzas = useMemo(
    () =>
      pizzas.filter((pizza) => {
        const matchesCategory = category === "all" || pizza.category === category;
        const searchable = `${pizza.name} ${pizza.description}`.toLocaleLowerCase("en");
        const matchesQuery =
          normalizedQuery === "" || searchable.includes(normalizedQuery);

        return matchesCategory && matchesQuery;
      }),
    [pizzas, category, normalizedQuery],
  );

  function handleDelete(pizza: Pizza): void {
    const index = pizzas.findIndex((item) => item.id === pizza.id);

    if (index < 0) {
      return;
    }

    deletePizza(pizza.id);
    setPendingUndo({ pizza, index });
  }

  function handleUndo(): void {
    if (!pendingUndo) {
      return;
    }

    restorePizza(pendingUndo.pizza, pendingUndo.index);
    setPendingUndo(null);
  }

  function handleReorder(sourceId: string, targetId: string): void {
    if (!reorderEnabled || sourceId === targetId) {
      return;
    }

    const source = pizzas.find((pizza) => pizza.id === sourceId);
    const target = pizzas.find((pizza) => pizza.id === targetId);

    reorderPizza(sourceId, targetId);

    if (source && target) {
      setReorderAnnouncement(`${source.name} moved to the position of ${target.name}.`);
    }
  }

  function handleMove(id: string, direction: -1 | 1): void {
    const pizza = pizzas.find((item) => item.id === id);

    movePizza(id, direction);

    if (pizza) {
      setReorderAnnouncement(`${pizza.name} moved ${direction < 0 ? "up" : "down"}.`);
    }
  }

  return (
    <>
      <section className="hero">
        <div className="hero__copy">
          <span className="eyebrow">Local menu studio</span>
          <h1>Craft a menu that feels ready to serve.</h1>
          <p>
            Build a polished menu with your own photos, descriptions, categories,
            pricing, and ordering — all stored locally in this browser.
          </p>
        </div>

        <div className="hero__stat" aria-label={`${pizzas.length} pizzas`}>
          <strong>{pizzas.length}</strong>
          <span>{pizzas.length === 1 ? "pizza" : "pizzas"} on the menu</span>
        </div>
      </section>

      {persistenceError && (
        <div className="storage-warning" role="status">
          <strong>Changes are temporary.</strong>
          <span>
            Browser storage is unavailable or read-only, so edits may disappear after a
            reload.
          </span>
        </div>
      )}

      <div className="workspace">
        <aside className="editor-panel">
          <div className="section-heading">
            <span className="eyebrow">Menu builder</span>
            <h2>Add a pizza</h2>
            <p>Add the details a customer needs to choose confidently.</p>
          </div>
          <PizzaForm submitLabel="Add to menu" onSubmit={addPizza} />
        </aside>

        <section className="menu-panel" aria-labelledby="menu-heading">
          <div className="menu-toolbar">
            <div>
              <span className="eyebrow">Your collection</span>
              <h2 id="menu-heading">Pizza menu</h2>
            </div>

            <div className="menu-toolbar__controls">
              <label className="filter-control">
                <span>Category</span>
                <select
                  aria-label="Filter by category"
                  value={category}
                  onChange={(event) => {
                    const value = event.target.value;

                    if (value === "all") {
                      setCategory("all");
                      return;
                    }

                    const parsed = pizzaCategorySchema.safeParse(value);

                    if (parsed.success) {
                      setCategory(parsed.data);
                    }
                  }}
                >
                  <option value="all">All categories</option>
                  {PIZZA_CATEGORY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="search-box">
                <span className="sr-only">Search menu</span>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m21 20-4.8-4.8a7.5 7.5 0 1 0-1 1L20 21l1-1ZM5.5 10.5a5 5 0 1 1 10 0 5 5 0 0 1-10 0Z" />
                </svg>
                <input
                  type="search"
                  placeholder="Search pizzas"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </label>
            </div>
          </div>

          <div className="menu-order-hint">
            <span>
              {reorderEnabled
                ? "Drag cards or use the arrow buttons to reorder the menu."
                : "Clear search and category filters to reorder the menu."}
            </span>
            {!reorderEnabled && (
              <button
                className="text-button"
                type="button"
                onClick={() => {
                  setQuery("");
                  setCategory("all");
                }}
              >
                Clear filters
              </button>
            )}
          </div>

          <p className="sr-only" aria-live="polite">
            {reorderAnnouncement}
          </p>

          {visiblePizzas.length > 0 ? (
            <div className="pizza-grid">
              {visiblePizzas.map((pizza) => {
                const index = pizzas.findIndex((item) => item.id === pizza.id);

                return (
                  <PizzaCard
                    key={pizza.id}
                    pizza={pizza}
                    reorderEnabled={reorderEnabled}
                    canMoveUp={index > 0}
                    canMoveDown={index >= 0 && index < pizzas.length - 1}
                    onUpdate={updatePizza}
                    onDelete={handleDelete}
                    onMove={handleMove}
                    onReorder={handleReorder}
                  />
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <span className="empty-state__mark" aria-hidden="true">
                P
              </span>
              <h3>{pizzas.length === 0 ? "Your menu is empty" : "No matches"}</h3>
              <p>
                {pizzas.length === 0
                  ? "Create the first pizza using the menu builder."
                  : category === "all"
                    ? "Try a different search term."
                    : `No ${getPizzaCategoryLabel(category).toLowerCase()} pizzas match these filters.`}
              </p>
            </div>
          )}
        </section>
      </div>

      {pendingUndo && (
        <div className="undo-toast" aria-live="polite">
          <span>
            <strong>{pendingUndo.pizza.name}</strong> removed.
          </span>
          <button className="undo-toast__action" type="button" onClick={handleUndo}>
            Undo
          </button>
          <button
            className="undo-toast__dismiss"
            type="button"
            aria-label="Dismiss undo message"
            onClick={() => setPendingUndo(null)}
          >
            ×
          </button>
        </div>
      )}
    </>
  );
}
