import React, { FC} from 'react';
import SinglePizza from '../components/SinglePizza';
import Pizza from '../models/Pizza';

interface DisplayPizzasProps {
    pizzasList: Pizza[];
}   

const DisplayPizzas: FC<DisplayPizzasProps> = ({pizzasList}) => {
return (
    <div className = 'container'>
{pizzasList.map((pizza) => {
    return <SinglePizza key={pizza.id} pizza={pizza} />
})}
    </div>
)
}



export default DisplayPizzas;