import React from "react";
import "./App.css";
import AddPizzaForm from "./components/AddPizzaForm";

const App: React.FC = () => {
  return (
    <div className="App">
      <div className="wrap">
        <span className="heading">Our Pizzeria</span>
      <AddPizzaForm />
      </div>
    </div>
  );
};

export default App;
