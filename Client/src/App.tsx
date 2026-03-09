import {  Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import InventoryDetails from './pages/InventoryDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import SearchResults from './pages/SearchResults';
import Navbar from './components/Navbar';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
      <>
        <Navbar />
      
    <Routes>
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/" element={<Dashboard />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/inventory/:id" element={<InventoryDetails />} />
        <Route path="search" element={<SearchResults/>}/>
    </Routes>
        </>
  );
}

export default App;
