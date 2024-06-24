import React, { FC, useEffect, useState } from "react";
import AddPizzaForm from "../components/AddPizzaForm";
import DisplayPizzas from "../components/DisplayPizzas";
import Pizza from "../models/Pizza";
import demoPizzas from "../demoPizzas";

const HomeFeature: FC = () => {
  const [pizzasList, setPizzasList] = useState<Pizza[]>([]);

  const addPizza = (newPizza: Pizza) => {
    const updatedList = [...pizzasList, newPizza];
    setPizzasList(updatedList);
    localStorage.setItem("pizzasState", JSON.stringify(updatedList));
  };

  const updatePizza = (newPizza: Pizza) => {
    const updatedList = pizzasList.map((pizza) =>
      pizza.id === newPizza.id ? newPizza : pizza
    );
    setPizzasList(updatedList);
    localStorage.setItem("pizzasState", JSON.stringify(updatedList));
  };

  const deletePizza = (id: number) => {
    const updatedList = pizzasList.filter((pizza) => pizza.id !== id);
    setPizzasList(updatedList);
    localStorage.setItem("pizzasState", JSON.stringify(updatedList));
  };

  useEffect(() => {
    const pizzasState = localStorage.getItem("pizzasState");
    if (pizzasState) {
      setPizzasList(JSON.parse(pizzasState));
    } else {
      setPizzasList(demoPizzas);
    }
  }, []);

  return (
    <div className="App">
      <div className="wrap">
        <span className="heading">Our Pizzeria</span>
        <AddPizzaForm addPizza={addPizza} />
        <DisplayPizzas
          pizzasList={pizzasList}
          deletePizza={deletePizza}
          updatePizza={updatePizza}
        />
      </div>
    </div>
  );
};

export default HomeFeature;
