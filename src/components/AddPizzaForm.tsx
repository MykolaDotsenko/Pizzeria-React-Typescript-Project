import { useState, type FormEvent } from "react";
import demoPizzas from "../demoPizzas";
import { pizzaInputSchema, type PizzaImage, type PizzaInput } from "../models/Pizza";
import "./styles.css";

interface AddPizzaFormProps {
  addPizza: (newPizza: PizzaInput) => void;
}

interface PizzaFormState {
  title: string;
  price: string;
  img: PizzaImage;
}

const initialState: PizzaFormState = { title: "", price: "", img: "pizza-1.jpg" };

const AddPizzaForm = ({ addPizza }: AddPizzaFormProps) => {
  const [form, setForm] = useState<PizzaFormState>(initialState);
  const [error, setError] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsed = pizzaInputSchema.safeParse({
      title: form.title,
      price: Number(form.price),
      img: form.img,
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check the form.");
      return;
    }

    addPizza(parsed.data);
    setForm(initialState);
    setError("");
  };

  return (
    <form className="pizza-form" onSubmit={handleSubmit} noValidate>
      <div className="field">
        <label htmlFor="pizza-name">Pizza name</label>
        <input id="pizza-name" name="title" type="text" autoComplete="off" maxLength={80}
          value={form.title}
          onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
      </div>

      <div className="field">
        <label htmlFor="pizza-price">Price (€)</label>
        <input id="pizza-price" name="price" type="number" min="0.01" max="1000" step="0.01"
          inputMode="decimal" value={form.price}
          onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))} />
      </div>

      <div className="field">
        <label htmlFor="pizza-image">Image</label>
        <select id="pizza-image" name="img" value={form.img}
          onChange={(event) => setForm((current) => ({ ...current, img: event.target.value as PizzaImage }))}>
          {demoPizzas.map((pizza) => <option key={pizza.id} value={pizza.img}>{pizza.title}</option>)}
        </select>
      </div>

      {error && <p className="form-error" role="alert">{error}</p>}
      <button type="submit">+ Add pizza to menu</button>
    </form>
  );
};

export default AddPizzaForm;
