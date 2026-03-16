import { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { fetchWithAuth } from '../utils/api';
import { useTranslation } from 'react-i18next'; 

interface Inventory {
    id: string;
    title: string;
    description: string;
    category: string;
    customIdTemplate: string;
}

interface EditInventoryModalProps {
    show: boolean;
    onClose: () => void;
    onSuccess: () => void;
    inventory: Inventory | null;
}

export default function EditInventoryModal({ show, onClose, onSuccess, inventory }: EditInventoryModalProps) {
    const { t } = useTranslation();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [customIdTemplate, setCustomIdTemplate] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false); 

    useEffect(() => {
        if (inventory) {
            setTitle(inventory.title ?? '');
            setDescription(inventory.description ?? '');
            setCategory(inventory.category ?? 'Equipment');
            setCustomIdTemplate(inventory.customIdTemplate ?? '');
        } else {
            setTitle('');
            setDescription('');
            setCategory('');
            setCustomIdTemplate('');
        }
    }, [inventory]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inventory) return;

        setIsSubmitting(true);
        try {
            const response = await fetchWithAuth(`https://inventorymanager-c0d3cbfwfxd9dwd8.canadacentral-01.azurewebsites.net/api/inventories/${inventory.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, description, category, customIdTemplate }),
            });

            if (response.ok) {
                onSuccess();
                onClose();
            } else {
                alert(t('alert_fail_update_inv'));
            }
        } catch (error) {
            console.error('Error updating inventory:', error);
            alert(t('alert_fail_update_inv'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal show={show} onHide={onClose} centered>
            <Modal.Header closeButton>
                <Modal.Title className="fw-bold">{t('edit_inventory_title')}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">{t('label_title')}</Form.Label>
                        <Form.Control
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">{t('label_description')}</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">{t('label_category')}</Form.Label>
                        <Form.Select value={category} onChange={(e) => setCategory(e.target.value)}>
                            <option value="Equipment">{t('cat_equipment')}</option>
                            <option value="Software Licenses">{t('cat_software')}</option>
                            <option value="Office Supplies">{t('cat_office')}</option>
                            <option value="Vehicles">{t('cat_vehicles')}</option>
                            <option value="Other">{t('cat_other')}</option>
                        </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-4">
                        <Form.Label className="fw-bold">{t('label_custom_id_template')}</Form.Label>
                        <Form.Control
                            type="text"
                            className="font-monospace"
                            value={customIdTemplate}
                            onChange={(e) => setCustomIdTemplate(e.target.value)}
                        />
                    </Form.Group>
                    <div className="d-grid">
                        <Button variant="primary" type="submit" disabled={isSubmitting}>
                            {isSubmitting ? t('btn_updating') : t('btn_save_changes')}
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
}