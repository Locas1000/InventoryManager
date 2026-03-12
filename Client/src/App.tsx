import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import InventoryDetails from './pages/InventoryDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import SearchResults from './pages/SearchResults';
import Navbar from './components/Navbar';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import PersonalPage from './pages/PersonalPage';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/Login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/profile" element={<PersonalPage/>}/>
          <Route path="/inventory/:id" element={<InventoryDetails />} />
          <Route path="/search" element={<SearchResults />} />
        </Route>

        <Route element={<ProtectedRoute requireAdmin={true} />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;