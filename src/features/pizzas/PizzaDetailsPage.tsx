import { Link, useParams } from "react-router";
import {
  formatPizzaPrice,
  getPizzaCategoryLabel,
  getPizzaImageUrl,
  pizzaIdSchema,
} from "./pizza";
import { usePizzas } from "./PizzasContext";

export function PizzaDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { pizzas } = usePizzas();
  const parsedId = pizzaIdSchema.safeParse(id);
  const pizza = parsedId.success
    ? pizzas.find((item) => item.id === parsedId.data)
    : undefined;

  if (!pizza) {
    return (
      <section className="state-page">
        <span className="eyebrow">Not found</span>
        <h1>This pizza is no longer on the menu.</h1>
        <p>It may have been deleted or the link may be outdated.</p>
        <Link className="button button--primary" to="/">
          Back to menu
        </Link>
      </section>
    );
  }

  return (
    <article className="details-page">
      <Link className="back-link" to="/">
        <span aria-hidden="true">←</span> Back to menu
      </Link>

      <div className="details-card">
        <div className="details-card__media">
          <img
            src={getPizzaImageUrl(pizza.image)}
            alt={pizza.name}
            width="960"
            height="720"
          />
        </div>

        <div className="details-card__content">
          <span className="category-chip">{getPizzaCategoryLabel(pizza.category)}</span>
          <h1>{pizza.name}</h1>
          <strong className="details-card__price">
            {formatPizzaPrice(pizza.priceCents)}
          </strong>
          <p>{pizza.description}</p>

          <dl className="details-meta">
            <div>
              <dt>Category</dt>
              <dd>{getPizzaCategoryLabel(pizza.category)}</dd>
            </div>
            <div>
              <dt>Storage</dt>
              <dd>Browser-local</dd>
            </div>
            <div>
              <dt>Currency</dt>
              <dd>EUR</dd>
            </div>
          </dl>
        </div>
      </div>
    </article>
  );
}
