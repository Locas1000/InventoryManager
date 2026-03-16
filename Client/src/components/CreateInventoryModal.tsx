import React, { useState } from "react";
import { fetchWithAuth } from "../utils/api";
import CustomIdBuilder from "./CustomIdBuilder";
import ImageUpload from "./ImageUpload";
import TagInput from "./TagInput";
import { useTranslation } from "react-i18next";

interface Props {
    show: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function CreateInventoryModal({ show, onClose, onSuccess }: Props) {
    const { t } = useTranslation();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("Equipment");
    const [customIdTemplate, setCustomIdTemplate] = useState("FIXED:INV-|SEQ:D3");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [tags, setTags] = useState<string[]>([]);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    
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
                setTags([]);
                setCustomFields({
                    string1Name: "", string2Name: "", string3Name: "",
                    text1Name: "", text2Name: "", text3Name: "",
                    number1Name: "", number2Name: "", number3Name: "",
                    bool1Name: "", bool2Name: "", bool3Name: ""
                });
                onSuccess();
                onClose();
            } else {
                alert(t('alert_fail_create_inv')); 
            }
        } catch (error) {
            console.error("Error:", error);
            alert(t('alert_fail_create_inv'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFieldChange = (field: string, value: string) => {
        setCustomFields(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)', overflowY: 'auto' }}>
            <div className="modal-dialog modal-xl">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title fw-bold">{t('modal_build_inv_title')}</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    
                    <div className="modal-body">
                        <form id="create-form" onSubmit={handleSubmit}>
                            {/* --- Basic Info --- */}
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <label className="form-label fw-bold">{t('label_title')}</label>
                                    <input type="text" className="form-control" required
                                           value={title} onChange={e => setTitle(e.target.value)} />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label fw-bold">{t('label_category')}</label>
                                    <select className="form-select" value={category} onChange={e => setCategory(e.target.value)}>
                                        <option value="Equipment">{t('cat_equipment')}</option>
                                        <option value="Software Licenses">{t('cat_software')}</option>
                                        <option value="Office Supplies">{t('cat_office')}</option>
                                        <option value="Vehicles">{t('cat_vehicles')}</option>
                                        <option value="Other">{t('cat_other')}</option>
                                    </select>
                                </div>
                                <div className="mb-3 mt-3">
                                    <label className="form-label fw-bold">{t('label_tags')}</label>
                                    <TagInput selectedTags={tags} onChange={setTags} />
                                    <div className="form-text">{t('tags_help_text')}</div>
                                </div>
                            </div>
                            <div className="mb-3">
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
                            <div className="mb-4">
                                <label className="form-label fw-bold">{t('label_description')}</label>
                                <textarea className="form-control" rows={2}
                                          value={description} onChange={e => setDescription(e.target.value)}></textarea>
                            </div>

                            <hr />

                            {/* --- Custom ID Builder --- */}
                            <div className="mb-4">
                                <label className="form-label fw-bold fs-5">{t('custom_id_rules')}</label>
                                <p className="text-muted small mb-0">{t('custom_id_help')}</p>
                                <CustomIdBuilder
                                    initialTemplate={customIdTemplate}
                                    onTemplateChange={(newVal) => setCustomIdTemplate(newVal)}
                                />
                            </div>

                            <hr />

                            {/* --- Custom Fields Configuration Grid --- */}
                            <div className="mb-3">
                                <label className="form-label fw-bold fs-5">{t('custom_item_fields')}</label>
                                <p className="text-muted small mb-2">{t('custom_fields_help_create')}</p>
                                
                                <div className="row g-2">
                                    <div className="col-md-3">
                                        <h6 className="text-primary text-center border-bottom pb-1">{t('fields_short_text')}</h6>
                                        <input type="text" className="form-control form-control-sm mb-1" placeholder={t('ph_serial_number')} 
                                               value={customFields.string1Name} onChange={e => handleFieldChange('string1Name', e.target.value)} />
                                        <input type="text" className="form-control form-control-sm mb-1" placeholder={t('ph_color')} 
                                               value={customFields.string2Name} onChange={e => handleFieldChange('string2Name', e.target.value)} />
                                        <input type="text" className="form-control form-control-sm" placeholder={t('ph_field_3')} 
                                               value={customFields.string3Name} onChange={e => handleFieldChange('string3Name', e.target.value)} />
                                    </div>

                                    <div className="col-md-3">
                                        <h6 className="text-primary text-center border-bottom pb-1">{t('fields_numbers')}</h6>
                                        <input type="text" className="form-control form-control-sm mb-1" placeholder={t('ph_weight')} 
                                               value={customFields.number1Name} onChange={e => handleFieldChange('number1Name', e.target.value)} />
                                        <input type="text" className="form-control form-control-sm mb-1" placeholder={t('ph_price')} 
                                               value={customFields.number2Name} onChange={e => handleFieldChange('number2Name', e.target.value)} />
                                        <input type="text" className="form-control form-control-sm" placeholder={t('ph_field_3')} 
                                               value={customFields.number3Name} onChange={e => handleFieldChange('number3Name', e.target.value)} />
                                    </div>
                                    
                                    <div className="col-md-3">
                                        <h6 className="text-primary text-center border-bottom pb-1">{t('fields_checkboxes')}</h6>
                                        <input type="text" className="form-control form-control-sm mb-1" placeholder={t('ph_fragile')} 
                                               value={customFields.bool1Name} onChange={e => handleFieldChange('bool1Name', e.target.value)} />
                                        <input type="text" className="form-control form-control-sm mb-1" placeholder={t('ph_repair')} 
                                               value={customFields.bool2Name} onChange={e => handleFieldChange('bool2Name', e.target.value)} />
                                        <input type="text" className="form-control form-control-sm" placeholder={t('ph_field_3')} 
                                               value={customFields.bool3Name} onChange={e => handleFieldChange('bool3Name', e.target.value)} />
                                    </div>

                                    <div className="col-md-3">
                                        <h6 className="text-primary text-center border-bottom pb-1">{t('fields_long_text')}</h6>
                                        <input type="text" className="form-control form-control-sm mb-1" placeholder={t('ph_hardware')} 
                                               value={customFields.text1Name} onChange={e => handleFieldChange('text1Name', e.target.value)} />
                                        <input type="text" className="form-control form-control-sm mb-1" placeholder={t('ph_maintenance')} 
                                               value={customFields.text2Name} onChange={e => handleFieldChange('text2Name', e.target.value)} />
                                        <input type="text" className="form-control form-control-sm" placeholder={t('ph_field_3')} 
                                               value={customFields.text3Name} onChange={e => handleFieldChange('text3Name', e.target.value)} />
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                    
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>{t('btn_cancel')}</button>
                        <button type="submit" form="create-form" className="btn btn-primary px-4" disabled={isSubmitting}>
                            {isSubmitting ? t('btn_saving') : t('btn_save_inventory')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}