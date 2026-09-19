import { useState, type FormEvent } from "react";
import demoPizzas from "../demoPizzas";
import { pizzaInputSchema, type Pizza, type PizzaImage } from "../models/Pizza";

interface EditPizzaFormProps {
  data: Pizza;
  updatePizza: (newPizza: Pizza) => void;
  handleToggleEdit: () => void;
}

const EditPizzaForm = ({ data, updatePizza, handleToggleEdit }: EditPizzaFormProps) => {
  const [title, setTitle] = useState(data.title);
  const [price, setPrice] = useState(String(data.price));
  const [img, setImg] = useState<PizzaImage>(data.img);
  const [error, setError] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = pizzaInputSchema.safeParse({ title, price: Number(price), img });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check the form.");
      return;
    }

    updatePizza({ id: data.id, ...parsed.data });
    handleToggleEdit();
  };

  return (
    <form className="pizza-form edit-form" onSubmit={handleSubmit} noValidate>
      <div className="field">
        <label htmlFor={"edit-name-" + data.id}>Pizza name</label>
        <input id={"edit-name-" + data.id} type="text" maxLength={80} value={title}
          onChange={(event) => setTitle(event.target.value)} />
      </div>
      <div className="field">
        <label htmlFor={"edit-price-" + data.id}>Price (€)</label>
        <input id={"edit-price-" + data.id} type="number" min="0.01" max="1000" step="0.01"
          value={price} onChange={(event) => setPrice(event.target.value)} />
      </div>
      <div className="field">
        <label htmlFor={"edit-image-" + data.id}>Image</label>
        <select id={"edit-image-" + data.id} value={img}
          onChange={(event) => setImg(event.target.value as PizzaImage)}>
          {demoPizzas.map((pizza) => <option key={pizza.id} value={pizza.img}>{pizza.title}</option>)}
        </select>
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="form-actions">
        <button type="submit">Save changes</button>
        <button className="secondary-button" type="button" onClick={handleToggleEdit}>Cancel</button>
      </div>
    </form>
  );
};

export default EditPizzaForm;
