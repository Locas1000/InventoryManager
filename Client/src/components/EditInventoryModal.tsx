import { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { fetchWithAuth } from '../utils/api';

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
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [customIdTemplate, setCustomIdTemplate] = useState('');

    useEffect(() => {
        if (inventory) {
            setTitle(inventory.title ?? '');
            setDescription(inventory.description ?? '');
            setCategory(inventory.category ?? '');
            setCustomIdTemplate(inventory.customIdTemplate ?? '');
        } else {
            // Reset form when inventory is null to prevent stale data.
            setTitle('');
            setDescription('');
            setCategory('');
            setCustomIdTemplate('');
        }
    }, [inventory]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inventory) return;

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
                alert('Failed to update inventory.');
            }
        } catch (error) {
            console.error('Error updating inventory:', error);
        }
    };

    return (
        <Modal show={show} onHide={onClose}>
            <Modal.Header closeButton>
                <Modal.Title>Edit Inventory</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Title</Form.Label>
                        <Form.Control
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Category</Form.Label>
                        <Form.Control
                            type="text"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Custom ID Template</Form.Label>
                        <Form.Control
                            type="text"
                            value={customIdTemplate}
                            onChange={(e) => setCustomIdTemplate(e.target.value)}
                        />
                    </Form.Group>
                    <Button variant="primary" type="submit">
                        Save Changes
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
}