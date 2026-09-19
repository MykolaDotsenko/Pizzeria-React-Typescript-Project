import AddPizzaForm from "../components/AddPizzaForm";
import DisplayPizzas from "../components/DisplayPizzas";
import { usePizzas } from "../hooks/usePizzas";

const HomeFeature = () => {
  const { pizzas, addPizza, updatePizza, deletePizza } = usePizzas();

  return (
    <>
      <h1 className="heading">Our Pizzeria</h1>
      <AddPizzaForm addPizza={addPizza} />
      <DisplayPizzas pizzasList={pizzas} deletePizza={deletePizza} updatePizza={updatePizza} />
    </>
  );
};

export default HomeFeature;
