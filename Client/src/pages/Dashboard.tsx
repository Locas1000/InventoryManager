import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CreateInventoryModal from '../components/CreateInventoryModal'; // Import the new component
import { fetchWithAuth } from "../utils/api";

interface Inventory {
    id: number;
    title: string;
    description: string;
    category: string;
    customIdTemplate: string;
    imageUrl?: string | null;
}

export default function Dashboard() {
    const [inventories, setInventories] = useState<Inventory[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // New state to control the popup!
    const [showModal, setShowModal] = useState(false);

    // We moved the fetch logic into a function so we can call it again later
const fetchInventories = () => {
        // 1. Use fetchWithAuth instead of fetch
        fetchWithAuth('/api/inventories')
            .then(res => {
                // 2. Check if the response is OK before trying to parse JSON
                if (!res.ok) {
                    throw new Error(`Unauthorized or Server Error: ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                setInventories(data);
                setIsLoading(false); // Turn off spinner on success
            })
            .catch(err => {
                console.error("Error fetching data:", err);
                // 3. ALWAYS turn off the spinner, even if it fails!
                setIsLoading(false); 
            });
    };


    // Run the fetch on first load
    useEffect(() => {
        fetchInventories();
    }, []);

    if (isLoading) {
        return (
            <div className="container mt-5 text-center">
                <div className="spinner-border text-primary" role="status"></div>
            </div>
        );
    }

    return (
        <div className="container mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>📦 Inventory Dashboard</h1>
                {/* Changed from Link to Button */}
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    + New Inventory
                </button>
            </div>

            <div className="row g-4">
                {inventories.length === 0 ? (
                    <p className="text-muted">No inventories found. Click 'New Inventory' to start!</p>
                ) : (
                    inventories.map((inv) => (
                        <div key={inv.id} className="col-md-4">
                            <div className="card h-100 shadow-sm border-0 bg-light">
                                {inv.imageUrl && (
                                    <img
                                        src={inv.imageUrl}
                                        alt={inv.title}
                                        className="card-img-top object-fit-cover"
                                        style={{ height: '200px' }}
                                    />
                                )}
                                <div className="card-body">
                                    <div className="d-flex justify-content-between">
                                        <h5 className="card-title fw-bold">{inv.title}</h5>
                                        <span className="badge bg-secondary h-50">{inv.category}</span>
                                    </div>
                                    <p className="card-text text-muted mt-2">{inv.description}</p>
                                </div>
                                <div className="card-footer bg-transparent border-top-0">
                                    <small className="text-primary fw-semibold">
                                        Template: {inv.customIdTemplate || "Standard GUID"}
                                    </small>
                                    <Link to={`/inventory/${inv.id}`} className="btn btn-sm btn-outline-primary">
                                        View Items →
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Render the Modal here! */}
            <CreateInventoryModal
                show={showModal}
                onClose={() => setShowModal(false)}
                onSuccess={() => {
                    fetchInventories(); // Reload the list!
                    setShowModal(false);
                }}
            />
        </div>
    );
}