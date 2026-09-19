import { useId, useState, type FormEvent } from "react";
import { z } from "zod";
import {
  PIZZA_IMAGE_OPTIONS,
  getPizzaImageUrl,
  pizzaFormSchema,
  pizzaImageSchema,
  type PizzaDraft,
  type PizzaFormValues,
} from "./pizza";

interface PizzaFormProps {
  submitLabel: string;
  onSubmit(draft: PizzaDraft): void;
  initialValues?: PizzaFormValues;
  onCancel?: () => void;
  compact?: boolean;
  formId?: string;
}

type FormField = keyof PizzaFormValues;
type FormErrors = Partial<Record<FormField, string>>;

const emptyForm: PizzaFormValues = {
  name: "",
  price: "",
  image: "pizza-1.jpg",
};

function getFieldErrors(error: z.ZodError): FormErrors {
  const errors: FormErrors = {};

  for (const issue of error.issues) {
    const field = issue.path[0];

    if (
      (field === "name" || field === "price" || field === "image") &&
      !errors[field]
    ) {
      errors[field] = issue.message;
    }
  }

  return errors;
}

export function PizzaForm({
  submitLabel,
  onSubmit,
  initialValues,
  onCancel,
  compact = false,
  formId,
}: PizzaFormProps) {
  const reactId = useId();
  const [form, setForm] = useState<PizzaFormValues>(
    initialValues ?? emptyForm,
  );
  const [errors, setErrors] = useState<FormErrors>({});

  const nameId = `${reactId}-name`;
  const priceId = `${reactId}-price`;
  const imageId = `${reactId}-image`;

  function clearError(field: FormField): void {
    setErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    const parsed = pizzaFormSchema.safeParse(form);

    if (!parsed.success) {
      setErrors(getFieldErrors(parsed.error));
      return;
    }

    onSubmit(parsed.data);
    setErrors({});

    if (!initialValues) {
      setForm(emptyForm);
    }
  }

  return (
    <form
      id={formId}
      className={compact ? "pizza-form pizza-form--compact" : "pizza-form"}
      onSubmit={handleSubmit}
      noValidate
    >
      {!compact && (
        <div className="pizza-form__preview" aria-hidden="true">
          <img src={getPizzaImageUrl(form.image)} alt="" />
        </div>
      )}

      <div className="field">
        <label htmlFor={nameId}>Pizza name</label>
        <input
          id={nameId}
          name="name"
          type="text"
          value={form.name}
          maxLength={80}
          autoComplete="off"
          required
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? `${nameId}-error` : undefined}
          onChange={(event) => {
            clearError("name");
            setForm((current) => ({ ...current, name: event.target.value }));
          }}
        />
        {errors.name && (
          <p id={`${nameId}-error`} className="field__error" role="alert">
            {errors.name}
          </p>
        )}
      </div>

      <div className="pizza-form__row">
        <div className="field">
          <label htmlFor={priceId}>Price (€)</label>
          <input
            id={priceId}
            name="price"
            type="text"
            inputMode="decimal"
            placeholder="12.90"
            value={form.price}
            required
            aria-invalid={Boolean(errors.price)}
            aria-describedby={errors.price ? `${priceId}-error` : undefined}
            onChange={(event) => {
              clearError("price");
              setForm((current) => ({ ...current, price: event.target.value }));
            }}
          />
          {errors.price && (
            <p id={`${priceId}-error`} className="field__error" role="alert">
              {errors.price}
            </p>
          )}
        </div>

        <div className="field">
          <label htmlFor={imageId}>Photo</label>
          <select
            id={imageId}
            name="image"
            value={form.image}
            onChange={(event) => {
              const parsed = pizzaImageSchema.safeParse(event.target.value);

              if (parsed.success) {
                clearError("image");
                setForm((current) => ({
                  ...current,
                  image: parsed.data,
                }));
              }
            }}
          >
            {PIZZA_IMAGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="pizza-form__actions">
        <button className="button button--primary" type="submit">
          {submitLabel}
        </button>
        {onCancel && (
          <button
            className="button button--secondary"
            type="button"
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
