import { useState, useEffect, useCallback } from 'react'; // 🟢 Added useCallback
import { Link } from 'react-router-dom';
import CreateInventoryModal from '../components/CreateInventoryModal';
import { fetchWithAuth } from "../utils/api";
import TagCloud from "../components/TagCloud"; // 🟢 Fixed typo (TagCloud)

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
    
    // 🟢 NEW: State to control the selected tag
    const [selectedTag, setSelectedTag] = useState<string | null>(null);

    // We moved the fetch logic into a function so we can call it again later
    const fetchInventories = useCallback(() => {
        setIsLoading(true); // Optional: shows spinner when filtering
        let url = 'https://inventorymanager-c0d3cbfwfxd9dwd8.canadacentral-01.azurewebsites.net/api/inventories';
        if (selectedTag) {
            url += `?tag=${encodeURIComponent(selectedTag)}`;
        }

        fetch(url)
            .then(res => res.json())
            .then(data => {
                setInventories(data);
                setIsLoading(false);
            })
            .catch(err => {
                console.error(err);
                setIsLoading(false);
            });
    }, [selectedTag]);

    useEffect(() => {
        fetchInventories();
    }, [fetchInventories]);

    if (isLoading && inventories.length === 0) {
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
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    + New Inventory
                </button>
            </div>

            {/* 🟢 EXACT PLACEMENT: Right above your inventory grid */}
            <TagCloud 
                selectedTag={selectedTag} 
                onSelectTag={setSelectedTag} 
            />

            <div className="row g-4">
                {inventories.length === 0 ? (
                    <p className="text-muted">No inventories found. Click 'New Inventory' to start!</p>
                ) : (
                    // I wrapped your col-md-4 card logic in a React Fragment so the map works cleanly
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
                                    <small className="text-primary fw-semibold d-block mb-2">
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