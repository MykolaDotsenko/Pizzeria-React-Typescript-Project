import React, { FC } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import PizzaPage from "./pages/PizzaPage";
import "./App.css";

const App: FC = () => {
  return (
    <Router>
      <div className="App">
        <div className="wrap">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/pizza/:id" element={<PizzaPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
