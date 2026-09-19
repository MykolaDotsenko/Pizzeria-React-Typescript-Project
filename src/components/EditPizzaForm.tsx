import { useState, type FormEvent } from "react";
import demoPizzas from "../demoPizzas";
import {
  pizzaImageSchema,
  pizzaInputSchema,
  type Pizza,
  type PizzaImage,
  type PizzaInput,
} from "../models/Pizza";

interface EditPizzaFormProps {
  data: Pizza;
  formId: string;
  updatePizza: (newPizza: Pizza) => void;
  handleToggleEdit: () => void;
}

type FormErrors = Partial<Record<keyof PizzaInput, string>>;

const EditPizzaForm = ({
  data,
  formId,
  updatePizza,
  handleToggleEdit,
}: EditPizzaFormProps) => {
  const [title, setTitle] = useState(data.title);
  const [price, setPrice] = useState(String(data.price));
  const [img, setImg] = useState<PizzaImage>(data.img);
  const [errors, setErrors] = useState<FormErrors>({});

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsed = pizzaInputSchema.safeParse({
      title,
      price: Number(price),
      img,
    });

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      setErrors({
        title: fieldErrors.title?.[0],
        price: fieldErrors.price?.[0],
        img: fieldErrors.img?.[0],
      });
      return;
    }

    updatePizza({ id: data.id, ...parsed.data });
    setErrors({});
    handleToggleEdit();
  };

  const nameId = "edit-name-" + data.id;
  const priceId = "edit-price-" + data.id;

  return (
    <form
      id={formId}
      className="pizza-form edit-form"
      onSubmit={handleSubmit}
      noValidate
    >
      <div className="field">
        <label htmlFor={nameId}>Pizza name</label>
        <input
          id={nameId}
          type="text"
          maxLength={80}
          required
          aria-invalid={Boolean(errors.title)}
          aria-describedby={errors.title ? nameId + "-error" : undefined}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        {errors.title && (
          <p id={nameId + "-error"} className="field-error" role="alert">
            {errors.title}
          </p>
        )}
      </div>

      <div className="field">
        <label htmlFor={priceId}>Price (€)</label>
        <input
          id={priceId}
          type="number"
          min="0.01"
          max="1000"
          step="0.01"
          inputMode="decimal"
          required
          aria-invalid={Boolean(errors.price)}
          aria-describedby={errors.price ? priceId + "-error" : undefined}
          value={price}
          onChange={(event) => setPrice(event.target.value)}
        />
        {errors.price && (
          <p id={priceId + "-error"} className="field-error" role="alert">
            {errors.price}
          </p>
        )}
      </div>

      <div className="field">
        <label htmlFor={"edit-image-" + data.id}>Image</label>
        <select
          id={"edit-image-" + data.id}
          required
          value={img}
          onChange={(event) => {
            const parsedImage = pizzaImageSchema.safeParse(event.target.value);
            if (parsedImage.success) {
              setImg(parsedImage.data);
            }
          }}
        >
          {demoPizzas.map((pizza) => (
            <option key={pizza.id} value={pizza.img}>
              {pizza.title}
            </option>
          ))}
        </select>
      </div>

      <div className="form-actions">
        <button type="submit">Save changes</button>
        <button
          className="secondary-button"
          type="button"
          onClick={handleToggleEdit}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default EditPizzaForm;
