import React, {FC, useState} from "react";
import "./App.css";
import AddPizzaForm from "./components/AddPizzaForm";
import Pizza from "./modules/Pizza";

const App: FC = () => {
const [pizzasList, setPizzasList] = useState<Pizza[]>([]);

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
