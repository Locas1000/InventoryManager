import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // 🟢 NEW: Import the translation hook
import TagCloud from "../components/TagCloud";
import ReactMarkdown from 'react-markdown';
interface Inventory {
    id: number;
    title: string;
    description: string;
    category: string;
    imageUrl?: string;
    creatorName: string;
    itemCount: number;
}

export default function Dashboard() {
    const [inventories, setInventories] = useState<Inventory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const { t } = useTranslation(); // 🟢 NEW: Initialize the hook

    const fetchInventories = useCallback(() => {
        setIsLoading(true);
        fetch('https://inventorymanager-c0d3cbfwfxd9dwd8.canadacentral-01.azurewebsites.net/api/inventories')
            .then(res => res.json())
            .then(data => {
                setInventories(data);
                setIsLoading(false);
            })
            .catch(err => {
                console.error(err);
                setIsLoading(false);
            });
    }, []);

    useEffect(() => { fetchInventories(); }, [fetchInventories]);

    const handleTagSelect = (tag: string) => {
        navigate(`/search?q=${encodeURIComponent(tag)}`);
    };

    const latestInventories = inventories.slice(0, 10);
    const top5Inventories = [...inventories].sort((a, b) => b.itemCount - a.itemCount).slice(0, 5);

    if (isLoading && inventories.length === 0) return <div className="container mt-5 text-center"><div className="spinner-border text-primary"></div></div>;

    return (
        <div className="container mt-5">
            {/* 🟢 REPLACED: Text with t('key') */}
            <h1 className="mb-5 text-center fw-bold">{t('welcome_title')}</h1>

            <div className="row g-5">
                {/* Left Column: Tables */}
                <div className="col-lg-8">
                    
                    {/* --- TABLE 1: LATEST --- */}
                    <h3 className="mb-3"><i className="bi bi-clock-history me-2"></i>{t('latest_inventories')}</h3>
                    <div className="table-responsive mb-5">
                        <table className="table table-bordered table-hover bg-white shadow-sm">
                            <thead className="table-dark">
                                <tr>
                                    <th>{t('table_title')}</th>
                                    <th>{t('table_creator')}</th>
                                    <th>{t('table_description')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {latestInventories.length === 0 ? (
                                    <tr><td colSpan={3} className="text-center text-muted">{t('no_inventories_found')}</td></tr>
                                ) : (
                                    latestInventories.map((inv) => (
                                        <tr key={`latest-${inv.id}`}>
                                            <td className="fw-bold">
                                                <span className="text-primary text-decoration-underline" style={{ cursor: "pointer" }} onClick={() => navigate(`/inventory/${inv.id}`)}>
                                                    {inv.title}
                                                </span>
                                            </td>
                                            <td>@{inv.creatorName}</td>
                                            <td style={{maxWidth: '250px'}}>
                                                <div className="text-truncate" style={{ maxHeight: '1.5em' }}>
                                                    <ReactMarkdown>{inv.description}</ReactMarkdown>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* --- TABLE 2: TOP 5 --- */}
                    <h3 className="mb-3"><i className="bi bi-fire text-danger me-2"></i>{t('top_5_popular')}</h3>
                    <div className="table-responsive">
                        <table className="table table-bordered table-striped bg-white shadow-sm">
                            <thead className="table-light">
                                <tr>
                                    <th>{t('table_rank')}</th>
                                    <th>{t('table_title')}</th>
                                    <th>{t('table_creator')}</th>
                                    <th className="text-center">{t('table_items')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {top5Inventories.length === 0 ? (
                                    <tr><td colSpan={4} className="text-center text-muted">{t('no_items_exist')}</td></tr>
                                ) : (
                                    top5Inventories.map((inv, index) => (
                                        <tr key={`top-${inv.id}`}>
                                            <td className="text-center fw-bold text-muted">#{index + 1}</td>
                                            <td className="fw-bold">
                                                <span className="text-primary text-decoration-underline" style={{ cursor: "pointer" }} onClick={() => navigate(`/inventory/${inv.id}`)}>
                                                    {inv.title}
                                                </span>
                                            </td>
                                            <td>@{inv.creatorName}</td>
                                            <td className="text-center fw-bold">{inv.itemCount}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                </div>

                {/* Right Column: Tag Cloud */}
                <div className="col-lg-4">
                    <div className="card shadow-sm border-0 sticky-top" style={{top: '20px'}}>
                        <div className="card-header bg-white border-bottom-0 pt-4">
                            <h4 className="fw-bold m-0"><i className="bi bi-tags-fill text-primary me-2"></i>{t('explore_tags')}</h4>
                        </div>
                        <div className="card-body">
                            <p className="text-muted small">{t('click_tag_search')}</p>
                            <TagCloud onSelectTag={handleTagSelect} selectedTag={null} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}