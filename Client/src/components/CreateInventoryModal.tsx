import React, { useState } from "react";
import { fetchWithAuth } from "../utils/api";
import CustomIdBuilder from "./CustomIdBuilder";
import ImageUpload from "./ImageUpload";
import TagInput from "./TagInput";
interface Props {
    show: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function CreateInventoryModal({ show, onClose, onSuccess }: Props) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("Equipment");
    const [customIdTemplate, setCustomIdTemplate] = useState("FIXED:INV-|SEQ:D3");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [tags, setTags] = useState<string[]>([]);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    // 🟢 NEW: State for the 12 custom field names
    const [customFields, setCustomFields] = useState({
        string1Name: "", string2Name: "", string3Name: "",
        text1Name: "", text2Name: "", text3Name: "",
        number1Name: "", number2Name: "", number3Name: "",
        bool1Name: "", bool2Name: "", bool3Name: ""
    });

    if (!show) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // 🟢 NEW: Spread the customFields into the payload so they map to your DTO
        const newInventory = { 
            title, 
            description, 
            category, 
            customIdTemplate,
            imageUrl,
            ...customFields,
            tags
        };

        try {
            const response = await fetchWithAuth('https://inventorymanager-c0d3cbfwfxd9dwd8.canadacentral-01.azurewebsites.net/api/inventories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newInventory)
            });

            if (response.ok) {
                // Reset form
                setTitle("");
                setDescription("");
                setCategory("Equipment");
                setCustomIdTemplate("FIXED:INV-|SEQ:D3");
                setImageUrl(null);
                setCustomFields({
                    string1Name: "", string2Name: "", string3Name: "",
                    text1Name: "", text2Name: "", text3Name: "",
                    number1Name: "", number2Name: "", number3Name: "",
                    bool1Name: "", bool2Name: "", bool3Name: ""
                });
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

    // Helper to handle typing in the custom field grid
    const handleFieldChange = (field: string, value: string) => {
        setCustomFields(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)', overflowY: 'auto' }}>
            <div className="modal-dialog modal-xl">
                <div className="modal-content">
                    <div className="modal-header bg-light">
                        <h5 className="modal-title fw-bold">🏗️ Build New Inventory</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    
                    <div className="modal-body">
                        <form id="create-form" onSubmit={handleSubmit}>
                            {/* --- Basic Info --- */}
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
                                        <option>Other</option>
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Tags</label>
                                    <TagInput selectedTags={tags} onChange={setTags} />
                                    <div className="form-text">Press Enter after each tag.</div>
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-bold">Item Image (Optional)</label>

                                {imageUrl ? (
                                    <div className="position-relative mb-2" style={{ width: '150px' }}>
                                        <img src={imageUrl} alt="Preview" className="img-thumbnail" />
                                        <button type="button" className="btn btn-sm btn-danger position-absolute top-0 start-100 translate-middle" onClick={() => setImageUrl(null)}>X</button>
                                    </div>
                                ) : (
                                    <ImageUpload onUploadSuccess={(url) => setImageUrl(url)} />
                                )}
                            </div>
                            <div className="mb-4">
                                <label className="form-label fw-bold">Description</label>
                                <textarea className="form-control" rows={2}
                                          value={description} onChange={e => setDescription(e.target.value)}></textarea>
                            </div>

                            <hr />

                            {/* --- Custom ID Builder --- */}
                            <div className="mb-4">
                                <label className="form-label fw-bold fs-5">Custom ID Rules</label>
                                <p className="text-muted small mb-0">Define how items in this inventory will automatically generate their IDs.</p>
                                <CustomIdBuilder
                                    initialTemplate={customIdTemplate}
                                    onTemplateChange={(newVal) => setCustomIdTemplate(newVal)}
                                />
                            </div>

                            <hr />

                            {/* 🟢 NEW: Custom Fields Configuration Grid */}
                            <div className="mb-3">
                                <label className="form-label fw-bold fs-5">Custom Item Fields</label>
                                <p className="text-muted small mb-2">Leave blank if you don't need them. Naming a field activates it for this inventory.</p>
                                
                                <div className="row g-2">
                                    <div className="col-md-3">
                                        <h6 className="text-primary text-center border-bottom pb-1">Short Text</h6>
                                        <input type="text" className="form-control form-control-sm mb-1" placeholder="e.g., Serial Number" 
                                               value={customFields.string1Name} onChange={e => handleFieldChange('string1Name', e.target.value)} />
                                        <input type="text" className="form-control form-control-sm mb-1" placeholder="e.g., Color" 
                                               value={customFields.string2Name} onChange={e => handleFieldChange('string2Name', e.target.value)} />
                                        <input type="text" className="form-control form-control-sm" placeholder="Field 3 Name" 
                                               value={customFields.string3Name} onChange={e => handleFieldChange('string3Name', e.target.value)} />
                                    </div>

                                    <div className="col-md-3">
                                        <h6 className="text-primary text-center border-bottom pb-1">Numbers</h6>
                                        <input type="text" className="form-control form-control-sm mb-1" placeholder="e.g., Weight (kg)" 
                                               value={customFields.number1Name} onChange={e => handleFieldChange('number1Name', e.target.value)} />
                                        <input type="text" className="form-control form-control-sm mb-1" placeholder="e.g., Price" 
                                               value={customFields.number2Name} onChange={e => handleFieldChange('number2Name', e.target.value)} />
                                        <input type="text" className="form-control form-control-sm" placeholder="Field 3 Name" 
                                               value={customFields.number3Name} onChange={e => handleFieldChange('number3Name', e.target.value)} />
                                    </div>
                                    
                                    <div className="col-md-3">
                                        <h6 className="text-primary text-center border-bottom pb-1">Checkboxes</h6>
                                        <input type="text" className="form-control form-control-sm mb-1" placeholder="e.g., Is Fragile?" 
                                               value={customFields.bool1Name} onChange={e => handleFieldChange('bool1Name', e.target.value)} />
                                        <input type="text" className="form-control form-control-sm mb-1" placeholder="e.g., Needs Repair" 
                                               value={customFields.bool2Name} onChange={e => handleFieldChange('bool2Name', e.target.value)} />
                                        <input type="text" className="form-control form-control-sm" placeholder="Field 3 Name" 
                                               value={customFields.bool3Name} onChange={e => handleFieldChange('bool3Name', e.target.value)} />
                                    </div>

                                    <div className="col-md-3">
                                        <h6 className="text-primary text-center border-bottom pb-1">Long Text</h6>
                                        <input type="text" className="form-control form-control-sm mb-1" placeholder="e.g., Hardware Specs" 
                                               value={customFields.text1Name} onChange={e => handleFieldChange('text1Name', e.target.value)} />
                                        <input type="text" className="form-control form-control-sm mb-1" placeholder="e.g., Maintenance Notes" 
                                               value={customFields.text2Name} onChange={e => handleFieldChange('text2Name', e.target.value)} />
                                        <input type="text" className="form-control form-control-sm" placeholder="Field 3 Name" 
                                               value={customFields.text3Name} onChange={e => handleFieldChange('text3Name', e.target.value)} />
                                    </div>
                                </div>
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