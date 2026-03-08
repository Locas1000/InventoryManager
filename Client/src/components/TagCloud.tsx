import React, { useEffect, useState } from 'react';

interface TagData {
    name: string;
    count: number;
}

interface Props {
    selectedTag: string | null;
    onSelectTag: (tag: string | null) => void;
}

export default function TagCloud({ selectedTag, onSelectTag }: Props) {
    const [tags, setTags] = useState<TagData[]>([]);

    useEffect(() => {
        // Fetch the most popular tags from our new endpoint
        fetch('/api/tags/cloud')
            .then(res => res.json())
            .then(data => setTags(data))
            .catch(err => console.error("Error fetching tag cloud:", err));
    }, []);

    if (tags.length === 0) return null; // Don't show anything if there are no tags yet

    return (
        <div className="mb-4 p-4 bg-light rounded shadow-sm border-0">
            <h5 className="fw-bold mb-3 text-secondary">
                <i className="bi bi-tags-fill me-2 text-primary"></i> Filter by Tag
            </h5>
            <div className="d-flex flex-wrap gap-2">
                {/* 🟢 An "All" button to clear the filter */}
                <button
                    className={`btn btn-sm rounded-pill px-3 ${!selectedTag ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => onSelectTag(null)}
                >
                    All Inventories
                </button>

                {/* 🟢 The dynamic tags from the database */}
                {tags.map(tag => (
                    <button
                        key={tag.name}
                        className={`btn btn-sm rounded-pill px-3 ${selectedTag === tag.name ? 'btn-primary shadow-sm' : 'btn-outline-info text-dark'}`}
                        onClick={() => onSelectTag(tag.name)}
                    >
                        #{tag.name}
                        <span className={`badge rounded-pill ms-2 ${selectedTag === tag.name ? 'bg-light text-primary' : 'bg-secondary text-white'}`}>
                            {tag.count}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}