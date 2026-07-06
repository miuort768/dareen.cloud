import { useState, useEffect, useCallback } from 'react';
import { MessageSquare, ThumbsUp, Send, MoreHorizontal, AlertTriangle, Sparkles, User, ShieldCheck, Clock, Trash2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useCurrentUser, useShowNotification } from '../context/AppContext';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from '../lib/utils';
import { confirm, alert } from '../lib/confirmDialog';

interface Comment {
    id: string;
    postId: string;
    authorId: string;
    authorName: string;
    authorRole: string;
    content: string;
    created_at: string;
}

interface Post {
    id: string;
    authorId: string;
    authorName: string;
    authorRole: string;
    content: string;
    status: 'pending' | 'approved' | 'rejected';
    upvotes: string[];
    downvotes: string[];
    commentCount?: number;
    created_at: string;
    comments?: Comment[];
}

interface CommentNode {
    comment: Comment;
    replies: CommentNode[];
}

const buildThreadedComments = (comments: Comment[]): CommentNode[] => {
    if (!comments) return [];
    
    const nodes: CommentNode[] = [];
    const handledIds = new Set<string>();

    // First pass: find main comments
    comments.forEach(c => {
        if (!c.content.trim().startsWith('@')) {
            nodes.push({ comment: c, replies: [] });
            handledIds.add(c.id);
        }
    });

    // Second pass: place replies under correct parent
    comments.forEach(c => {
        if (!handledIds.has(c.id)) {
            let foundParent = false;
            for (const node of nodes) {
                if (c.content.trim().startsWith(`@${node.comment.authorName}`)) {
                    node.replies.push({ comment: c, replies: [] });
                    handledIds.add(c.id);
                    foundParent = true;
                    break;
                }
            }
            if (!foundParent) {
                 for (const node of nodes) {
                     const isReplyToReply = node.replies.some(r => c.content.trim().startsWith(`@${r.comment.authorName}`));
                     if (isReplyToReply) {
                         node.replies.push({ comment: c, replies: [] });
                         handledIds.add(c.id);
                         foundParent = true;
                         break;
                     }
                 }
            }
            if (!foundParent) {
                nodes.push({ comment: c, replies: [] });
                handledIds.add(c.id);
            }
        }
    });

    return nodes;
};

