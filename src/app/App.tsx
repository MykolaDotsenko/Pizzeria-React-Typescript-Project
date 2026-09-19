import { BrowserRouter, Link, Route, Routes } from "react-router";
import { MenuPage } from "../features/pizzas/MenuPage";
import { PizzaDetailsPage } from "../features/pizzas/PizzaDetailsPage";
import { PizzasProvider } from "../features/pizzas/PizzasProvider";
import { NotFoundPage } from "./NotFoundPage";

export function App() {
  return (
    <PizzasProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <div className="app">
          <header className="site-header">
            <div className="site-header__inner">
              <Link className="brand" to="/" aria-label="Pizzeria Studio home">
                <span className="brand__mark" aria-hidden="true">
                  P
                </span>
                <span>
                  <strong>Pizzeria</strong>
                  <small>Studio</small>
                </span>
              </Link>
              <span className="site-header__badge">Local-first menu editor</span>
            </div>
          </header>

          <main className="app__main">
            <Routes>
              <Route index element={<MenuPage />} />
              <Route path="pizza/:id" element={<PizzaDetailsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>

          <footer className="site-footer">
            Built as a resilient client-side CRUD application.
          </footer>
        </div>
      </BrowserRouter>
    </PizzasProvider>
  );
}
