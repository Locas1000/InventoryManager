import React, { useState, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { fetchWithAuth } from "../utils/api";

interface Comment {
    id: number;
    userId: number; 
    text: string;
    createdAt: string;
    userName: string;
}

interface Props {
    inventoryId: number;
}

export default function DiscussionBoard({ inventoryId }: Props) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Inline Edit State
    const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
    const [editContent, setEditContent] = useState("");

    // Get the logged-in user
    const userString = localStorage.getItem('user');
    const currentUser = userString ? JSON.parse(userString) : null;
    const currentUserId = currentUser ? Number(currentUser.id || currentUser.Id || currentUser.userId || currentUser.UserId) : null;
    
    const fetchComments = useCallback(async () => {
        try {
            const res = await fetch(`https://inventorymanager-c0d3cbfwfxd9dwd8.canadacentral-01.azurewebsites.net/api/inventories/${inventoryId}/comments`);
            if (res.ok) {
                const data = await res.json();
                setComments(data);
            }
        } catch (error) {
            console.error("Failed to fetch comments", error);
        }
    }, [inventoryId]);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setIsSubmitting(true);
        try {
            const res = await fetchWithAuth(`https://inventorymanager-c0d3cbfwfxd9dwd8.canadacentral-01.azurewebsites.net/api/inventories/${inventoryId}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: newComment })
            });

            if (res.ok) {
                setNewComment("");
                fetchComments();
            }
        } catch (error) {
            console.error("Error posting comment", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (commentId: number) => {
        if (!window.confirm("Are you sure you want to delete this comment?")) return;
        try {
            const res = await fetchWithAuth(`https://inventorymanager-c0d3cbfwfxd9dwd8.canadacentral-01.azurewebsites.net/api/inventories/${inventoryId}/comments/${commentId}`, {
                method: "DELETE"
            });
            if (res.ok) fetchComments();
        } catch (error) {
            console.error("Error deleting comment", error);
        }
    };

    const handleSaveEdit = async (commentId: number) => {
        if (!editContent.trim()) return;
        try {
            const res = await fetchWithAuth(`https://inventorymanager-c0d3cbfwfxd9dwd8.canadacentral-01.azurewebsites.net/api/inventories/${inventoryId}/comments/${commentId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: editContent })
            });
            if (res.ok) {
                setEditingCommentId(null);
                fetchComments();
            }
        } catch (error) {
            console.error("Error updating comment", error);
        }
    };

    // 🟢 Formatting helper for the date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, { 
            year: 'numeric', month: 'short', day: 'numeric', 
            hour: '2-digit', minute: '2-digit' 
        });
    };

    return (
        <div className="mt-5 mb-5">
            <h3 className="fw-bold mb-4 border-bottom pb-2">
                <i className="bi bi-chat-left-text me-2 text-primary"></i>
                Discussion Board
            </h3>

            {/* The New Comment Form */}
            <div className="card shadow-sm mb-4 border-0 bg-light">
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label fw-semibold">Leave a comment</label>
                            <textarea
                                className="form-control" rows={3}
                                placeholder="Supports Markdown! **bold**, *italics*, - lists..."
                                value={newComment} onChange={(e) => setNewComment(e.target.value)}
                                disabled={isSubmitting} required
                            ></textarea>
                        </div>
                        <button type="submit" className="btn btn-primary px-4" disabled={isSubmitting || !newComment.trim()}>
                            {isSubmitting ? "Posting..." : "Post Comment"}
                        </button>
                    </form>
                </div>
            </div>

            {/* The Comments List */}
            <div className="d-flex flex-column gap-3">
                {comments.length === 0 ? (
                    <p className="text-muted text-center mt-3">No comments yet. Be the first to start the discussion!</p>
                ) : (
                    comments.map(comment => {
                        const isOwner = Number(currentUserId) === Number(comment.userId);
                        return (
                            <div key={comment.id} className={`card shadow-sm ${isOwner ? 'border-primary border-2' : 'border-0'}`}>
                                
                                {/* 🟢 NEW: Card Header showing User and Date */}
                                <div className="card-header bg-transparent border-bottom-0 d-flex justify-content-between align-items-center pt-3 pb-0">
                                    <div>
                                        <i className="bi bi-person-circle me-2 text-secondary"></i>
                                        <span className="fw-bold me-2">{comment.userName || 'Anonymous User'}</span>
                                        <span className="text-muted small">{formatDate(comment.createdAt)}</span>
                                        {isOwner && <span className="badge bg-primary ms-2">You</span>}
                                    </div>
                                    
                                    {/* Edit/Delete Buttons */}
                                    {isOwner && (
                                        <div className="d-flex gap-2">
                                            <button 
                                                className="btn btn-sm btn-outline-primary" 
                                                onClick={() => { setEditingCommentId(comment.id); setEditContent(comment.text); }}
                                            >
                                                <i className="bi bi-pencil"></i>
                                            </button>
                                            <button 
                                                className="btn btn-sm btn-outline-danger" 
                                                onClick={() => handleDelete(comment.id)}
                                            >
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="card-body">
                                    {editingCommentId === comment.id ? (
                                        <div>
                                            <textarea
                                                className="form-control mb-2"
                                                rows={3}
                                                value={editContent}
                                                onChange={(e) => setEditContent(e.target.value)}
                                            ></textarea>
                                            <button className="btn btn-sm btn-success me-2" onClick={() => handleSaveEdit(comment.id)}>Save</button>
                                            <button className="btn btn-sm btn-secondary" onClick={() => setEditingCommentId(null)}>Cancel</button>
                                        </div>
                                    ) : (
                                        <div className="markdown-content">
                                            <ReactMarkdown>{comment.text}</ReactMarkdown>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}