import { useId, useState, type ChangeEvent, type FormEvent } from "react";
import type { ZodError } from "zod";
import { processPizzaImage } from "./imageProcessing";
import {
  PIZZA_CATEGORY_OPTIONS,
  PIZZA_IMAGE_OPTIONS,
  createPresetPizzaImage,
  getPizzaImageUrl,
  pizzaCategorySchema,
  pizzaFormSchema,
  type PizzaDraft,
  type PizzaFormValues,
} from "./pizza";

interface PizzaFormProps {
  submitLabel: string;
  onSubmit: (draft: PizzaDraft) => void;
  initialValues?: PizzaFormValues;
  onCancel?: () => void;
  compact?: boolean;
  formId?: string;
}

type FormField = keyof PizzaFormValues;
type FormErrors = Partial<Record<FormField, string>>;

function createEmptyForm(): PizzaFormValues {
  return {
    name: "",
    description: "",
    category: "classic",
    price: "",
    image: createPresetPizzaImage("pizza-1.jpg"),
  };
}

function getFieldErrors(error: ZodError): FormErrors {
  const errors: FormErrors = {};

  for (const issue of error.issues) {
    const field = issue.path[0];

    if (
      (field === "name" ||
        field === "description" ||
        field === "category" ||
        field === "price" ||
        field === "image") &&
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
  const [form, setForm] = useState<PizzaFormValues>(initialValues ?? createEmptyForm());
  const [errors, setErrors] = useState<FormErrors>({});
  const [uploadError, setUploadError] = useState("");
  const [processingImage, setProcessingImage] = useState(false);

  const nameId = `${reactId}-name`;
  const descriptionId = `${reactId}-description`;
  const priceId = `${reactId}-price`;
  const categoryId = `${reactId}-category`;
  const presetImageId = `${reactId}-preset-image`;
  const uploadId = `${reactId}-upload`;

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

  async function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    setProcessingImage(true);
    setUploadError("");

    try {
      const image = await processPizzaImage(file);
      clearError("image");
      setForm((current) => ({ ...current, image }));
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "Could not process this image.",
      );
    } finally {
      setProcessingImage(false);
      input.value = "";
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    if (processingImage) {
      return;
    }

    const parsed = pizzaFormSchema.safeParse(form);

    if (!parsed.success) {
      setErrors(getFieldErrors(parsed.error));
      return;
    }

    onSubmit(parsed.data);
    setErrors({});
    setUploadError("");

    if (!initialValues) {
      setForm(createEmptyForm());
    }
  }

  return (
    <form
      id={formId}
      className={compact ? "pizza-form pizza-form--compact" : "pizza-form"}
      onSubmit={handleSubmit}
      aria-busy={processingImage}
      noValidate
    >
      <div className="pizza-form__preview">
        <img
          src={getPizzaImageUrl(form.image)}
          alt="Pizza photo preview"
          width="640"
          height="320"
        />
      </div>

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

      <div className="field">
        <label htmlFor={descriptionId}>Description</label>
        <textarea
          id={descriptionId}
          name="description"
          value={form.description}
          maxLength={240}
          rows={compact ? 3 : 4}
          required
          aria-invalid={Boolean(errors.description)}
          aria-describedby={errors.description ? `${descriptionId}-error` : undefined}
          onChange={(event) => {
            clearError("description");
            setForm((current) => ({
              ...current,
              description: event.target.value,
            }));
          }}
        />
        <span className="field__hint">{form.description.length}/240</span>
        {errors.description && (
          <p id={`${descriptionId}-error`} className="field__error" role="alert">
            {errors.description}
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
          <label htmlFor={categoryId}>Category</label>
          <select
            id={categoryId}
            name="category"
            value={form.category}
            onChange={(event) => {
              const parsed = pizzaCategorySchema.safeParse(event.target.value);

              if (parsed.success) {
                clearError("category");
                setForm((current) => ({
                  ...current,
                  category: parsed.data,
                }));
              }
            }}
          >
            {PIZZA_CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <fieldset className="photo-fieldset">
        <legend>Photo</legend>

        <div className="pizza-form__row">
          <div className="field">
            <label htmlFor={presetImageId}>Preset photo</label>
            <select
              id={presetImageId}
              value={form.image.kind === "preset" ? form.image.value : ""}
              onChange={(event) => {
                const value = event.target.value;

                if (!value) {
                  return;
                }

                const preset = PIZZA_IMAGE_OPTIONS.find(
                  (option) => option.value === value,
                );

                if (preset) {
                  setUploadError("");
                  clearError("image");
                  setForm((current) => ({
                    ...current,
                    image: createPresetPizzaImage(preset.value),
                  }));
                }
              }}
            >
              {form.image.kind === "uploaded" && (
                <option value="">Custom upload</option>
              )}
              {PIZZA_IMAGE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor={uploadId}>Upload own photo</label>
            <input
              id={uploadId}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => void handleImageUpload(event)}
            />
          </div>
        </div>

        <p className="field__hint">
          JPG, PNG, or WebP up to 8 MB. Photos are resized and optimized locally.
        </p>
        {processingImage && <p className="field__status">Optimizing photo…</p>}
        {uploadError && (
          <p className="field__error" role="alert">
            {uploadError}
          </p>
        )}
        {errors.image && (
          <p className="field__error" role="alert">
            {errors.image}
          </p>
        )}
      </fieldset>

      <div className="pizza-form__actions">
        <button
          className="button button--primary"
          type="submit"
          disabled={processingImage}
        >
          {processingImage ? "Preparing photo…" : submitLabel}
        </button>
        {onCancel && (
          <button className="button button--secondary" type="button" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
