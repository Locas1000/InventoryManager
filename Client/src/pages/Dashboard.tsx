import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import CreateInventoryModal from '../components/CreateInventoryModal';
import EditInventoryModal from '../components/EditInventoryModal';
import { fetchWithAuth } from "../utils/api";
import TagCloud from "../components/TagCloud";

interface Inventory {
    id: number;
    title: string;
    description: string;
    category: string;
    customIdTemplate: string;
    imageUrl?: string | null;
    userId: number;
}

export default function Dashboard() {
    const [inventories, setInventories] = useState<Inventory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedInventory, setSelectedInventory] = useState<Inventory | null>(null);
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [openDropdown, setOpenDropdown] = useState<number | null>(null);
    const userString = localStorage.getItem('user');
    const currentUser = userString ? JSON.parse(userString) : null;

    const fetchInventories = useCallback(() => {
        setIsLoading(true);
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

    const handleDelete = async (inventoryId: number) => {
        if (window.confirm("Are you sure you want to delete this inventory?")) {
            try {
                const response = await fetchWithAuth(`https://inventorymanager-c0d3cbfwfxd9dwd8.canadacentral-01.azurewebsites.net/api/inventories/${inventoryId}`, {
                    method: 'DELETE',
                });
                if (response.ok) {
                    fetchInventories();
                } else {
                    alert("Failed to delete inventory.");
                }
            } catch (error) {
                console.error("Error deleting inventory:", error);
            }
        }
    };

    const handleEdit = (inventory: Inventory) => {
        setSelectedInventory(inventory);
        setShowEditModal(true);
    };

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
                <h1> Inventory Dashboard</h1>
                <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                    + New Inventory
                </button>
            </div>

            <TagCloud 
                selectedTag={selectedTag} 
                onSelectTag={setSelectedTag} 
            />

            <div className="row g-4">
                {inventories.length === 0 ? (
                    <p className="text-muted">No inventories found. Click 'New Inventory' to start!</p>
                ) : (
                    inventories.map((inv) => (
                        <div key={inv.id} className="col-md-4">
                            <div className="card h-100 shadow-sm border-0 bg-light position-relative">
                                {(currentUser?.id === inv.userId || currentUser?.role === 'Admin') && (
                                    <div className="position-absolute top-0 end-0 p-2">
                                        <div className="dropdown">
                                            <button className="btn btn-sm btn-light" type="button" onClick={() => setOpenDropdown(openDropdown === inv.id ? null : inv.id)}>
                                                <i className="bi bi-gear-fill"></i>
                                            </button>
                                            {openDropdown === inv.id && (
                                                <ul className="dropdown-menu show">
                                                    <li><button className="dropdown-item" onClick={() => handleEdit(inv)}>Edit</button></li>
                                                    <li><button className="dropdown-item" onClick={() => handleDelete(inv.id)}>Delete</button></li>
                                                </ul>
                                            )}
                                        </div>
                                    </div>
                                )}
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
                show={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={() => {
                    fetchInventories();
                    setShowCreateModal(false);
                }}
            />

            {selectedInventory && (
                <EditInventoryModal
                    show={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    onSuccess={() => {
                        fetchInventories();
                        setShowEditModal(false);
                    }}
                    inventory={selectedInventory}
                />
            )}
        </div>
    );
}