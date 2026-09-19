import type { Pizza } from "../models/Pizza";
import SinglePizza from "./SinglePizza";

interface DisplayPizzasProps {
  pizzasList: Pizza[];
  updatePizza: (newPizza: Pizza) => void;
  deletePizza: (id: number) => void;
}

const DisplayPizzas = ({ pizzasList, updatePizza, deletePizza }: DisplayPizzasProps) => {
  if (pizzasList.length === 0) {
    return <p className="empty-state" aria-live="polite">The menu is empty. Add your first pizza above.</p>;
  }

  return (
    <section className="container" aria-label="Pizza menu">
      {pizzasList.map((pizza) => (
        <SinglePizza key={pizza.id} pizza={pizza} updatePizza={updatePizza} deletePizza={deletePizza} />
      ))}
    </section>
  );
};

export default DisplayPizzas;
