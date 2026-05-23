import { useState, useEffect, useCallback } from 'react';
import { MessageSquare, ThumbsUp, Send, MoreHorizontal, AlertTriangle, Sparkles, User, ShieldCheck, Clock, Trash2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useCurrentUser, useShowNotification } from '../context/AppContext';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from '../lib/utils';

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

    const fetchPosts = useCallback(async () => {
        try {
            setLoading(true);
            const data = await api.get<Post[]>('/forum');
            setPosts(data);
        } catch (error) {
            console.error('Error fetching forum posts:', error);
            showNotification('›‘·  Õ„Ì· «·„‰‘Ê—« ', 'error');
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
            showNotification(data.message || ' „ ‰‘— «·„‰‘Ê— »‰Ã«Õ', 'success');
            setNewPostContent('');
            fetchPosts();
        } catch (error) {
            console.error(error);
            showNotification('›‘· ‰‘— «·„‰‘Ê—', 'error');
        }
    };

    const handleVote = async (postId: string, type: 'upvote' | 'downvote') => {
        try {
            const data = await api.post<{ upvotes: number; downvotes: number }>(`/forum/${postId}/vote`, { type });
            setPosts(posts.map((p: Post) => p.id === postId ? { ...p, upvotes: data.upvotes, downvotes: data.downvotes } : p));
        } catch (error) {
            console.error(error);
            showNotification('›‘· «· ›«⁄· «·„—ÃÊ «·„Õ«Ê·… ·«Õﬁ«', 'error');
        }
    };

    const handleUpdateStatus = async (postId: string, status: 'approved' | 'rejected') => {
        try {
            await api.patch(`/forum/${postId}/status`, { status });
            showNotification(' „  ÕœÌÀ Õ«·… «·„‰‘Ê—', 'success');
            fetchPosts();
        } catch (error) {
            console.error(error);
            showNotification('›‘·  ÕœÌÀ «·Õ«·…', 'error');
        }
    };

    const handleDeletePost = async (postId: string) => {
        if (!window.confirm('Â· √‰  „ √ﬂœ „‰ Õ–› Â–« «·„‰‘Ê—ø')) return;
        try {
            await api.delete(`/forum/${postId}`);
            showNotification(' „ Õ–› «·„‰‘Ê— »‰Ã«Õ', 'success');
            fetchPosts();
        } catch (error) {
            console.error(error);
            showNotification('›‘· «·Õ–›', 'error');
        }
    };

    const toggleComments = async (postId: string) => {
        if (!viewingComments[postId]) {
            try {
                const data = await api.get<Comment[]>(`/forum/${postId}/comments`);
                setPosts(posts.map((p: Post) => p.id === postId ? { ...p, comments: data } : p));
            } catch (error) {
                console.error(error);
                showNotification('›‘·  Õ„Ì· «· ⁄·Ìﬁ« ', 'error');
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
            showNotification(' „ ≈÷«›… «· ⁄·Ìﬁ »‰Ã«Õ', 'success');
            const data = await api.get<Comment[]>(`/forum/${postId}/comments`);
            setPosts(posts.map((p: Post) => p.id === postId ? { ...p, comments: data } : p));
        } catch (error) {
            console.error(error);
            showNotification('›‘· ≈÷«›… «· ⁄·Ìﬁ', 'error');
        }
    };
    
    const handleDeleteComment = async (postId: string, commentId: string) => {
        if(!window.confirm('Â· √‰  „ √ﬂœ „‰ Õ–› Â–« «· ⁄·Ìﬁø')) return;
        try {
            await api.delete(`/forum/comments/${commentId}`);
            showNotification(' „ Õ–› «· ⁄·Ìﬁ »‰Ã«Õ', 'success');
            const data = await api.get<Comment[]>(`/forum/${postId}/comments`);
            setPosts(posts.map((p: Post) => p.id === postId ? { ...p, comments: data } : p));
        } catch (err) {
            console.error(err);
            showNotification('›‘· Õ–› «· ⁄·Ìﬁ', 'error');
        }
    };

    const handleReport = async (postId: string) => {
        try {
            await api.post(`/forum/${postId}/report`);
            showNotification(' „ ≈—”«· «· »·Ì€ ··≈œ«—… ··„—«Ã⁄…', 'info');
        } catch (error) {
            console.error(error);
            showNotification('›‘· ≈—”«· «· »·Ì€', 'error');
        }
    };

    return (
        <div className="min-h-full overflow-x-hidden relative bg-gradient-to-br from-slate-50 via-white to-purple-50/30 dark:from-[#020617] dark:via-slate-950 dark:to-purple-950/20 pb-20 md:animate-in md:fade-in md:duration-700 font-dash" dir="rtl">
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #6366f1 1px, transparent 0)', backgroundSize: '40px 40px' }} />
            <div className="relative z-10">

            {/* ?? Header ?? */}
            <div className="relative overflow-hidden bg-gradient-to-br from-purple-900 via-purple-800 to-slate-900 dark:from-slate-950 dark:via-purple-950 dark:to-slate-950 rounded-none md:rounded-none shadow-sm shadow-purple-500/15 border border-white/5 px-6 md:px-8 py-6 mx-0 md:mx-6 mt-0 md:mt-6 mb-6">
                <div className="absolute -top-20 -right-20 w-80 h-80 bg-indigo-400/20 rounded-full blur-[100px] pointer-events-none" />
                <div className="max-w-3xl mx-auto flex flex-col items-center text-center relative z-10">
                    <div className="w-12 h-12 bg-white/10  rounded-none flex items-center justify-center mb-4 border border-white/10 shadow-sm">
                        <Sparkles size={24} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-medium text-white uppercase tracking-tighter mb-2">„‰ œÏ œ«—Ì‰</h1>
                    <p className="text-xs text-white/80 font-normal uppercase tracking-widest leading-relaxed max-w-md">
                        „”«Õ ﬂ «·Œ«’… ··‰ﬁ«‘° «· ⁄·„° Ê„‘«—ﬂ… «·„⁄—›… „⁄ “„·«∆ﬂ Ê„⁄·„Ìﬂ ›Ì »Ì∆…  ⁄·Ì„Ì… ¬„‰….
                    </p>
                </div>
            </div>

            <div className="max-w-[700px] mx-auto px-4 space-y-6">
                
                {/* ??? Post Creation Area */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                    <div className="flex gap-4 items-start">
                        <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-none flex items-center justify-center shrink-0">
                            <User size={20} className="text-slate-400" />
                        </div>
                        <div className="flex-1 space-y-3">
                            <textarea
                                value={newPostContent}
                                onChange={(e) => setNewPostContent(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-4 min-h-[100px] text-sm font-normal text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-400"
                                placeholder="„«–« ÌœÊ— ›Ì –Â‰ﬂ «·ÌÊ„ø"
                            />
                            <div className="flex justify-between items-center">
                                <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1.5 uppercase">
                                    <ShieldCheck size={12} /> „Õ ÊÏ „—«ﬁ» „‰ ﬁ»· «·≈œ«—…
                                </p>
                                <button
                                    onClick={handleCreatePost}
                                    disabled={!newPostContent.trim()}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 text-[11px] font-medium uppercase tracking-widest disabled:opacity-30 transition-all flex items-center gap-2"
                                >
                                    <Send size={14} /> ‰‘— «·„‰‘Ê—
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ?? Posts Feed */}
                {loading ? (
                    <div className="space-y-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white dark:bg-slate-900 h-48 animate-pulse border border-slate-200 dark:border-slate-800"></div>
                        ))}
                    </div>
                ) : posts.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 p-16 text-center">
                        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-slate-700">
                            <MessageSquare size={24} className="text-slate-300" />
                        </div>
                        <p className="text-sm font-medium text-slate-400 uppercase tracking-widest">·«  ÊÃœ „‰‘Ê—«  Õ Ï «·¬‰</p>
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
                                        "bg-white dark:bg-slate-900 border transition-all duration-500 group",
                                        isHighlighted 
                                            ? "border-indigo-500 ring-4 ring-indigo-500/5 shadow-sm" 
                                            : "border-slate-200 dark:border-slate-800 shadow-sm"
                                    )}
                                >
                                    {/* Post Header */}
                                    <div className="p-4 md:p-6 flex justify-between items-start">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-none border border-indigo-100 dark:border-indigo-800 flex items-center justify-center font-medium text-indigo-600 text-xs">
                                                {post.authorName[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <h4 className="font-medium text-slate-800 dark:text-white text-sm tracking-tight">{post.authorName}</h4>
                                                    <span className={cn(
                                                        "text-[9px] font-medium px-1.5 py-0.5 uppercase tracking-tighter",
                                                        post.authorRole === 'admin' ? "bg-rose-50 text-rose-600 border border-rose-100" :
                                                        post.authorRole === 'teacher' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                                                        "bg-blue-50 text-blue-600 border border-blue-100"
                                                    )}>
                                                        {post.authorRole === 'admin' ? '«·≈œ«—…' : post.authorRole === 'teacher' ? '„⁄·„' : 'ÿ«·»'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium uppercase tracking-widest">
                                                    <Clock size={10} />
                                                    <span>{formatDistanceToNow(new Date(post.created_at) > new Date() ? new Date() : new Date(post.created_at), { addSuffix: true, locale: ar })}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {isAdmin && (
                                                <button 
                                                    onClick={() => handleDeletePost(post.id)}
                                                    className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                                                    title="Õ–› «·„‰‘Ê—"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                            <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
                                                <MoreHorizontal size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Post Body */}
                                    <div className="px-2 pb-6">
                                        <p className="text-slate-700 dark:text-slate-300 text-sm md:text-base font-medium leading-[1.8] whitespace-pre-wrap">
                                            {post.content}
                                        </p>
                                    </div>

                                    {/* Action Bar */}
                                    <div className="px-2 md:px-4 py-2 flex border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                                        <button 
                                            onClick={() => handleVote(post.id, 'upvote')}
                                            className={cn(
                                                "flex-1 py-3 flex items-center justify-center gap-2.5 text-[11px] font-medium transition-all uppercase tracking-widest active:scale-95",
                                                isLiked ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"
                                            )}
                                        >
                                            <ThumbsUp size={16} className={cn(isLiked && "fill-current")} />
                                            <span>√⁄Ã»‰Ì</span>
                                        </button>
                                        <button 
                                            onClick={() => toggleComments(post.id)}
                                            className="flex-1 py-3 flex items-center justify-center gap-2.5 text-[11px] font-medium text-slate-400 hover:text-slate-600 transition-all uppercase tracking-widest active:scale-95 border-x border-slate-100 dark:border-slate-800"
                                        >
                                            <MessageSquare size={16} />
                                            <span>{post.commentCount || 0}  ⁄·Ìﬁ</span>
                                        </button>
                                        <button 
                                            onClick={() => handleReport(post.id)}
                                            className="flex-1 py-3 flex items-center justify-center gap-2.5 text-[11px] font-medium text-rose-400 hover:text-rose-600 transition-all uppercase tracking-widest active:scale-95"
                                        >
                                            <AlertTriangle size={16} />
                                            <span>≈»·«€</span>
                                        </button>
                                    </div>

                                    {/* Comments Section */}
                                    {viewingComments[post.id] && (
                                        <div className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 p-4 md:p-6 space-y-6">
                                            <div className="space-y-4">
                                                {buildThreadedComments(post.comments || []).map((node) => (
                                                    <div key={node.comment.id} className="space-y-4">
                                                        {/* Main Comment */}
                                                        <div className="flex gap-4">
                                                            <div className="w-8 h-8 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center font-medium text-slate-400 text-[10px] shrink-0">
                                                                {node.comment.authorName[0].toUpperCase()}
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 border border-slate-100 dark:border-slate-700 relative">
                                                                    <div className="flex justify-between items-center mb-1.5">
                                                                        <h5 className="text-[11px] font-medium text-slate-800 dark:text-white uppercase tracking-tighter">{node.comment.authorName}</h5>
                                                                        <span className="text-[9px] text-slate-400 font-medium">{formatDistanceToNow(new Date(node.comment.created_at) > new Date() ? new Date() : new Date(node.comment.created_at), { addSuffix: true, locale: ar })}</span>
                                                                    </div>
                                                                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">{node.comment.content}</p>
                                                                    
                                                                    <div className="flex gap-4 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                                                                        <button 
                                                                            onClick={() => {
                                                                                const currentText = commentTexts[post.id] || '';
                                                                                const newText = `@${node.comment.authorName} ` + currentText;
                                                                                setCommentTexts((prev) => ({ ...prev, [post.id]: newText }));
                                                                                document.getElementById(`comment-input-${post.id}`)?.focus();
                                                                            }}
                                                                            className="text-[10px] font-medium text-indigo-500 uppercase tracking-widest hover:underline"
                                                                        >—œ</button>
                                                                        {(isAdmin || currentUser?.id === node.comment.authorId) && (
                                                                            <button onClick={() => handleDeleteComment(post.id, node.comment.id)} className="text-[10px] font-medium text-rose-500 uppercase tracking-widest hover:underline">Õ–›</button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Replies Container */}
                                                        {node.replies.length > 0 && (
                                                            <div className="pr-8 md:pr-12 space-y-4 border-r-2 border-slate-50 dark:border-slate-800 mr-4">
                                                                {node.replies.map((replyNode) => (
                                                                    <div key={replyNode.comment.id} className="flex gap-3">
                                                                        <div className="w-6 h-6 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center font-medium text-slate-300 text-[8px] shrink-0">
                                                                            {replyNode.comment.authorName[0].toUpperCase()}
                                                                        </div>
                                                                        <div className="flex-1 bg-slate-50/50 dark:bg-slate-800/30 p-3 border border-slate-100/50 dark:border-slate-700/50">
                                                                            <div className="flex justify-between items-center mb-1">
                                                                                <h5 className="text-[10px] font-medium text-slate-800 dark:text-white">{replyNode.comment.authorName}</h5>
                                                                                <span className="text-[8px] text-slate-400">{formatDistanceToNow(new Date(replyNode.comment.created_at) > new Date() ? new Date() : new Date(replyNode.comment.created_at), { addSuffix: true, locale: ar })}</span>
                                                                            </div>
                                                                            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">{replyNode.comment.content}</p>
                                                                            {(isAdmin || currentUser?.id === replyNode.comment.authorId) && (
                                                                                <button onClick={() => handleDeleteComment(post.id, replyNode.comment.id)} className="mt-2 text-[9px] font-medium text-rose-500 uppercase hover:underline">Õ–›</button>
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
                                            <div className="flex gap-4 items-center pt-4 border-t border-slate-100 dark:border-slate-800">
                                                <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center font-medium text-slate-400 text-xs shrink-0">
                                                    <User size={16} />
                                                </div>
                                                <div className="flex-1 relative">
                                                    <input 
                                                        id={`comment-input-${post.id}`}
                                                        type="text"
                                                        value={commentTexts[post.id] || ''}
                                                        onChange={(e) => setCommentTexts((prev) => ({ ...prev, [post.id]: e.target.value }))}
                                                        placeholder="‘«—ﬂ »—√Ìﬂ ›Ì Â–« «·„Ê÷Ê⁄..."
                                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-12 pr-4 py-3 text-xs font-normal text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 transition-all"
                                                        onKeyDown={(e) => { if(e.key === 'Enter') handleAddComment(post.id); }}
                                                    />
                                                    <button
                                                        onClick={() => handleAddComment(post.id)}
                                                        disabled={!(commentTexts[post.id] || '').trim()}
                                                        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition-all disabled:opacity-30"
                                                    >
                                                        <Send size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Admin Quick Review Bar */}
                                    {isAdmin && post.status === 'pending' && (
                                        <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border-t border-amber-200 flex justify-between items-center">
                                            <div className="flex items-center gap-2 text-amber-700">
                                                <AlertTriangle size={14} />
                                                <span className="text-[10px] font-medium uppercase tracking-widest">Â–« «·„‰‘Ê— »«‰ Ÿ«— «·„—«Ã⁄… «·≈œ«—Ì…</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleUpdateStatus(post.id, 'approved')} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 text-[9px] font-medium uppercase tracking-widest transition-all">„Ê«›ﬁ…</button>
                                                <button onClick={() => handleDeletePost(post.id)} className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-1.5 text-[9px] font-medium uppercase tracking-widest transition-all">—›÷</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ?? Help / Guidelines ?? */}
            <div className="max-w-[700px] mx-auto px-4 mt-12 mb-8">
                <div className="bg-indigo-600 p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 -translate-y-16 translate-x-16 rotate-45 pointer-events-none"></div>
                    <div className="relative z-10 text-center md:text-right">
                        <h4 className="text-white font-medium text-lg mb-1 uppercase tracking-tighter">Â· ·œÌﬂ ”ƒ«·  ⁄·Ì„Ìø</h4>
                        <p className="text-indigo-100 text-[11px] font-medium uppercase tracking-widest">«ÿ—Õ ”ƒ«·ﬂ Â‰« Ê”Ì „ «·≈Ã«»… ⁄·ÌÂ „‰ ﬁ»· «·„⁄·„Ì‰ Ê«·“„·«¡</p>
                    </div>
                    <button className="relative z-10 bg-white text-indigo-600 px-8 py-3 text-[11px] font-medium uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-sm shadow-indigo-900/20">
                        ﬁÊ«⁄œ «·„‰ œÏ
                    </button>
                </div>
            </div>
            </div>
        </div>
    );
};

