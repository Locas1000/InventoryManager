import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

interface InventoryResult {
    id: number;
    title: string;
    category: string;
    type: string;
}

interface ItemResult {
    id: number;
    name: string;
    customId: string;
    inventoryId: number;
    inventoryTitle: string;
    type: string;
}

interface SearchData {
    inventories: InventoryResult[];
    items: ItemResult[];
}

export default function SearchResults() {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';

    const [results, setResults] = useState<SearchData>({ inventories: [], items: [] });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!query.trim()) return;

        setIsLoading(true);
        fetch(`https://inventorymanager-c0d3cbfwfxd9dwd8.canadacentral-01.azurewebsites.net/api/search?q=${encodeURIComponent(query)}`)
            .then(res => res.json())
            .then(data => {
                setResults(data);
                setIsLoading(false);
            })
            .catch(err => {
                console.error("Search failed", err);
                setIsLoading(false);
            });
    }, [query]);

    if (isLoading) {
        return (
            <div className="container mt-5 text-center">
                <div className="spinner-border text-primary" role="status"></div>
            </div>
        );
    }

    return (
        <div className="container mt-5">
            <h2 className="mb-4">🔍 Search Results for <span className="text-primary">"{query}"</span></h2>

            <div className="row">
                {/* 🟢 Column 1: Inventories */}
                <div className="col-md-6 mb-4">
                    <h4 className="border-bottom pb-2">📦 Inventories ({results.inventories.length})</h4>
                    {results.inventories.length === 0 ? (
                        <p className="text-muted">No matching inventories found.</p>
                    ) : (
                        <div className="list-group">
                            {results.inventories.map(inv => (
                                <Link key={`inv-${inv.id}`} to={`/inventory/${inv.id}`} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 className="mb-0 fw-bold">{inv.title}</h6>
                                        <small className="text-muted">{inv.category}</small>
                                    </div>
                                    <span className="badge bg-secondary">Inventory</span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* 🟢 Column 2: Items */}
                <div className="col-md-6 mb-4">
                    <h4 className="border-bottom pb-2">📄 Items ({results.items.length})</h4>
                    {results.items.length === 0 ? (
                        <p className="text-muted">No matching items found.</p>
                    ) : (
                        <div className="list-group">
                            {results.items.map(item => (
                                <Link key={`item-${item.id}`} to={`/inventory/${item.inventoryId}`} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 className="mb-0 fw-bold">{item.name} <span className="text-muted ms-2 fs-6">({item.customId})</span></h6>
                                        <small className="text-primary">Found in: {item.inventoryTitle}</small>
                                    </div>
                                    <span className="badge bg-info text-dark">Item</span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}