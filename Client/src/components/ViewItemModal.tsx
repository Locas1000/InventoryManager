import React from "react";

interface Props {
    show: boolean;
    onClose: () => void;
    inventory: any;
    item: any;
}

export default function ViewItemModal({ show, onClose, inventory, item }: Props) {
    if (!show || !inventory || !item) return null;

    return (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)', overflowY: 'auto' }}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content border-0 shadow-lg">
                    <div className="modal-header bg-primary text-white border-0">
                        <h5 className="modal-title fw-bold">
                            <i className="bi bi-box-seam me-2"></i> Item Details
                        </h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>

                    <div className="modal-body p-4">
                        <div className="row mb-4 align-items-center">
                            {item.imageUrl && (
                                <div className="col-md-4 text-center mb-3 mb-md-0">
                                    <img
                                        src={item.imageUrl}
                                        alt={item.name}
                                        className="img-fluid rounded shadow-sm object-fit-cover"
                                        style={{ maxHeight: '200px', width: '100%' }}
                                    />
                                </div>
                            )}
                            <div className={item.imageUrl ? "col-md-8" : "col-12"}>
                                <span className="text-muted small text-uppercase fw-bold">Item Name</span>
                                <h2 className="fw-bold mb-1">{item.name}</h2>
                                <p className="font-monospace text-primary mb-2 border rounded p-2 bg-light d-inline-block">
                                    ID: {item.customId}
                                </p>
                                <div>
                                    <span className={`badge ${item.currentUserLiked ? 'bg-danger' : 'bg-secondary'}`}>
                                        <i className="bi bi-heart-fill me-1"></i> {item.totalLikes || 0} Likes
                                    </span>
                                </div>
                            </div>
                        </div>

                        <h5 className="border-bottom pb-2 mb-3 text-secondary fw-bold">Specifications</h5>

                        {/* Data Grid for Custom Fields */}
                        <dl className="row g-3">
                            {/* Strings */}
                            {inventory.string1Name && (
                                <><dt className="col-sm-4 text-muted">{inventory.string1Name}</dt>
                                    <dd className="col-sm-8 fw-semibold">{item.string1Value || "—"}</dd></>
                            )}
                            {inventory.string2Name && (
                                <><dt className="col-sm-4 text-muted">{inventory.string2Name}</dt>
                                    <dd className="col-sm-8 fw-semibold">{item.string2Value || "—"}</dd></>
                            )}
                            {inventory.string3Name && (
                                <><dt className="col-sm-4 text-muted">{inventory.string3Name}</dt>
                                    <dd className="col-sm-8 fw-semibold">{item.string3Value || "—"}</dd></>
                            )}

                            {/* Numbers */}
                            {inventory.number1Name && (
                                <><dt className="col-sm-4 text-muted">{inventory.number1Name}</dt>
                                    <dd className="col-sm-8 fw-semibold">{item.number1Value ?? "—"}</dd></>
                            )}
                            {inventory.number2Name && (
                                <><dt className="col-sm-4 text-muted">{inventory.number2Name}</dt>
                                    <dd className="col-sm-8 fw-semibold">{item.number2Value ?? "—"}</dd></>
                            )}
                            {inventory.number3Name && (
                                <><dt className="col-sm-4 text-muted">{inventory.number3Name}</dt>
                                    <dd className="col-sm-8 fw-semibold">{item.number3Value ?? "—"}</dd></>
                            )}

                            {/* Booleans */}
                            {inventory.bool1Name && (
                                <><dt className="col-sm-4 text-muted">{inventory.bool1Name}</dt>
                                    <dd className="col-sm-8"><span className={`badge ${item.bool1Value ? 'bg-success' : 'bg-secondary'}`}>{item.bool1Value ? "Yes" : "No"}</span></dd></>
                            )}
                            {inventory.bool2Name && (
                                <><dt className="col-sm-4 text-muted">{inventory.bool2Name}</dt>
                                    <dd className="col-sm-8"><span className={`badge ${item.bool2Value ? 'bg-success' : 'bg-secondary'}`}>{item.bool2Value ? "Yes" : "No"}</span></dd></>
                            )}
                            {inventory.bool3Name && (
                                <><dt className="col-sm-4 text-muted">{inventory.bool3Name}</dt>
                                    <dd className="col-sm-8"><span className={`badge ${item.bool3Value ? 'bg-success' : 'bg-secondary'}`}>{item.bool3Value ? "Yes" : "No"}</span></dd></>
                            )}

                            {/* Long Text Areas get their own full-width rows */}
                            {inventory.text1Name && (
                                <div className="col-12 mt-3">
                                    <dt className="text-muted mb-1">{inventory.text1Name}</dt>
                                    <dd className="bg-light p-3 rounded border">{item.text1Value || "—"}</dd>
                                </div>
                            )}
                            {inventory.text2Name && (
                                <div className="col-12 mt-3">
                                    <dt className="text-muted mb-1">{inventory.text2Name}</dt>
                                    <dd className="bg-light p-3 rounded border">{item.text2Value || "—"}</dd>
                                </div>
                            )}
                            {inventory.text3Name && (
                                <div className="col-12 mt-3">
                                    <dt className="text-muted mb-1">{inventory.text3Name}</dt>
                                    <dd className="bg-light p-3 rounded border">{item.text3Value || "—"}</dd>
                                </div>
                            )}
                        </dl>
                    </div>

                    <div className="modal-footer bg-light border-0">
                        <button type="button" className="btn btn-secondary px-4" onClick={onClose}>Close</button>
                    </div>
                </div>
            </div>
        </div>
    );
}