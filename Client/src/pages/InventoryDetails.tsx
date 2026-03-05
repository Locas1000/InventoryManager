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
    const [showAddItemModal, setShowAddItemModal] = useState(false);

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
        // Make sure we always show ID and Name first!
        const columns = [
            { key: 'customId', label: 'ID' },
            { key: 'name', label: 'Item Name' }
        ];

        // Strings
        if (inventory.string1Name) columns.push({ key: 'string1Value', label: inventory.string1Name });
        if (inventory.string2Name) columns.push({ key: 'string2Value', label: inventory.string2Name });
        if (inventory.string3Name) columns.push({ key: 'string3Value', label: inventory.string3Name });

        // Numbers
        if (inventory.number1Name) columns.push({ key: 'number1Value', label: inventory.number1Name });
        if (inventory.number2Name) columns.push({ key: 'number2Value', label: inventory.number2Name });
        if (inventory.number3Name) columns.push({ key: 'number3Value', label: inventory.number3Name });

        // Text Areas
        if (inventory.text1Name) columns.push({ key: 'text1Value', label: inventory.text1Name });
        if (inventory.text2Name) columns.push({ key: 'text2Value', label: inventory.text2Name });
        if (inventory.text3Name) columns.push({ key: 'text3Value', label: inventory.text3Name });

        // Booleans
        if (inventory.bool1Name) columns.push({ key: 'bool1Value', label: inventory.bool1Name });
        if (inventory.bool2Name) columns.push({ key: 'bool2Value', label: inventory.bool2Name });
        if (inventory.bool3Name) columns.push({ key: 'bool3Value', label: inventory.bool3Name });

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
                    onClick={() => setShowAddItemModal(true)}
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
                                    {/* 🟢 THE MISSING LOOP: We have to map the columns to generate the <td> cells! */}
                                    {columns.map(col => (
                                        <td key={col.key}>
                                            {col.key === 'customId' ? (
                                                <span className="fw-bold font-monospace text-primary">
                                                    {item.customId}
                                                </span>
                                            ) : typeof item[col.key] === 'boolean' ? (
                                                // Safely display checkboxes as Yes/No badges
                                                <span className={`badge ${item[col.key] ? 'bg-success' : 'bg-secondary'}`}>
                                                    {item[col.key] ? 'Yes' : 'No'}
                                                </span>
                                            ) : (
                                                // Safely render numbers and strings
                                                item[col.key] !== null && item[col.key] !== undefined && item[col.key] !== ""
                                                    ? String(item[col.key])
                                                    : "—"
                                            )}
                                        </td>
                                    ))}

                                    {/* The Delete Button stays inside the <tr> but outside the columns loop */}
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
                    show={showAddItemModal}
                    onClose={() => setShowAddItemModal(false)}
                    onSuccess={fetchInventory} // Your function that reloads the items list
                    inventory={inventory} // Pass the inventory object here!
                />            )}
        </div>
    );
}