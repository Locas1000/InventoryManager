import React, { useState } from "react";
import { fetchWithAuth } from "../utils/api";
import ImageUpload from "./ImageUpload";
import { useTranslation } from "react-i18next"; // 🟢 NEW

interface Props {
    show: boolean;
    onClose: () => void;
    onSuccess: () => void;
    inventory: any; // The parent inventory object containing our custom field names!
}

export default function AddItemModal({ show, onClose, onSuccess, inventory }: Props) {
    const { t } = useTranslation(); // 🟢 NEW
    const [name, setName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    
    // State for the actual data the user types in
    const [customValues, setCustomValues] = useState({
        string1Value: "", string2Value: "", string3Value: "",
        text1Value: "", text2Value: "", text3Value: "",
        number1Value: "", number2Value: "", number3Value: "",
        bool1Value: false, bool2Value: false, bool3Value: false
    });

    if (!show || !inventory) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Build the exact DTO the C# backend expects
        const newItem = {
            name,
            inventoryId: inventory.id,
            imageUrl,
            ...customValues,
            // Convert empty strings to null for numbers so the database doesn't complain
            number1Value: customValues.number1Value === "" ? null : Number(customValues.number1Value),
            number2Value: customValues.number2Value === "" ? null : Number(customValues.number2Value),
            number3Value: customValues.number3Value === "" ? null : Number(customValues.number3Value),
        };

        try {
            const response = await fetchWithAuth('https://inventorymanager-c0d3cbfwfxd9dwd8.canadacentral-01.azurewebsites.net/api/items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newItem)
            });

            if (response.ok) {
                // Reset form
                setName("");
                setCustomValues({
                    string1Value: "", string2Value: "", string3Value: "",
                    text1Value: "", text2Value: "", text3Value: "",
                    number1Value: "", number2Value: "", number3Value: "",
                    bool1Value: false, bool2Value: false, bool3Value: false
                });
                onSuccess();
                onClose();
            } else {
                const errorData = await response.json();
                alert(errorData.message || t('alert_fail_create_item')); // 🟢 TRANSLATED FALLBACK
            }
        } catch (error) {
            console.error("Error:", error);
            alert(t('alert_fail_create_item'));
        } finally {
            setIsSubmitting(false);
        }
    };

    // Helper for strings and numbers
    const handleValueChange = (field: string, value: string) => {
        setCustomValues(prev => ({ ...prev, [field]: value }));
    };

    // Helper specifically for checkboxes
    const handleCheckboxChange = (field: string, checked: boolean) => {
        setCustomValues(prev => ({ ...prev, [field]: checked }));
    };

    return (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)', overflowY: 'auto' }}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    {/* 🟢 Removed bg-light for Dark Mode compatibility */}
                    <div className="modal-header">
                        <h5 className="modal-title fw-bold">{t('add_item_to')} {inventory.title}</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    
                    <div className="modal-body">
                        <form id="add-item-form" onSubmit={handleSubmit}>
                            {/* --- STANDARD FIELDS --- */}
                            <div className="mb-4 border-bottom pb-3">
                                <label className="form-label fw-bold">{t('modal_add_item_name')} <span className="text-danger">*</span></label>
                                <input type="text" className="form-control" required
                                       value={name} onChange={e => setName(e.target.value)} 
                                       placeholder={t('placeholder_item_name')} />
                            </div>
                            <div className="mb-4 border-bottom pb-3">
                                <label className="form-label fw-bold">{t('modal_add_item_image')}</label>
                                {imageUrl ? (
                                    <div className="position-relative mb-2" style={{ width: '150px' }}>
                                        <img src={imageUrl} alt="Preview" className="img-thumbnail" />
                                        <button type="button" className="btn btn-sm btn-danger position-absolute top-0 start-100 translate-middle" onClick={() => setImageUrl(null)}>X</button>
                                    </div>
                                ) : (
                                    <ImageUpload onUploadSuccess={(url) => setImageUrl(url)} />
                                )}
                            </div>
                            {/* --- DYNAMIC CUSTOM FIELDS --- */}
                            <div className="row g-3">
                                {/* Strings */}
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

                                {/* Numbers */}
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

                                {/* Text Areas */}
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

                                {/* Booleans (Checkboxes) */}
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
                    
                    {/* 🟢 Removed bg-light */}
                    <div className="modal-footer mt-4">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>{t('btn_cancel')}</button>
                        <button type="submit" form="add-item-form" className="btn btn-success px-4" disabled={isSubmitting}>
                            {isSubmitting ? t('btn_creating_item') : t('btn_save_item')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}