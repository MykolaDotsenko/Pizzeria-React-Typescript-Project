import React, { FC, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Pizza from "../models/Pizza";
import demoPizzas from "../demoPizzas";

const PizzaFeature: FC = () => {
  const { id } = useParams<{ id: string }>();
  const [pizza, setPizza] = useState<Pizza | null>(null);

  useEffect(() => {
    const pizzasState = localStorage.getItem("pizzasState");
    if (pizzasState && id) {
      const pizzasList = JSON.parse(pizzasState);
      const searchId = parseInt(id, 10);
      const currentPizza = pizzasList.find((p: Pizza) => p.id === searchId);
      setPizza(currentPizza);
    } else if (id) {
      const searchId = parseInt(id, 10);
      const currentPizza = demoPizzas.find((p) => p.id === searchId);
      setPizza(currentPizza || null);
    }
  }, [id]);

  return (
    <>
      <span className="heading">Your Pizza</span>
      <div className="pizza pizza-page">
        {pizza && (
          <>
            <img src={`/images/${pizza.img}`} alt={pizza.title} />
            <h2>{pizza.title}</h2>
            <span>{pizza.price} EURO</span>
            <p>Best in Turku</p>
          </>
        )}
      </div>
    </>
  );
};

export default PizzaFeature;
