import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import InventoryDetails from './pages/InventoryDetails';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    // The Routes component looks at the URL and renders the matching page
    <Routes>
      <Route path="/" element={<Dashboard />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/inventory/:id" element={<InventoryDetails />} />
    </Routes>
  );
}

export default App;
