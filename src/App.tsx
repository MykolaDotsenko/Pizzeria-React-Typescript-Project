import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import PizzaPage from "./pages/PizzaPage";
import "./App.css";

const App = () => (
  <BrowserRouter>
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
);

export default App;