export const Forum = () => {
    const currentUser = useCurrentUser();
    const showNotification = useShowNotification();
    const isAdmin = currentUser?.role === 'admin';
    const [searchParams] = useSearchParams();
    const highlightedPostId = searchParams.get('postId');
    
    const [posts, setPosts] = useState<Post[]>([]);
    const [newPostContent, setNewPostContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [commentTexts, setCommentTexts] = useState<Record<string, string>>({});
    const [viewingComments, setViewingComments] = useState<Record<string, boolean>>({});
    const [showMenuPostId, setShowMenuPostId] = useState<string | null>(null);

    const fetchPosts = useCallback(async () => {
        try {
            setLoading(true);
            const data = await api.get<Post[]>('/forum');
            setPosts(data);
        } catch (error) {
            console.error('Error fetching forum posts:', error);
            showNotification('فشل تحميل المنشورات', 'error');
        } finally {
            setLoading(false);
        }
    }, [showNotification]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    useEffect(() => {
        if (highlightedPostId && !loading) {
            const element = document.getElementById(`post-${highlightedPostId}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [highlightedPostId, loading]);

    const handleCreatePost = async () => {
        if (!newPostContent.trim()) return;
        try {
            const data = await api.post<Record<string, unknown>>('/forum', { content: newPostContent });
            showNotification(data.message || 'تم إنشاء المنشور', 'success');
            setNewPostContent('');
            fetchPosts();
        } catch (error) {
            console.error(error);
            showNotification('فشل النشر', 'error');
        }
    };

    const handleVote = async (postId: string, type: 'upvote' | 'downvote') => {
        try {
            const data = await api.post<{ upvotes: number; downvotes: number }>(`/forum/${postId}/vote`, { type });
            setPosts(posts.map((p: Post) => p.id === postId ? { ...p, upvotes: data.upvotes, downvotes: data.downvotes } : p));
        } catch (error) {
            console.error(error);
            showNotification('فشل التصويت على هذا المنشور', 'error');
        }
    };

    const handleUpdateStatus = async (postId: string, status: 'approved' | 'rejected') => {
        try {
            await api.patch(`/forum/${postId}/status`, { status });
            showNotification('تم تحديث حالة المنشور', 'success');
            fetchPosts();
        } catch (error) {
            console.error(error);
            showNotification('فشل تحديث الحالة', 'error');
        }
    };

    const handleDeletePost = async (postId: string) => {
        if (!await confirm('هل أنت متأكد من حذف هذا المنشور؟')) return;
        try {
            await api.delete(`/forum/${postId}`);
            showNotification('تم حذف المنشور', 'success');
            fetchPosts();
        } catch (error) {
            console.error(error);
            showNotification('فشل الحذف', 'error');
        }
    };

    const toggleComments = async (postId: string) => {
        if (!viewingComments[postId]) {
            try {
                const data = await api.get<Comment[]>(`/forum/${postId}/comments`);
                setPosts(posts.map((p: Post) => p.id === postId ? { ...p, comments: data } : p));
            } catch (error) {
                console.error(error);
            showNotification('فشل تحميل المنشورات', 'error');
            }
        }
        setViewingComments((prev: Record<string, boolean>) => ({ ...prev, [postId]: !prev[postId] }));
    };

    const handleAddComment = async (postId: string) => {
        const text = commentTexts[postId];
        if (!text || !text.trim()) return;

        try {
            await api.post(`/forum/${postId}/comments`, { content: text });
            setCommentTexts((prev: Record<string, string>) => ({ ...prev, [postId]: '' }));
            showNotification('تم إضافة التعليق', 'success');
            const data = await api.get<Comment[]>(`/forum/${postId}/comments`);
            setPosts(posts.map((p: Post) => p.id === postId ? { ...p, comments: data } : p));
        } catch (error) {
            console.error(error);
            showNotification('فشل إضافة التعليق', 'error');
        }
    };
    
    const handleDeleteComment = async (postId: string, commentId: string) => {
        if(!await confirm('هل أنت متأكد من حذف هذا التعليق؟')) return;
        try {
            await api.delete(`/forum/comments/${commentId}`);
            showNotification('تم حذف التعليق', 'success');
            const data = await api.get<Comment[]>(`/forum/${postId}/comments`);
            setPosts(posts.map((p: Post) => p.id === postId ? { ...p, comments: data } : p));
        } catch (err) {
            console.error(err);
            showNotification('فشل الحذف', 'error');
        }
    };

    const handleReport = async (postId: string) => {
        try {
            await api.post(`/forum/${postId}/report`);
            showNotification('تم إرسال البلاغ للمراجعة', 'info');
        } catch (error) {
            console.error(error);
            showNotification('فشل الإبلاغ', 'error');
        }
    };

    return (
        <div className="min-h-full overflow-x-hidden relative bg-gradient-to-br from-[var(--bg-background)] via-white to-[var(--bg-primary-soft)]/30 dark:from-[var(--bg-background)] dark:via-[var(--bg-background)] dark:to-[var(--bg-primary)]/20 pb-20 md:animate-in md:fade-in md:duration-700 font-sans" dir="rtl">
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, var(--bg-info) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
            <div className="relative z-10">

            {/* ════════ HEADER ════════ */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[var(--bg-primary)] via-[var(--bg-primary-hover)] to-[var(--bg-primary-active)] rounded-3xl shadow-xl shadow-primary/30 border border-white/10 px-6 py-8 mx-4 mt-4 mb-6">
                {/* Decorative blobs */}
                <div className="absolute -top-16 -right-16 w-64 h-64 bg-primary/20 rounded-full blur-[80px] pointer-events-none" />
                <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-info-light/15 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute top-1/3 left-1/4 w-2 h-2 bg-white/30 rounded-full" />
                <div className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-primary/40 rounded-full" />
                <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-white/20 rounded-full" />
                <div className="absolute top-1/4 right-1/4 w-3 h-3 border border-white/10 rounded-full" />
                <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="w-14 h-14 bg-white/15 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 border border-white/20 shadow-lg shadow-primary/20">
                        <Sparkles size={26} className="text-on-primary" />
                    </div>
                    <h1 className="text-3xl font-black text-on-primary leading-tight mb-2">منتدى دارين</h1>
                    <p className="text-sm text-on-primary/80 font-medium leading-relaxed max-w-md">
                        مساحة آمنة للنقاش وتبادل الأفكار بين الطلاب والمعلمات وأولياء الأمور.
                    </p>
                </div>
            </div>

            <div className="max-w-[700px] mx-auto px-4 space-y-6">
                
                {/* ════════ CREATE POST CARD ════════ */}
                <div className="bg-white dark:bg-primary-active rounded-3xl shadow-xl p-5">
                    <div className="space-y-3">
                        <textarea
                            value={newPostContent}
                            onChange={(e) => setNewPostContent(e.target.value)}
                            className="w-full bg-primary-soft/50 dark:bg-primary-active/50 rounded-2xl p-4 min-h-[100px] text-sm font-medium text-main dark:text-on-primary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted resize-none border-0"
                            placeholder="شارك فكرة أو سؤال…"
                            style={{ lineHeight: 1.8 }}
                        />
                        <div className="flex justify-between items-center">
                            <p className="text-micro text-muted font-medium flex items-center gap-1.5">
                                <ShieldCheck size={11} className="text-primary" /> نشر متوافق مع سياسات المنصة
                            </p>
                            <button
                                onClick={handleCreatePost}
                                disabled={!newPostContent.trim()}
                                className="bg-gradient-to-l from-[var(--bg-primary)] to-[var(--bg-primary)] hover:from-[var(--bg-primary-hover)] hover:to-[var(--bg-primary)] text-on-primary px-5 py-2.5 text-xs font-bold rounded-full disabled:opacity-30 transition-all flex items-center gap-2 shadow-lg shadow-primary/40 active:scale-95"
                            >
                                <Send size={13} /> نشر
                            </button>
                        </div>
                    </div>
                </div>

                {/* ════════ POSTS FEED ════════ */}
                {loading ? (
                    <div className="space-y-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white dark:bg-primary-active h-48 animate-pulse rounded-3xl shadow-xl"></div>
                        ))}
                    </div>
                ) : posts.length === 0 ? (
                    <div className="bg-white dark:bg-primary-active rounded-3xl shadow-xl p-16 text-center border-2 border-dashed border-primary dark:border-primary/30">
                        <div className="w-16 h-16 bg-gradient-to-br from-[var(--bg-primary-soft)] to-[var(--bg-primary-light)] dark:from-[var(--bg-primary-active)]/20 dark:to-[var(--bg-primary-active)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <MessageSquare size={24} className="text-primary" />
                        </div>
                        <p className="text-sm font-bold text-muted">لا توجد منشورات هنا</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {posts.map((post: Post) => {
                            const isLiked = post.upvotes.includes(currentUser?.id || '');
                            const isHighlighted = post.id === highlightedPostId;

                            return (
                                <div 
                                    key={post.id} 
                                    id={`post-${post.id}`}
                                    className={cn(
                                        "bg-white dark:bg-primary-active rounded-3xl shadow-xl transition-all duration-500",
                                        isHighlighted && "ring-2 ring-primary shadow-lg shadow-primary/30"
                                    )}
                                >
                                    {/* Post Header */}
                                    <div className="p-4 md:p-5 flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[var(--bg-primary-light)] to-[var(--bg-primary-soft)] dark:from-[var(--bg-primary-active)]/30 dark:to-[var(--bg-primary-active)]/20 flex items-center justify-center font-bold text-primary dark:text-primary text-sm border-2 border-primary/50 dark:border-primary/30">
                                                {(post.authorName?.[0] || '').toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <h4 className="font-bold text-main dark:text-on-primary text-sm">{post.authorName}</h4>
                                                    {post.authorRole === 'admin' && (
                                                        <span className="text-micro font-bold px-2 py-0.5 rounded-full bg-error-light text-error border border-error dark:bg-error/20 dark:text-error dark:border-error/30">إدارة</span>
                                                    )}
                                                    {post.authorRole === 'teacher' && (
                                                        <span className="text-micro font-bold px-2 py-0.5 rounded-full bg-success-light text-success border border-success dark:bg-success/20 dark:text-success dark:border-success/30">معلم</span>
                                                    )}
                                                    {post.authorRole === 'student' && (
                                                        <span className="text-micro font-bold px-2 py-0.5 rounded-full bg-info-light text-info border border-info dark:bg-info/20 dark:text-info dark:border-info/30">طالب</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-micro text-muted font-medium">
                                                    <Clock size={9} />
                                                    <span>{formatDistanceToNow(new Date(post.created_at) > new Date() ? new Date() : new Date(post.created_at), { addSuffix: true, locale: ar })}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {isAdmin && (
                                                <button 
                                                    onClick={() => handleDeletePost(post.id)}
                                                    className="p-2 text-dim hover:text-error transition-colors rounded-xl hover:bg-error-light dark:hover:bg-error/20"
                                                    title="حذف المنشور"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            )}
                                            <div className="relative">
                                                <button
                                                    onClick={() => setShowMenuPostId(showMenuPostId === post.id ? null : post.id)}
                                                    className="p-2 text-dim hover:text-muted transition-colors rounded-xl hover:bg-surface dark:hover:bg-primary-active/50"
                                                    aria-label="القائمة"
                                                >
                                                    <MoreHorizontal size={17} />
                                                </button>
                                                {showMenuPostId === post.id && (
                                                    <div className="absolute left-0 top-full mt-1 w-36 bg-white dark:bg-primary-active rounded-xl shadow-xl border border-border dark:border-border z-50 py-1">
                                                        <button onClick={() => { handleReport(post.id); setShowMenuPostId(null); }} className="w-full px-4 py-2 text-micro font-bold text-right text-muted dark:text-dim hover:bg-surface dark:hover:bg-primary-active flex items-center gap-2">
                                                            <AlertTriangle size={12} className="text-error" /> الإبلاغ عن المنشور
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Post Body */}
                                    <div className="px-4 pb-5">
                                        <p className="text-main dark:text-dim text-sm md:text-base font-medium leading-[1.9] whitespace-pre-wrap">
                                            {post.content}
                                        </p>
                                    </div>

                                    {/* Action Bar */}
                                    <div className="px-3 md:px-4 py-1.5 flex border-t border-border dark:border-border">
                                        <button 
                                            onClick={() => handleVote(post.id, 'upvote')}
                                            className={cn(
                                                "flex-1 py-2.5 flex items-center justify-center gap-2 text-xs font-bold transition-all active:scale-95 rounded-xl",
                                                isLiked ? "text-primary bg-primary-soft dark:bg-primary-active/20" : "text-muted hover:text-muted hover:bg-surface dark:hover:bg-primary-active/50"
                                            )}
                                        >
                                            <ThumbsUp size={15} className={cn(isLiked && "fill-current")} />
                                            <span>إعجاب</span>
                                        </button>
                                        <button 
                                            onClick={() => toggleComments(post.id)}
                                            className="flex-1 py-2.5 flex items-center justify-center gap-2 text-xs font-bold text-muted hover:text-muted transition-all active:scale-95 rounded-xl hover:bg-surface dark:hover:bg-primary-active/50 mx-1"
                                        >
                                            <MessageSquare size={15} />
                                            <span>{post.commentCount || 0} تعليق</span>
                                        </button>
                                        <button 
                                            onClick={() => handleReport(post.id)}
                                            className="flex-1 py-2.5 flex items-center justify-center gap-2 text-xs font-bold text-error hover:text-error transition-all active:scale-95 rounded-xl hover:bg-error-light dark:hover:bg-error/20"
                                        >
                                            <AlertTriangle size={15} />
                                            <span>بلاغ</span>
                                        </button>
                                    </div>

                                    {/* Comments Section */}
                                    {viewingComments[post.id] && (
                                        <div className="bg-primary-soft/30 dark:bg-primary-active/30 rounded-b-3xl border-t border-border dark:border-border p-4 md:p-5 space-y-4">
                                            <div className="space-y-3">
                                                {buildThreadedComments(post.comments || []).map((node) => (
                                                    <div key={node.comment.id} className="space-y-3">
                                                        {/* Main Comment */}
                                                        <div className="flex gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--bg-primary-light)] to-[var(--bg-primary-soft)] dark:from-[var(--bg-primary-active)]/30 dark:to-[var(--bg-primary-active)]/20 flex items-center justify-center font-bold text-primary text-micro shrink-0 border-2 border-primary/50 dark:border-primary/30">
                                                                {(node.comment.authorName?.[0] || '').toUpperCase()}
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="bg-white dark:bg-primary-active rounded-2xl p-3.5 shadow-sm border border-border dark:border-border/50">
                                                                    <div className="flex justify-between items-center mb-1">
                                                                        <h5 className="text-xs font-bold text-main dark:text-on-primary">{node.comment.authorName}</h5>
                                                                        <span className="text-micro text-muted font-medium">{formatDistanceToNow(new Date(node.comment.created_at) > new Date() ? new Date() : new Date(node.comment.created_at), { addSuffix: true, locale: ar })}</span>
                                                                    </div>
                                                                    <p className="text-xs text-muted dark:text-dim leading-relaxed">{node.comment.content}</p>
                                                                    
                                                                    <div className="flex gap-3 mt-2 pt-2 border-t border-border dark:border-border/50">
                                                                        <button 
                                                                            onClick={() => {
                                                                                const currentText = commentTexts[post.id] || '';
                                                                                const newText = `@${node.comment.authorName} ` + currentText;
                                                                                setCommentTexts((prev) => ({ ...prev, [post.id]: newText }));
                                                                                document.getElementById(`comment-input-${post.id}`)?.focus();
                                                                            }}
                                                                            className="text-micro font-bold text-primary hover:text-primary transition-colors"
                                                                        >رد</button>
                                                                        {(isAdmin || currentUser?.id === node.comment.authorId) && (
                                                                             <button onClick={() => handleDeleteComment(post.id, node.comment.id)} className="text-micro font-bold text-error hover:text-error transition-colors">حذف</button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Replies */}
                                                        {node.replies.length > 0 && (
                                                            <div className="pr-7 space-y-2 border-r-2 border-primary dark:border-primary/30 mr-3">
                                                                {node.replies.map((replyNode) => (
                                                                    <div key={replyNode.comment.id} className="flex gap-2">
                                                                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--bg-primary-light)] to-[var(--bg-primary-soft)] dark:from-[var(--bg-primary-active)]/30 dark:to-[var(--bg-primary-active)]/20 flex items-center justify-center font-bold text-primary text-micro shrink-0 border border-primary/50 dark:border-primary/30">
                                                                            {(replyNode.comment.authorName?.[0] || '').toUpperCase()}
                                                                        </div>
                                                                        <div className="flex-1 bg-white dark:bg-primary-active rounded-xl p-2.5 shadow-sm border border-border dark:border-border/50">
                                                                            <div className="flex justify-between items-center mb-0.5">
                                                                                <h5 className="text-micro font-bold text-main dark:text-on-primary">{replyNode.comment.authorName}</h5>
                                                                                <span className="text-micro text-muted">{formatDistanceToNow(new Date(replyNode.comment.created_at) > new Date() ? new Date() : new Date(replyNode.comment.created_at), { addSuffix: true, locale: ar })}</span>
                                                                            </div>
                                                                            <p className="text-micro text-muted dark:text-dim leading-relaxed">{replyNode.comment.content}</p>
                                                                            {(isAdmin || currentUser?.id === replyNode.comment.authorId) && (
                                                                                <button onClick={() => handleDeleteComment(post.id, replyNode.comment.id)} className="mt-1 text-micro font-bold text-error hover:text-error transition-colors">حذف</button>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Add Comment Input */}
                                            <div className="flex gap-3 items-center pt-3 border-t border-border dark:border-border/50">
                                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--bg-primary-light)] to-[var(--bg-primary-soft)] dark:from-[var(--bg-primary-active)]/30 dark:to-[var(--bg-primary-active)]/20 flex items-center justify-center shrink-0 border-2 border-primary/50 dark:border-primary/30">
                                                    <User size={14} className="text-primary dark:text-primary" />
                                                </div>
                                                <div className="flex-1 relative">
                                                    <input 
                                                        id={`comment-input-${post.id}`}
                                                        type="text"
                                                        value={commentTexts[post.id] || ''}
                                                        onChange={(e) => setCommentTexts((prev) => ({ ...prev, [post.id]: e.target.value }))}
                                                        placeholder="اكتب رداً على هذا المنشور..."
                                                        className="w-full bg-white dark:bg-primary-active rounded-full pl-10 pr-4 py-2.5 text-xs font-medium text-main dark:text-on-primary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all border border-border dark:border-border placeholder:text-muted"
                                                        onKeyDown={(e) => { if(e.key === 'Enter') handleAddComment(post.id); }}
                                                    />
                                                    <button
                                                        onClick={() => handleAddComment(post.id)}
                                                        disabled={!(commentTexts[post.id] || '').trim()}
                                                        className="absolute left-1 top-1/2 -translate-y-1/2 w-7 h-7 bg-gradient-to-l from-[var(--bg-primary)] to-[var(--bg-primary)] hover:from-[var(--bg-primary-hover)] hover:to-[var(--bg-primary)] text-on-primary flex items-center justify-center rounded-full transition-all disabled:opacity-30 active:scale-90"
                                                    >
                                                        <Send size={11} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Admin Quick Review Bar */}
                                    {isAdmin && post.status === 'pending' && (
                                        <div className="p-3.5 bg-warning-light dark:bg-warning/10 rounded-b-3xl border-t border-warning dark:border-warning/20 flex justify-between items-center">
                                            <div className="flex items-center gap-2 text-warning dark:text-warning">
                                                <AlertTriangle size={13} />
                                                <span className="text-micro font-bold">هذا المنشور ينتظر الموافقة</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleUpdateStatus(post.id, 'approved')} className="bg-success hover:bg-success text-on-primary px-3.5 py-1.5 text-micro font-bold rounded-full transition-all active:scale-95">موافقة</button>
                                                <button onClick={() => handleDeletePost(post.id)} className="bg-error hover:bg-error text-on-primary px-3.5 py-1.5 text-micro font-bold rounded-full transition-all active:scale-95">حذف</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ════════ HELP / GUIDELINES ════════ */}
            <div className="max-w-[700px] mx-auto px-4 mt-10 mb-8">
                <div className="bg-gradient-to-l from-[var(--bg-primary)] to-[var(--bg-primary)] rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden shadow-xl shadow-primary/30">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 -translate-y-12 translate-x-12 rotate-45 rounded-3xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-[40px] pointer-events-none" />
                    <div className="relative z-10 text-center md:text-right">
                        <h4 className="text-on-primary font-black text-base mb-1">إرشادات المنتدى</h4>
                        <p className="text-primary text-xs font-medium">يرجى الالتزام بسياسات النشر واحترام آراء الآخرين</p>
                    </div>
                    <button onClick={() => alert('يرجى الالتزام بسياسات النشر واحترام آراء الآخرين.\n\nالممنوع:\n• الإساءة والمحتوى المسيء\n• الترويج\n• نشر معلومات شخصية')} className="relative z-10 bg-white text-primary px-6 py-2.5 text-xs font-bold rounded-full hover:bg-primary-soft transition-all shadow-lg active:scale-95">
                        عرض الإرشادات
                    </button>
                </div>
            </div>
            </div>
        </div>
    );
};

