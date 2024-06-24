import React, { FC, ChangeEvent, FormEvent, useState } from "react";
import Pizza from "../models/Pizza";
import demoPizzas from "../demoPizzas";
import "./styles.css";

interface EditPizzaFormProps {
  data: Pizza;
  updatePizza: (newPizza: Pizza) => void;
  handleToggleEdit: () => void;
}

const EditPizzaForm: FC<EditPizzaFormProps> = ({ data, updatePizza, handleToggleEdit }) => {
  const [editPizza, setEditPizza] = useState<Pizza>(data);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setEditPizza({
      ...editPizza,
      [name]: value,
    });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { title, price, img } = editPizza;

    if (title && price && img) {
      updatePizza(editPizza);
      handleToggleEdit();
    }
  };

  return (
    <form className="edit-form" onSubmit={handleSubmit}>
      <input
        name="title"
        type="text"
        placeholder="Name"
        onChange={handleChange}
        value={editPizza.title}
      />
      <input
        name="price"
        type="text"
        placeholder="Price"
        onChange={handleChange}
        value={editPizza.price}
      />
      <select name="img" onChange={handleChange} value={editPizza.img}>
        {demoPizzas.map((pizza) => (
          <option key={pizza.id} value={pizza.img}>
            {pizza.title}
          </option>
        ))}
      </select>
      <button type="submit">Submit</button>
    </form>
  );
};

export default EditPizzaForm;
