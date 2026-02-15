import { useEffect,  useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'



interface Inventory {
    id: number;
    title: string;
    description: string;
    category: string;
}

function App() {
    const [inventories,setInventories]= useState<Inventory[]>([]); // create a state variable to hold the warray of inventorieos
    
    useEffect(() => { // runs once when the component appears on the screen
        fetch('api/inventories')
            .then((response)=> response.json())
            .then((data) =>
            {
                setInventories(data); // takes the data from the database and puts it in the react state 
            })
            .catch((error) => console.error('Error fetching data:', error));

    }, []);
    return (
        <div className="container mt-5">
            <h1>My inventories</h1>
            {/* map though the array and render html for every item we find */}
            <div className="list-group mt-3">
                {inventories.map((inv) => (
            <div key={inv.id} className="list-group-item">
                <h5>{inv.title}</h5>
                <p>{inv.description}</p>
                <span className="badge bg-primary">{inv.category}</span>
            </div>
            ))}
            </div>
            {inventories.length === 0 && <p> No inventory found. Go add one in Swagger</p>}
            </div>
    );
}

export default App
