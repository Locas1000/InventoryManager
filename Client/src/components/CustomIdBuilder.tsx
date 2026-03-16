import React, { useState, useEffect, useRef } from 'react';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { useTranslation } from 'react-i18next'; 

// We moved the definition inside the component or updated labels dynamically
interface CustomIdBuilderProps {
    initialTemplate: string;
    onTemplateChange: (template: string) => void;
}

export default function CustomIdBuilder({ initialTemplate, onTemplateChange }: CustomIdBuilderProps) {
    const { t } = useTranslation(); 

    const AVAILABLE_ELEMENTS = [
        { id: 'fixed', label: t('el_fixed'), type: 'FIXED:', defaultVal: 'INV-' },
        { id: 'date', label: t('el_date'), type: 'DATE:', defaultVal: 'yyyyMMdd' },
        { id: 'seq', label: t('el_seq'), type: 'SEQ:', defaultVal: 'D3' },
        { id: 'rnd6', label: t('el_rnd6'), type: 'RND6', defaultVal: '' },
        { id: 'rnd9', label: t('el_rnd9'), type: 'RND9', defaultVal: '' },
        { id: 'rnd20', label: t('el_rnd20'), type: 'RND20BIT', defaultVal: '' },
        { id: 'rnd32', label: t('el_rnd32'), type: 'RND32BIT', defaultVal: '' },
        { id: 'guid', label: t('el_guid'), type: 'GUID', defaultVal: '' }
    ];

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
            if (source.droppableId === 'active-zone') {
                const newBlocks = Array.from(activeBlocks);
                newBlocks.splice(source.index, 1);
                setActiveBlocks(newBlocks);
                updateParent(newBlocks);
            }
            return;
        }

        if (source.droppableId === 'active-zone' && destination.droppableId === 'active-zone') {
            const newBlocks = Array.from(activeBlocks);
            const [reorderedItem] = newBlocks.splice(source.index, 1);
            newBlocks.splice(destination.index, 0, reorderedItem);
            setActiveBlocks(newBlocks);
            updateParent(newBlocks);
        }

        if (source.droppableId === 'pool-zone' && destination.droppableId === 'active-zone') {
            const itemToAdd = AVAILABLE_ELEMENTS[source.index];
            const newBlock = { ...itemToAdd, uniqueId: `block-${Date.now()}`, currentValue: itemToAdd.defaultVal };
            const newBlocks = Array.from(activeBlocks);
            newBlocks.splice(destination.index, 0, newBlock);
            setActiveBlocks(newBlocks);
            updateParent(newBlocks);
        }
    };

    const generatePreview = () => {
        return activeBlocks.map(b => {
            if (b.id === 'fixed') return b.currentValue;
            if (b.id === 'date') return '20260303'; 
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
                    <h6 className="text-secondary">{t('available_elements')}</h6>
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
                        <h6 className="text-secondary mb-0">{t('active_format')}</h6>
                        <span className="badge bg-info text-dark" title={t('id_builder_help')}>? Help</span>
                    </div>
                    
                    <Droppable droppableId="active-zone" direction="horizontal">
                        {(provided, snapshot) => (
                            <div 
                                ref={provided.innerRef} 
                                {...provided.droppableProps} 
                                className={`p-3 border rounded d-flex flex-wrap gap-2 ${snapshot.isDraggingOver ? 'bg-light border-primary' : 'bg-white'}`}
                                style={{ minHeight: '80px' }}
                            >
                                {activeBlocks.length === 0 && <span className="text-muted mt-1">{t('id_builder_placeholder')}</span>}
                                
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
                        <strong className="text-secondary">{t('live_preview')} </strong>
                        <span className="fs-5 text-primary fw-bold ms-2">
                            {generatePreview() || '---'}
                        </span>
                    </div>
                </div>
            </div>
        </DragDropContext>
    );
}