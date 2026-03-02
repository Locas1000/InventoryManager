import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import AddItemModal from "../components/AddItemModal";
import { fetchWithAuth } from "../utils/api"; 
// 1. Interface definitions (Same as before)
interface Item {
    id: number;
    customId: string;
    [key: string]: string | number | null;
    string1Value: string | null;
    string2Value: string | null;
    string3Value: string | null;
    number1Value: number | null;
}

interface Inventory {
    id: number;
    title: string;
    description: string;
    category: string;
    customIdTemplate: string;
    string1Name: string | null;
    string2Name: string | null;
    string3Name: string | null;
    number1Name: string | null;
    items: Item[];
}

export default function InventoryDetails() {
    const { id } = useParams();
    const [inventory, setInventory] = useState<Inventory | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const fetchInventory = useCallback(() => {
        fetchWithAuth(`/api/inventories/${id}`)
            .then(res => {
                if (!res.ok) throw new Error("Inventory not found");
                return res.json();
            })
            .then(data => {
                setInventory(data);
                setIsLoading(false);
            })
            .catch(err => {
                console.error(err);
                setIsLoading(false);
            });
    }, [id]);

    useEffect(() => {
        fetchInventory();
    }, [fetchInventory]);

    // 2. NEW: Delete Handler
    const handleDelete = async (itemId: number) => {
        // Simple confirmation before deleting
        if (!window.confirm("Are you sure you want to delete this item?")) return;

        try {
            const response = await fetch(`/api/items/${itemId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                // Refresh the list to show the item is gone
                fetchInventory();
            } else {
                alert("Failed to delete item.");
            }
        } catch (error) {
            console.error("Error deleting item:", error);
            alert("An error occurred.");
        }
    };

    // Helper for dynamic columns
    const getDynamicColumns = () => {
        if (!inventory) return [];
        const columns = [{ key: 'customId', label: 'ID' }];
        if (inventory.string1Name) columns.push({ key: 'string1Value', label: inventory.string1Name });
        if (inventory.string2Name) columns.push({ key: 'string2Value', label: inventory.string2Name });
        if (inventory.string3Name) columns.push({ key: 'string3Value', label: inventory.string3Name });
        if (inventory.number1Name) columns.push({ key: 'number1Value', label: inventory.number1Name });
        return columns;
    };

    if (isLoading) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;
    if (!inventory) return <div className="text-center mt-5"><h3>Inventory not found!</h3><Link to="/">Go Home</Link></div>;

    const columns = getDynamicColumns();

    return (
        <div className="container mt-5">
            <div className="d-flex justify-content-between align-items-start mb-4">
                <div>
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb mb-1">
                            <li className="breadcrumb-item"><Link to="/">Dashboard</Link></li>
                            <li className="breadcrumb-item active" aria-current="page">{inventory.title}</li>
                        </ol>
                    </nav>
                    <h1 className="display-6 fw-bold">{inventory.title}</h1>
                    <span className="badge bg-secondary me-2">{inventory.category}</span>
                    <p className="text-muted mt-2">{inventory.description}</p>
                </div>

                <button
                    className="btn btn-primary btn-lg"
                    onClick={() => setShowModal(true)}
                >
                    + Add New Item
                </button>
            </div>

            <div className="card shadow-sm border-0">
                <div className="card-body p-0">
                    <table className="table table-hover mb-0">
                        <thead className="table-light">
                        <tr>
                            {columns.map(col => (
                                <th key={col.key}>{col.label}</th>
                            ))}
                            <th className="text-end">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {inventory.items.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length + 1} className="text-center py-5 text-muted">
                                    <h4>📭 This inventory is empty</h4>
                                    <p>Click the blue button to add your first item!</p>
                                </td>
                            </tr>
                        ) : (
                            inventory.items.map(item => (
                                <tr key={item.id}>
                                    {columns.map(col => (
                                        <td key={col.key}>
                                            {col.key === 'customId' ? (
                                                <span className="fw-bold font-monospace text-primary">
                                                    {item.customId}
                                                </span>
                                            ) : (
                                                item[col.key] || "—"
                                            )}
                                        </td>
                                    ))}

                                    {/* 3. WIRED UP: Delete Button */}
                                    <td className="text-end">
                                        <button
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => handleDelete(item.id)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            {inventory && (
                <AddItemModal
                    show={showModal}
                    inventoryId={inventory.id}
                    onClose={() => setShowModal(false)}
                    onSuccess={() => {
                        fetchInventory();
                    }}
                />
            )}
        </div>
    );
}