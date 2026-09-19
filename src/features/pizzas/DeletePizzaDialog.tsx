import { useEffect, useId, useRef } from "react";

interface DeletePizzaDialogProps {
  open: boolean;
  pizzaName: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeletePizzaDialog({
  open,
  pizzaName,
  onCancel,
  onConfirm,
}: DeletePizzaDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className="confirm-dialog"
      aria-labelledby={titleId}
      onCancel={onCancel}
    >
      <span className="eyebrow">Remove pizza</span>
      <h2 id={titleId}>Delete {pizzaName}?</h2>
      <p>
        This removes the pizza from this browser. You cannot undo this action after
        leaving the page.
      </p>
      <div className="confirm-dialog__actions">
        <button className="button button--secondary" type="button" onClick={onCancel}>
          Keep pizza
        </button>
        <button className="button button--danger" type="button" onClick={onConfirm}>
          Delete pizza
        </button>
      </div>
    </dialog>
  );
}
