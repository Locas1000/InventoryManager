import { useState } from "react";
import { fetchWithAuth } from "../utils/api";

interface Props {
    show: boolean;
    inventoryId: number;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AddItemModal({ show, inventoryId, onClose, onSuccess }: Props) {
    const [string1, setString1] = useState("");
    const [string2, setString2] = useState("");
    const [number1, setNumber1] = useState<number | "">("");
    const [isLoading, setIsLoading] = useState(false);
    
    // 1. ADDED: Missing error state to prevent crashes in the catch block
    const [error, setError] = useState<string | null>(null);

    if (!show) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetchWithAuth('/api/items', {
                method: 'POST',
                body: JSON.stringify({
                    inventoryId: inventoryId,
                    // 2. FIXED: Changed from field1/field2/field3 to string1/string2/number1
                    string1Value: string1, 
                    string2Value: string2,
                    number1Value: number1 === "" ? null : Number(number1)
                })
            });

            if (!response.ok){
                throw new Error("Failed to create item");
            }
            
            onSuccess();
            onClose();
            
        } catch (err: any) {
            setError(err.message);
            alert("Error adding item");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">➕ Add New Item</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        {/* Display error if there is one */}
                        {error && <div className="alert alert-danger py-2">{error}</div>}
                        
                        <form id="add-item-form" onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label">Field 1 (Text)</label>
                                <input type="text" className="form-control" placeholder="e.g. Dell XPS"
                                       value={string1} onChange={e => setString1(e.target.value)} />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Field 2 (Text)</label>
                                <input type="text" className="form-control" placeholder="e.g. Mint Condition"
                                       value={string2} onChange={e => setString2(e.target.value)} />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Field 3 (Number)</label>
                                <input type="number" className="form-control" placeholder="e.g. 32 (GB RAM)"
                                       value={number1} onChange={e => setNumber1(Number(e.target.value))} />
                            </div>
                        </form>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        
                        {/* 3. FIXED: Added form="add-item-form" so it can trigger the submit event! */}
                        <button type="submit" form="add-item-form" className="btn btn-primary" disabled={isLoading}>
                            {isLoading ? "Adding..." : "Add Item"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
