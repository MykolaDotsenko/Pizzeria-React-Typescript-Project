import { useState, type FormEvent } from "react";
import demoPizzas from "../demoPizzas";
import {
  pizzaImageSchema,
  pizzaInputSchema,
  type PizzaImage,
  type PizzaInput,
} from "../models/Pizza";
import "./styles.css";

interface AddPizzaFormProps {
  addPizza: (newPizza: PizzaInput) => void;
}

interface PizzaFormState {
  title: string;
  price: string;
  img: PizzaImage;
}

type FormErrors = Partial<Record<keyof PizzaInput, string>>;

const initialState: PizzaFormState = {
  title: "",
  price: "",
  img: "pizza-1.jpg",
};

const AddPizzaForm = ({ addPizza }: AddPizzaFormProps) => {
  const [form, setForm] = useState<PizzaFormState>(initialState);
  const [errors, setErrors] = useState<FormErrors>({});

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsed = pizzaInputSchema.safeParse({
      title: form.title,
      price: Number(form.price),
      img: form.img,
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

    addPizza(parsed.data);
    setForm(initialState);
    setErrors({});
  };

  return (
    <form className="pizza-form" onSubmit={handleSubmit} noValidate>
      <div className="field">
        <label htmlFor="pizza-name">Pizza name</label>
        <input
          id="pizza-name"
          name="title"
          type="text"
          autoComplete="off"
          maxLength={80}
          required
          aria-invalid={Boolean(errors.title)}
          aria-describedby={errors.title ? "pizza-name-error" : undefined}
          value={form.title}
          onChange={(event) =>
            setForm((current) => ({ ...current, title: event.target.value }))
          }
        />
        {errors.title && (
          <p id="pizza-name-error" className="field-error" role="alert">
            {errors.title}
          </p>
        )}
      </div>

      <div className="field">
        <label htmlFor="pizza-price">Price (€)</label>
        <input
          id="pizza-price"
          name="price"
          type="number"
          min="0.01"
          max="1000"
          step="0.01"
          inputMode="decimal"
          required
          aria-invalid={Boolean(errors.price)}
          aria-describedby={errors.price ? "pizza-price-error" : undefined}
          value={form.price}
          onChange={(event) =>
            setForm((current) => ({ ...current, price: event.target.value }))
          }
        />
        {errors.price && (
          <p id="pizza-price-error" className="field-error" role="alert">
            {errors.price}
          </p>
        )}
      </div>

      <div className="field">
        <label htmlFor="pizza-image">Image</label>
        <select
          id="pizza-image"
          name="img"
          required
          value={form.img}
          onChange={(event) => {
            const parsedImage = pizzaImageSchema.safeParse(event.target.value);
            if (parsedImage.success) {
              setForm((current) => ({ ...current, img: parsedImage.data }));
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

      <button type="submit">+ Add pizza to menu</button>
    </form>
  );
};

export default AddPizzaForm;
