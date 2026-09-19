import { useState, type DragEvent } from "react";
import { Link } from "react-router";
import {
  formatPizzaPrice,
  getPizzaCategoryLabel,
  getPizzaImageUrl,
  pizzaToFormValues,
  type Pizza,
} from "./pizza";
import { PizzaForm } from "./PizzaForm";

interface PizzaCardProps {
  pizza: Pizza;
  reorderEnabled: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onUpdate: (pizza: Pizza) => void;
  onDelete: (pizza: Pizza) => void;
  onMove: (id: string, direction: -1 | 1) => void;
  onReorder: (sourceId: string, targetId: string) => void;
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

function ArrowIcon({ direction }: { direction: "up" | "down" }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d={direction === "up" ? "m7 14 5-5 5 5H7Z" : "m7 10 5 5 5-5H7Z"} />
    </svg>
  );
}

export function PizzaCard({
  pizza,
  reorderEnabled,
  canMoveUp,
  canMoveDown,
  onUpdate,
  onDelete,
  onMove,
  onReorder,
}: PizzaCardProps) {
  const [editing, setEditing] = useState(false);
  const editFormId = `edit-${pizza.id}`;

  function handleDragStart(event: DragEvent<HTMLElement>): void {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", pizza.id);
  }

  function handleDrop(event: DragEvent<HTMLElement>): void {
    if (!reorderEnabled) {
      return;
    }

    event.preventDefault();
    const sourceId = event.dataTransfer.getData("text/plain");

    if (sourceId) {
      onReorder(sourceId, pizza.id);
    }
  }

  return (
    <article
      className="pizza-card"
      draggable={reorderEnabled}
      onDragStart={handleDragStart}
      onDragOver={(event) => {
        if (reorderEnabled) {
          event.preventDefault();
          event.dataTransfer.dropEffect = "move";
        }
      }}
      onDrop={handleDrop}
    >
      <Link
        className="pizza-card__image-link"
        to={`/pizza/${pizza.id}`}
        aria-label={`View ${pizza.name} details`}
      >
        <img
          className="pizza-card__image"
          src={getPizzaImageUrl(pizza.image)}
          alt=""
          loading="lazy"
          width="640"
          height="480"
        />
      </Link>

      <div className="pizza-card__body">
        <div className="pizza-card__heading">
          <div>
            <span className="category-chip">
              {getPizzaCategoryLabel(pizza.category)}
            </span>
            <h3>
              <Link to={`/pizza/${pizza.id}`}>{pizza.name}</Link>
            </h3>
          </div>
          <strong className="price-chip">{formatPizzaPrice(pizza.priceCents)}</strong>
        </div>

        <p className="pizza-card__description">{pizza.description}</p>

        <div
          className="pizza-card__actions"
          role="group"
          aria-label={`Actions for ${pizza.name}`}
        >
          <button
            className="icon-button"
            type="button"
            aria-label={`Move ${pizza.name} up`}
            title="Move up"
            disabled={!reorderEnabled || !canMoveUp}
            onClick={() => onMove(pizza.id, -1)}
          >
            <ArrowIcon direction="up" />
          </button>
          <button
            className="icon-button"
            type="button"
            aria-label={`Move ${pizza.name} down`}
            title="Move down"
            disabled={!reorderEnabled || !canMoveDown}
            onClick={() => onMove(pizza.id, 1)}
          >
            <ArrowIcon direction="down" />
          </button>
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
            onClick={() => onDelete(pizza)}
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
    </article>
  );
}
