import { useState } from "react";
import { Link } from "react-router";
import {
  formatPizzaPrice,
  getPizzaImageUrl,
  pizzaToFormValues,
  type Pizza,
} from "./pizza";
import { DeletePizzaDialog } from "./DeletePizzaDialog";
import { PizzaForm } from "./PizzaForm";

interface PizzaCardProps {
  pizza: Pizza;
  onUpdate: (pizza: Pizza) => void;
  onDelete: (id: string) => void;
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 16.5V20h3.5L18 9.5 14.5 6 4 16.5Zm16.7-9.7a1 1 0 0 0 0-1.4l-2.1-2.1a1 1 0 0 0-1.4 0L15.6 4.9l3.5 3.5 1.6-1.6Z" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 21a2 2 0 0 1-2-2V7h14v12a2 2 0 0 1-2 2H7Zm10-17h-2.5l-1-1h-3l-1 1H7v2h10V4Z" />
    </svg>
  );
}

export function PizzaCard({ pizza, onUpdate, onDelete }: PizzaCardProps) {
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const editFormId = `edit-${pizza.id}`;

  return (
    <article className="pizza-card">
      <Link className="pizza-card__image-link" to={`/pizza/${pizza.id}`}>
        <img
          className="pizza-card__image"
          src={getPizzaImageUrl(pizza.image)}
          alt={pizza.name}
          loading="lazy"
          width="640"
          height="480"
        />
      </Link>

      <div className="pizza-card__body">
        <div className="pizza-card__heading">
          <div>
            <span className="pizza-card__kicker">House menu</span>
            <h3>
              <Link to={`/pizza/${pizza.id}`}>{pizza.name}</Link>
            </h3>
          </div>
          <strong className="price-chip">{formatPizzaPrice(pizza.priceCents)}</strong>
        </div>

        <div
          className="pizza-card__actions"
          role="group"
          aria-label={`Actions for ${pizza.name}`}
        >
          <button
            className="icon-button"
            type="button"
            aria-label={`Edit ${pizza.name}`}
            aria-expanded={editing}
            aria-controls={editFormId}
            onClick={() => setEditing((current) => !current)}
          >
            <EditIcon />
          </button>
          <button
            className="icon-button icon-button--danger"
            type="button"
            aria-label={`Delete ${pizza.name}`}
            onClick={() => setConfirmingDelete(true)}
          >
            <DeleteIcon />
          </button>
        </div>

        {editing && (
          <div className="pizza-card__editor">
            <PizzaForm
              compact
              formId={editFormId}
              submitLabel="Save changes"
              initialValues={pizzaToFormValues(pizza)}
              onCancel={() => setEditing(false)}
              onSubmit={(draft) => {
                onUpdate({ ...draft, id: pizza.id });
                setEditing(false);
              }}
            />
          </div>
        )}
      </div>

      <DeletePizzaDialog
        open={confirmingDelete}
        pizzaName={pizza.name}
        onCancel={() => setConfirmingDelete(false)}
        onConfirm={() => {
          setConfirmingDelete(false);
          onDelete(pizza.id);
        }}
      />
    </article>
  );
}
