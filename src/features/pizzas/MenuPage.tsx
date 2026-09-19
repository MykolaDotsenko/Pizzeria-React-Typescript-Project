import { useState } from "react";
import { PizzaCard } from "./PizzaCard";
import { PizzaForm } from "./PizzaForm";
import { usePizzas } from "./PizzasContext";

export function MenuPage() {
  const { pizzas, persistenceError, addPizza, updatePizza, deletePizza } = usePizzas();
  const [query, setQuery] = useState("");

  const normalizedQuery = query.trim().toLocaleLowerCase("en");
  const visiblePizzas = normalizedQuery
    ? pizzas.filter((pizza) =>
        pizza.name.toLocaleLowerCase("en").includes(normalizedQuery),
      )
    : pizzas;

  return (
    <>
      <section className="hero">
        <div className="hero__copy">
          <span className="eyebrow">Local menu studio</span>
          <h1>Craft a menu that feels ready to serve.</h1>
          <p>
            Add, refine, and browse your pizzas in a fast local-first workspace. Every
            change is validated before it reaches persistent state.
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
            Browser storage is unavailable, so edits may disappear after a reload.
          </span>
        </div>
      )}

      <div className="workspace">
        <aside className="editor-panel">
          <div className="section-heading">
            <span className="eyebrow">Menu builder</span>
            <h2>Add a pizza</h2>
            <p>Keep it simple: name, price, and a photo.</p>
          </div>
          <PizzaForm submitLabel="Add to menu" onSubmit={addPizza} />
        </aside>

        <section className="menu-panel" aria-labelledby="menu-heading">
          <div className="menu-toolbar">
            <div>
              <span className="eyebrow">Your collection</span>
              <h2 id="menu-heading">Pizza menu</h2>
            </div>

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

          {visiblePizzas.length > 0 ? (
            <div className="pizza-grid">
              {visiblePizzas.map((pizza) => (
                <PizzaCard
                  key={pizza.id}
                  pizza={pizza}
                  onUpdate={updatePizza}
                  onDelete={deletePizza}
                />
              ))}
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
                  : "Try a different search term."}
              </p>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
