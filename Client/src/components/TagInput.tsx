import React, { useState, useEffect, useRef } from 'react';

interface Props {
    selectedTags: string[];
    onChange: (tags: string[]) => void;
}

export default function TagInput({ selectedTags, onChange }: Props) {
    const [inputValue, setInputValue] = useState("");
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

    // Fetch suggestions from your C# backend when typing
    useEffect(() => {
        if (inputValue.trim().length === 0) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

        debounceTimeout.current = setTimeout(async () => {
            try {
                const res = await fetch(`https://inventorymanager-c0d3cbfwfxd9dwd8.canadacentral-01.azurewebsites.net/api/tags/search?q=${encodeURIComponent(inputValue)}`);
                if (res.ok) {
                    const data = await res.json();
                    // Filter out tags we already selected
                    const filtered = data.filter((t: string) => !selectedTags.includes(t));
                    setSuggestions(filtered);
                    setShowSuggestions(true);
                }
            } catch (err) {
                console.error("Failed to fetch tags", err);
            }
        }, 300); // 300ms delay so we don't spam the server every keystroke
    }, [inputValue, selectedTags]);

    const addTag = (tag: string) => {
        const cleanTag = tag.trim().toLowerCase();
        if (cleanTag && !selectedTags.includes(cleanTag)) {
            onChange([...selectedTags, cleanTag]);
        }
        setInputValue("");
        setSuggestions([]);
        setShowSuggestions(false);
    };

    const removeTag = (tagToRemove: string) => {
        onChange(selectedTags.filter(t => t !== tagToRemove));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        // Add tag if they press Enter or Comma
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag(inputValue);
        }
    };

    return (
        <div className="position-relative">
            {/* The Selected Tags (Pills) */}
            <div className="d-flex flex-wrap gap-2 mb-2">
                {selectedTags.map(tag => (
                    <span key={tag} className="badge bg-primary d-flex align-items-center p-2 fs-6">
                        #{tag}
                        <button type="button" className="btn-close btn-close-white ms-2" style={{ fontSize: '0.5rem' }} onClick={() => removeTag(tag)}></button>
                    </span>
                ))}
            </div>

            {/* The Input Field */}
            <input
                type="text"
                className="form-control"
                placeholder="Type a tag and press Enter..."
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} // Slight delay to allow clicking a suggestion
                onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
            />

            {/* The Autocomplete Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
                <ul className="list-group position-absolute w-100 mt-1 shadow z-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {suggestions.map(suggestion => (
                        <li
                            key={suggestion}
                            className="list-group-item list-group-item-action"
                            style={{ cursor: 'pointer' }}
                            onMouseDown={() => addTag(suggestion)}
                        >
                            #{suggestion}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}