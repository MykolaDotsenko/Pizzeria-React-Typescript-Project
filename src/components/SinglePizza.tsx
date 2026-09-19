import { useState } from "react";
import { AiFillDelete, AiFillEdit } from "react-icons/ai";
import { Link } from "react-router-dom";
import type { Pizza } from "../models/Pizza";
import EditPizzaForm from "./EditPizzaForm";

interface SinglePizzaProps {
  pizza: Pizza;
  updatePizza: (newPizza: Pizza) => void;
  deletePizza: (id: number) => void;
}

const SinglePizza = ({
  pizza,
  updatePizza,
  deletePizza,
}: SinglePizzaProps) => {
  const [edit, setEdit] = useState(false);
  const editFormId = "edit-pizza-" + pizza.id;

  return (
    <article className="pizza">
      <img src={"/images/" + pizza.img} alt={pizza.title} loading="lazy" />
      <h2>
        <Link to={"/pizza/" + pizza.id}>{pizza.title}</Link>
      </h2>
      <span className="price-badge">{pizza.price.toFixed(2)} €</span>

      <div
        className="pizza-controls"
        role="group"
        aria-label={"Actions for " + pizza.title}
      >
        <button
          className="icon-button"
          type="button"
          aria-label={"Edit " + pizza.title}
          aria-expanded={edit}
          aria-controls={editFormId}
          onClick={() => setEdit((current) => !current)}
        >
          <AiFillEdit aria-hidden="true" />
        </button>
        <button
          className="icon-button"
          type="button"
          aria-label={"Delete " + pizza.title}
          onClick={() => deletePizza(pizza.id)}
        >
          <AiFillDelete aria-hidden="true" />
        </button>
      </div>

      {edit && (
        <EditPizzaForm
          data={pizza}
          formId={editFormId}
          updatePizza={updatePizza}
          handleToggleEdit={() => setEdit(false)}
        />
      )}
    </article>
  );
};

export default SinglePizza;
