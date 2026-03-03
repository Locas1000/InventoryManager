import React, { useState } from "react";
import { fetchWithAuth } from "../utils/api";
import CustomIdBuilder from "./CustomIdBuilder"; // 🟢 IMPORT YOUR NEW COMPONENT

interface Props {
    show: boolean;         // Is the popup visible?
    onClose: () => void;   // Function to close the popup
    onSuccess: () => void; // Function to refresh the dashboard after saving
}

export default function CreateInventoryModal({ show, onClose, onSuccess }: Props) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("Equipment");
    // Only ONE state declaration for the template!
    const [customIdTemplate, setCustomIdTemplate] = useState("FIXED:INV-|SEQ:D3");
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!show) return null;

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
                setTitle("");
                setDescription("");
                setCategory("Equipment");
                setCustomIdTemplate("FIXED:INV-|SEQ:D3"); // Reset to default
                onSuccess();
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
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-xl"> {/* Changed to modal-xl for more drag-and-drop room */}
                <div className="modal-content">
                    <div className="modal-header bg-light">
                        <h5 className="modal-title fw-bold">🏗️ Build New Inventory</h5>
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
                            
                            <div className="mb-4">
                                <label className="form-label fw-bold">Description</label>
                                <textarea className="form-control" rows={2}
                                          value={description} onChange={e => setDescription(e.target.value)}></textarea>
                            </div>

                            <hr />

                            {/* 🟢 REPLACED THE OLD INPUT WITH YOUR DRAG-AND-DROP BUILDER */}
                            <div className="mb-3">
                                <label className="form-label fw-bold fs-5">Custom ID Rules</label>
                                <p className="text-muted small mb-0">Define how items in this inventory will automatically generate their IDs.</p>
                                
                                <CustomIdBuilder
                                    initialTemplate={customIdTemplate}
                                    onTemplateChange={(newVal) => setCustomIdTemplate(newVal)}
                                />
                            </div>
                        </form>
                    </div>
                    
                    <div className="modal-footer bg-light">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" form="create-form" className="btn btn-primary px-4" disabled={isSubmitting}>
                            {isSubmitting ? "Saving..." : "Save Inventory"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}