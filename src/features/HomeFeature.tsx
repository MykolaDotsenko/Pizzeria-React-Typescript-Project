import AddPizzaForm from "../components/AddPizzaForm";
import DisplayPizzas from "../components/DisplayPizzas";
import { usePizzas } from "../hooks/usePizzas";

const HomeFeature = () => {
  const {
    pizzas,
    persistenceError,
    addPizza,
    updatePizza,
    deletePizza,
  } = usePizzas();

  return (
    <>
      <h1 className="heading">Our Pizzeria</h1>

      {persistenceError && (
        <p className="storage-warning" role="status">
          Browser storage is unavailable. Your changes are temporary and may be
          lost after a reload.
        </p>
      )}

      <AddPizzaForm addPizza={addPizza} />
      <DisplayPizzas
        pizzasList={pizzas}
        deletePizza={deletePizza}
        updatePizza={updatePizza}
      />
    </>
  );
};

export default HomeFeature;
