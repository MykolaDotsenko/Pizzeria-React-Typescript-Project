import React, { FC, ChangeEvent, FormEvent, useState } from "react";
import Pizza from "../models/Pizza";
import demoPizzas from "../demoPizzas";
import "./styles.css";

interface AddPizzaFormProps {
  addPizza: (newPizza: Pizza) => void;
}

const initState = {
  title: "",
  price: "",
  img: demoPizzas[0].img,
};

const AddPizzaForm: FC<AddPizzaFormProps> = ({ addPizza }) => {
  const [newPizza, setNewPizza] = useState<{
    title: string;
    price: string;
    img: string;
  }>(initState);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setNewPizza({
      ...newPizza,
      [name]: value,
    });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { title, price, img } = newPizza;

    if (title && price && img) {
      addPizza({
        title,
        img,
        price: Number(price),
        id: Date.now(),
      });
      setNewPizza(initState);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="title"
        type="text"
        placeholder="Name"
        onChange={handleChange}
        value={newPizza.title}
      />
      <input
        name="price"
        type="text"
        placeholder="Price"
        onChange={handleChange}
        value={newPizza.price}
      />
      <select name="img" onChange={handleChange} value={newPizza.img}>
        {demoPizzas.map((pizza) => (
          <option key={pizza.id} value={pizza.img}>
            {pizza.title}
          </option>
        ))}
      </select>
      <button type="submit">+ Add Pizza to menu</button>
    </form>
  );
};

export default AddPizzaForm;
