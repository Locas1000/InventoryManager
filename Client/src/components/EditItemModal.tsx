import React, { useState, useEffect } from "react";
import { fetchWithAuth } from "../utils/api";

interface Props {
    show: boolean;
    onClose: () => void;
    onSuccess: () => void;
    inventory: any;
    item: any; // The existing item data to pre-fill the form
}

export default function EditItemModal({ show, onClose, onSuccess, inventory, item }: Props) {
    const [name, setName] = useState("");
    const [customId, setCustomId] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [customValues, setCustomValues] = useState({
        string1Value: "", string2Value: "", string3Value: "",
        text1Value: "", text2Value: "", text3Value: "",
        number1Value: "", number2Value: "", number3Value: "",
        bool1Value: false, bool2Value: false, bool3Value: false
    });

    // 🟢 Pre-fill the form when the modal opens with a specific item
    useEffect(() => {
        if (item) {
            setName(item.name || "");
            setCustomId(item.customId || "");
            setCustomValues({
                string1Value: item.string1Value || "",
                string2Value: item.string2Value || "",
                string3Value: item.string3Value || "",
                text1Value: item.text1Value || "",
                text2Value: item.text2Value || "",
                text3Value: item.text3Value || "",
                number1Value: item.number1Value ?? "",
                number2Value: item.number2Value ?? "",
                number3Value: item.number3Value ?? "",
                bool1Value: !!item.bool1Value,
                bool2Value: !!item.bool2Value,
                bool3Value: !!item.bool3Value
            });
        }
    }, [item, show]);

    if (!show || !inventory || !item) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const updatedItem = {
            name,
            customId, // Custom IDs are editable in the item form [cite: 95]
            ...customValues,
            number1Value: customValues.number1Value === "" ? null : Number(customValues.number1Value),
            number2Value: customValues.number2Value === "" ? null : Number(customValues.number2Value),
            number3Value: customValues.number3Value === "" ? null : Number(customValues.number3Value),
        };

        try {
            const response = await fetchWithAuth(`inventorymanager-c0d3cbfwfxd9dwd8.canadacentral-01.azurewebsites.net/api/items/${item.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedItem)
            });

            if (response.ok) {
                onSuccess();
                onClose();
            } else {
                const errorData = await response.json();
                alert(errorData.message || "Failed to update item.");
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleValueChange = (field: string, value: string) => {
        setCustomValues(prev => ({ ...prev, [field]: value }));
    };

    const handleCheckboxChange = (field: string, checked: boolean) => {
        setCustomValues(prev => ({ ...prev, [field]: checked }));
    };

    return (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)', overflowY: 'auto' }}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header bg-warning-subtle">
                        <h5 className="modal-title fw-bold">✏️ Edit Item: {item.name}</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>

                    <div className="modal-body">
                        <form id="edit-item-form" onSubmit={handleSubmit}>
                            <div className="row g-3">
                                {/* 1. Strings */}
                                {inventory.string1Name && (
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold">{inventory.string1Name}</label>
                                        <input type="text" className="form-control"
                                               value={customValues.string1Value} onChange={e => handleValueChange('string1Value', e.target.value)} />
                                    </div>
                                )}
                                {inventory.string2Name && (
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold">{inventory.string2Name}</label>
                                        <input type="text" className="form-control"
                                               value={customValues.string2Value} onChange={e => handleValueChange('string2Value', e.target.value)} />
                                    </div>
                                )}
                                {inventory.string3Name && (
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold">{inventory.string3Name}</label>
                                        <input type="text" className="form-control"
                                               value={customValues.string3Value} onChange={e => handleValueChange('string3Value', e.target.value)} />
                                    </div>
                                )}

                                {/* 2. Numbers */}
                                {inventory.number1Name && (
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold">{inventory.number1Name}</label>
                                        <input type="number" step="any" className="form-control"
                                               value={customValues.number1Value} onChange={e => handleValueChange('number1Value', e.target.value)} />
                                    </div>
                                )}
                                {inventory.number2Name && (
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold">{inventory.number2Name}</label>
                                        <input type="number" step="any" className="form-control"
                                               value={customValues.number2Value} onChange={e => handleValueChange('number2Value', e.target.value)} />
                                    </div>
                                )}
                                {inventory.number3Name && (
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold">{inventory.number3Name}</label>
                                        <input type="number" step="any" className="form-control"
                                               value={customValues.number3Value} onChange={e => handleValueChange('number3Value', e.target.value)} />
                                    </div>
                                )}

                                {/* 3. Text Areas */}
                                {inventory.text1Name && (
                                    <div className="col-12">
                                        <label className="form-label fw-bold">{inventory.text1Name}</label>
                                        <textarea className="form-control" rows={2}
                                                  value={customValues.text1Value} onChange={e => handleValueChange('text1Value', e.target.value)}></textarea>
                                    </div>
                                )}
                                {inventory.text2Name && (
                                    <div className="col-12">
                                        <label className="form-label fw-bold">{inventory.text2Name}</label>
                                        <textarea className="form-control" rows={2}
                                                  value={customValues.text2Value} onChange={e => handleValueChange('text2Value', e.target.value)}></textarea>
                                    </div>
                                )}
                                {inventory.text3Name && (
                                    <div className="col-12">
                                        <label className="form-label fw-bold">{inventory.text3Name}</label>
                                        <textarea className="form-control" rows={2}
                                                  value={customValues.text3Value} onChange={e => handleValueChange('text3Value', e.target.value)}></textarea>
                                    </div>
                                )}

                                {/* 4. Booleans (Checkboxes) */}
                                {inventory.bool1Name && (
                                    <div className="col-md-4 mt-4">
                                        <div className="form-check form-switch fs-5">
                                            <input className="form-check-input" type="checkbox" role="switch"
                                                   checked={customValues.bool1Value} onChange={e => handleCheckboxChange('bool1Value', e.target.checked)} />
                                            <label className="form-check-label ms-2">{inventory.bool1Name}</label>
                                        </div>
                                    </div>
                                )}
                                {inventory.bool2Name && (
                                    <div className="col-md-4 mt-4">
                                        <div className="form-check form-switch fs-5">
                                            <input className="form-check-input" type="checkbox" role="switch"
                                                   checked={customValues.bool2Value} onChange={e => handleCheckboxChange('bool2Value', e.target.checked)} />
                                            <label className="form-check-label ms-2">{inventory.bool2Name}</label>
                                        </div>
                                    </div>
                                )}
                                {inventory.bool3Name && (
                                    <div className="col-md-4 mt-4">
                                        <div className="form-check form-switch fs-5">
                                            <input className="form-check-input" type="checkbox" role="switch"
                                                   checked={customValues.bool3Value} onChange={e => handleCheckboxChange('bool3Value', e.target.checked)} />
                                            <label className="form-check-label ms-2">{inventory.bool3Name}</label>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </form>
                    </div>

                    <div className="modal-footer bg-light">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" form="edit-item-form" className="btn btn-warning px-4" disabled={isSubmitting}>
                            {isSubmitting ? "Saving..." : "Update Item"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}