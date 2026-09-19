import { Link, useParams } from "react-router-dom";
import { usePizzas } from "../hooks/usePizzas";

const parsePizzaId = (value: string | undefined): number | null => {
  if (!value || !/^[1-9]\d*$/.test(value)) {
    return null;
  }

  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : null;
};

const PizzaFeature = () => {
  const { id } = useParams<{ id: string }>();
  const { pizzas } = usePizzas();
  const pizzaId = parsePizzaId(id);
  const pizza =
    pizzaId === null ? undefined : pizzas.find((item) => item.id === pizzaId);

  if (!pizza) {
    return (
      <section className="empty-state" aria-live="polite">
        <h1 className="heading">Pizza not found</h1>
        <p>This pizza does not exist or has been removed.</p>
        <Link className="back-link" to="/">
          Back to menu
        </Link>
      </section>
    );
  }

  return (
    <>
      <h1 className="heading">Your Pizza</h1>
      <article className="pizza pizza-page">
        <img src={"/images/" + pizza.img} alt={pizza.title} />
        <h2>{pizza.title}</h2>
        <span className="price-badge">{pizza.price.toFixed(2)} €</span>
        <p>Best in Turku</p>
        <Link className="back-link" to="/">
          Back to menu
        </Link>
      </article>
    </>
  );
};

export default PizzaFeature;
