import { useState } from "react";
import { fetchWithAuth } from "../utils/api";
interface Props {
    show: boolean;         // Is the popup visible?
    onClose: () => void;   // Function to close the popup
    onSuccess: () => void; // Function to refresh the dashboard after saving
}

export default function CreateInventoryModal({ show, onClose, onSuccess }: Props) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("Equipment");
    const [customIdTemplate, setCustomIdTemplate] = useState("FIXED:ITEM-|DATE:yyyy-|SEQ");
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!show) return null; // If "show" is false, render nothing!

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const newInventory = { title, description, category, customIdTemplate };

        try {
            const response = await fetchWithAuth('/api/inventories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newInventory)
            });

            if (response.ok) {
                // Reset form and close modal
                setTitle("");
                setDescription("");
                onSuccess(); // <--- This tells the Dashboard to reload data!
                onClose();
            } else {
                alert("Failed to create inventory.");
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        // Bootstrap Modal Structure with manual "display: block"
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">🏗️ Build New Inventory</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        <form id="create-form" onSubmit={handleSubmit}>
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <label className="form-label fw-bold">Title</label>
                                    <input type="text" className="form-control" required
                                           value={title} onChange={e => setTitle(e.target.value)} />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label fw-bold">Category</label>
                                    <select className="form-select" value={category} onChange={e => setCategory(e.target.value)}>
                                        <option>Equipment</option>
                                        <option>Software Licenses</option>
                                        <option>Office Supplies</option>
                                        <option>Vehicles</option>
                                    </select>
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-bold">Description</label>
                                <textarea className="form-control" rows={3}
                                          value={description} onChange={e => setDescription(e.target.value)}></textarea>
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-bold">ID Template Rule</label>
                                <input type="text" className="form-control" required
                                       value={customIdTemplate} onChange={e => setCustomIdTemplate(e.target.value)} />
                                <small className="text-muted">Use <code>FIXED:text-</code>, <code>DATE:yyyy</code>, <code>SEQ</code></small>
                            </div>
                        </form>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        {/* We link the button to the form ID so it submits correctly */}
                        <button type="submit" form="create-form" className="btn btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? "Saving..." : "Save Inventory"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}