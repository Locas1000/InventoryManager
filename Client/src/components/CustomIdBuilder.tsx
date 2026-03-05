import React, { useState, useEffect, useRef} from 'react';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';

const AVAILABLE_ELEMENTS = [
    { id: 'fixed', label: 'Fixed Text', type: 'FIXED:', defaultVal: 'INV-' },
    { id: 'date', label: 'Date/Time', type: 'DATE:', defaultVal: 'yyyyMMdd' },
    { id: 'seq', label: 'Sequence', type: 'SEQ:', defaultVal: 'D3' },
    { id: 'rnd6', label: 'Random (6-Digit)', type: 'RND6', defaultVal: '' },
    { id: 'rnd9', label: 'Random (9-Digit)', type: 'RND9', defaultVal: '' },
    { id: 'rnd20', label: 'Random (20-bit)', type: 'RND20BIT', defaultVal: '' },
    { id: 'rnd32', label: 'Random (32-bit)', type: 'RND32BIT', defaultVal: '' },
    { id: 'guid', label: 'GUID', type: 'GUID', defaultVal: '' }
];

interface CustomIdBuilderProps {
    initialTemplate: string;
    onTemplateChange: (template: string) => void;
}

export default function CustomIdBuilder({ initialTemplate, onTemplateChange }: CustomIdBuilderProps) {
    const [activeBlocks, setActiveBlocks] = useState<any[]>([]);
    
    const isInternalUpdate = useRef(false);
    
    useEffect(() => {
        if (!initialTemplate) return;
        if (isInternalUpdate.current) {
            isInternalUpdate.current = false;
            return;
        }
        const tokens = initialTemplate.split('|');
        const loadedBlocks = tokens.map((token, index) => {
            const el = AVAILABLE_ELEMENTS.find(e => token.startsWith(e.type) || token === e.type);
            if (!el) return null;
            
            let val = el.defaultVal;
            if (token.includes(':')) {
                val = token.split(':')[1];
            }
            return { ...el, uniqueId: `block-${index}-${Date.now()}`, currentValue: val };
        }).filter(b => b !== null);
        
        setActiveBlocks(loadedBlocks);
    }, [initialTemplate]);

    const updateParent = (blocks: any[]) => {
        const templateString = blocks.map(b => {
            if (b.id === 'fixed' || b.id === 'date' || b.id === 'seq') {
                return `${b.type}${b.currentValue}`;
            }
            return b.type;
        }).join('|');
        isInternalUpdate.current = true;
        onTemplateChange(templateString);
    };

    // 🟢 NEW: Handle typing inside the blocks
    const handleValueChange = (uniqueId: string, newValue: string) => {
        const newBlocks = activeBlocks.map(b => 
            b.uniqueId === uniqueId ? { ...b, currentValue: newValue } : b
        );
        setActiveBlocks(newBlocks);
        updateParent(newBlocks);
    };

    const onDragEnd = (result: DropResult) => {
        const { source, destination } = result;

        if (!destination) {
            // Remove elements by dragging them outside the form
            if (source.droppableId === 'active-zone') {
                const newBlocks = Array.from(activeBlocks);
                newBlocks.splice(source.index, 1);
                setActiveBlocks(newBlocks);
                updateParent(newBlocks);
            }
            return;
        }

        if (source.droppableId === 'active-zone' && destination.droppableId === 'active-zone') {
            // Reorder ID elements via drag-and-drop
            const newBlocks = Array.from(activeBlocks);
            const [reorderedItem] = newBlocks.splice(source.index, 1);
            newBlocks.splice(destination.index, 0, reorderedItem);
            setActiveBlocks(newBlocks);
            updateParent(newBlocks);
        }

        if (source.droppableId === 'pool-zone' && destination.droppableId === 'active-zone') {
            // Add new elements
            const itemToAdd = AVAILABLE_ELEMENTS[source.index];
            const newBlock = { ...itemToAdd, uniqueId: `block-${Date.now()}`, currentValue: itemToAdd.defaultVal };
            const newBlocks = Array.from(activeBlocks);
            newBlocks.splice(destination.index, 0, newBlock);
            setActiveBlocks(newBlocks);
            updateParent(newBlocks);
        }
    };

    // 🟢 NEW: Generate the visual preview string
    const generatePreview = () => {
        return activeBlocks.map(b => {
            if (b.id === 'fixed') return b.currentValue;
            if (b.id === 'date') return '20260303'; // Mock date for preview
            if (b.id === 'seq') return b.currentValue === 'D3' ? '001' : b.currentValue === 'D4' ? '0001' : '1';
            if (b.id.startsWith('rnd')) return '8492';
            if (b.id === 'guid') return 'A1B2C3D4';
            return '';
        }).join('');
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="row mt-3 mb-4">
                <div className="col-md-4">
                    <h6 className="text-secondary">Available Elements</h6>
                    <Droppable droppableId="pool-zone" isDropDisabled={true}>
                        {(provided) => (
                            <div ref={provided.innerRef} {...provided.droppableProps} className="list-group">
                                {AVAILABLE_ELEMENTS.map((el, index) => (
                                    <Draggable key={el.id} draggableId={el.id} index={index}>
                                        {(provided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                className="list-group-item py-2 px-3 cursor-grab shadow-sm"
                                            >
                                                <i className="bi bi-grid-3x3-gap-fill me-2 text-secondary"></i>
                                                {el.label}
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </div>

                <div className="col-md-8">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6 className="text-secondary mb-0">Active Format Format</h6>
                        {/* Help popover guide requirement */}
                        <span className="badge bg-info text-dark" title="Drag elements here. For sequence, D3 means 001. Drag blocks outside this box to delete them.">? Help</span>
                    </div>
                    
                    <Droppable droppableId="active-zone" direction="horizontal">
                        {(provided, snapshot) => (
                            <div 
                                ref={provided.innerRef} 
                                {...provided.droppableProps} 
                                className={`p-3 border rounded d-flex flex-wrap gap-2 ${snapshot.isDraggingOver ? 'bg-light border-primary' : 'bg-white'}`}
                                style={{ minHeight: '80px' }}
                            >
                                {activeBlocks.length === 0 && <span className="text-muted mt-1">Drop elements here to build your ID format...</span>}
                                
                                {activeBlocks.map((block, index) => (
                                    <Draggable key={block.uniqueId} draggableId={block.uniqueId} index={index}>
                                        {(provided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                className="badge bg-dark text-white p-2 d-flex align-items-center shadow-sm fs-6"
                                            >
                                                <i className="bi bi-grip-vertical me-1 opacity-50"></i>
                                                <span className="me-2">{block.label}</span>
                                                
                                                {/* 🟢 NEW: Conditional inputs for configurable blocks */}
                                                {(block.id === 'fixed' || block.id === 'date' || block.id === 'seq') && (
                                                    <input 
                                                        type="text" 
                                                        className="form-control form-control-sm ms-2 d-inline-block text-center" 
                                                        style={{ width: '80px', height: '24px', fontSize: '12px' }}
                                                        value={block.currentValue}
                                                        onChange={(e) => handleValueChange(block.uniqueId, e.target.value)}
                                                    />
                                                )}
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>

                    <div className="mt-3 p-3 bg-light border rounded">
                        <strong className="text-secondary">Live Preview: </strong>
                        <span className="fs-5 text-primary fw-bold ms-2">
                            {generatePreview() || '---'}
                        </span>
                    </div>
                </div>
            </div>
        </DragDropContext>
    );
}