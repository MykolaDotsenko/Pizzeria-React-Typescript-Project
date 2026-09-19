import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { PizzasProvider } from "./context/PizzasContext";
import HomePage from "./pages/HomePage";
import PizzaPage from "./pages/PizzaPage";
import "./App.css";

const App = () => (
  <PizzasProvider>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <main className="app-shell">
        <div className="wrap">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/pizza/:id" element={<PizzaPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </BrowserRouter>
  </PizzasProvider>
);

export default App;
