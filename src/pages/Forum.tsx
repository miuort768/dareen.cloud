import { useState, useEffect } from 'react';
import { MessageSquare, ThumbsUp, Send, MoreHorizontal, AlertTriangle, Sparkles, User, ShieldCheck, Clock, Trash2, CheckCircle2, TrendingUp, Users, Hash, Plus } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useApp } from '../context/AppContext';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

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
    const { currentUser, showNotification } = useApp();
    const isAdmin = currentUser?.role === 'admin';
    const [searchParams] = useSearchParams();
    const highlightedPostId = searchParams.get('postId');
    
    const [posts, setPosts] = useState<Post[]>([]);
    const [newPostContent, setNewPostContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [commentTexts, setCommentTexts] = useState<Record<string, string>>({});
    const [viewingComments, setViewingComments] = useState<Record<string, boolean>>({});

    const fetchPosts = async () => {
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
    };

    useEffect(() => {
        fetchPosts();
    }, []);

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
            const data = await api.post<any>('/forum', { content: newPostContent });
            showNotification(data.message || 'تم نشر المنشور بنجاح', 'success');
            setNewPostContent('');
            fetchPosts();
        } catch (error) {
            console.error(error);
            showNotification('فشل نشر المنشور', 'error');
        }
    };

    const handleVote = async (postId: string, type: 'upvote' | 'downvote') => {
        try {
            const data = await api.post<any>(`/forum/${postId}/vote`, { type });
            setPosts(posts.map((p: Post) => p.id === postId ? { ...p, upvotes: data.upvotes, downvotes: data.downvotes } : p));
        } catch (error) {
            console.error(error);
            showNotification('فشل التفاعل المرجو المحاولة لاحقاً', 'error');
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
        if (!window.confirm('هل أنت متأكد من حذف هذا المنشور؟')) return;
        try {
            await api.delete(`/forum/${postId}`);
            showNotification('تم حذف المنشور بنجاح', 'success');
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
                showNotification('فشل تحميل التعليقات', 'error');
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
            showNotification('تم إضافة التعليق بنجاح', 'success');
            const data = await api.get<Comment[]>(`/forum/${postId}/comments`);
            setPosts(posts.map((p: Post) => p.id === postId ? { ...p, comments: data } : p));
        } catch (error) {
            console.error(error);
            showNotification('فشل إضافة التعليق', 'error');
        }
    };
    
    const handleDeleteComment = async (postId: string, commentId: string) => {
        if(!window.confirm('هل أنت متأكد من حذف هذا التعليق؟')) return;
        try {
            await api.delete(`/forum/comments/${commentId}`);
            showNotification('تم حذف التعليق بنجاح', 'success');
            const data = await api.get<Comment[]>(`/forum/${postId}/comments`);
            setPosts(posts.map((p: Post) => p.id === postId ? { ...p, comments: data } : p));
        } catch (err) {
            console.error(err);
            showNotification('فشل حذف التعليق', 'error');
        }
    };

    const handleReport = async (postId: string) => {
        try {
            await api.post(`/forum/${postId}/report`);
            showNotification('تم إرسال التبليغ للإدارة للمراجعة', 'info');
        } catch (error) {
            console.error(error);
            showNotification('فشل إرسال التبليغ', 'error');
        }
    };

    return (
        <div className="min-h-full bg-slate-50 dark:bg-[#020617] pb-20 relative overflow-hidden font-sans" dir="rtl">
            {/* Background Sharp Accents */}
            <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

            {/* ── Header Section ── */}
            <div className="relative pt-12 pb-20 px-4 md:px-6">
                <div className="max-w-5xl mx-auto flex flex-col items-center text-center">
                    <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-16 h-16 bg-white dark:bg-slate-900 shadow-2xl rounded-2xl flex items-center justify-center mb-6 border border-slate-100 dark:border-white/10 relative group"
                    >
                        <div className="absolute inset-0 bg-indigo-600/20 rounded-2xl blur-xl group-hover:bg-indigo-600/30 transition-all duration-500" />
                        <Sparkles size={32} className="text-indigo-600 relative z-10" />
                    </motion.div>
                    
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                    >
                        <h1 className="text-4xl md:text-5xl font-heading font-black text-slate-900 dark:text-white tracking-tighter mb-4">
                            منتدى <span className="text-indigo-600 dark:text-indigo-400">دارين</span>
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.3em] max-w-lg mx-auto">
                            مساحتك الخاصة للتعاون، المعرفة، وبناء المستقبل
                        </p>
                    </motion.div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
                
                {/* ── Left Sidebar (Desktop Only) ── */}
                <div className="hidden lg:block lg:col-span-3 space-y-6">
                    <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-6 shadow-xl shadow-black/5 rounded-none">
                        <h3 className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <TrendingUp size={14} /> المواضيع الرائجة
                        </h3>
                        <div className="space-y-4">
                            {['استفسارات القدرات', 'مراجعات الفصل الثاني', 'مسابقة المتفوقين'].map((tag, i) => (
                                <div key={i} className="flex items-center gap-3 group cursor-pointer">
                                    <div className="w-8 h-8 bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-xs font-black text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">#{i+1}</div>
                                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 group-hover:text-indigo-500 transition-colors">{tag}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10 text-white">
                            <Users size={24} className="mb-4 opacity-50" />
                            <h4 className="text-sm font-black mb-1">مجتمع متفاعل</h4>
                            <p className="text-[10px] opacity-80 leading-relaxed font-bold uppercase tracking-wider">شارك خبراتك وساعد زملائك في رحلتهم التعليمية</p>
                        </div>
                    </div>
                </div>

                {/* ── Main Content Area ── */}
                <div className="lg:col-span-6 space-y-8">
                    
                    {/* 🖊️ Post Creation Area */}
                    <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white dark:bg-slate-900/40 backdrop-blur-md border-2 border-indigo-600 shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-600/5 -translate-x-16 -translate-y-16 rotate-45 pointer-events-none" />
                        
                        <div className="p-6 md:p-8">
                            <div className="flex gap-4 items-start">
                                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-none flex items-center justify-center shrink-0 border border-slate-200 dark:border-white/5 relative">
                                    <User size={24} className="text-slate-400" />
                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
                                </div>
                                <div className="flex-1 space-y-4">
                                    <textarea
                                        value={newPostContent}
                                        onChange={(e) => setNewPostContent(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-800/50 border-none p-4 min-h-[120px] text-sm md:text-base font-bold text-slate-800 dark:text-white focus:ring-0 transition-all placeholder:text-slate-400 resize-none"
                                        placeholder="ماذا يدور في ذهنك اليوم؟ شارك أفكارك..."
                                    />
                                    <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 text-slate-400 hover:text-indigo-600 cursor-pointer transition-colors"><Hash size={20} /></div>
                                            <p className="text-[10px] text-slate-400 font-black flex items-center gap-2 uppercase tracking-tighter">
                                                <ShieldCheck size={14} className="text-indigo-500" /> محتوى مراقب
                                            </p>
                                        </div>
                                        <button
                                            onClick={handleCreatePost}
                                            disabled={!newPostContent.trim()}
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/20 active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none"
                                        >
                                            نشر المنشور
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* 📱 Posts Feed */}
                    <AnimatePresence mode="popLayout">
                        {loading ? (
                            <div className="space-y-6">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="bg-white dark:bg-slate-900 h-64 animate-pulse border border-slate-200 dark:border-white/5"></div>
                                ))}
                            </div>
                        ) : posts.length === 0 ? (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-white dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-white/10 p-20 text-center"
                            >
                                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100 dark:border-white/5">
                                    <MessageSquare size={32} className="text-slate-300" />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">المنتدى فارغ حالياً</h3>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">كن أول من يشارك زملاءه اليوم</p>
                            </motion.div>
                        ) : (
                            <div className="space-y-8">
                                {posts.map((post: Post, index) => {
                                    const isLiked = post.upvotes.includes(currentUser?.id || '');
                                    const isHighlighted = post.id === highlightedPostId;

                                    return (
                                        <motion.div 
                                            key={post.id} 
                                            id={`post-${post.id}`}
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: index * 0.1 }}
                                            className={cn(
                                                "bg-white dark:bg-slate-900/60 backdrop-blur-xl border shadow-2xl transition-all duration-500 group relative overflow-hidden",
                                                isHighlighted 
                                                    ? "border-indigo-500 ring-4 ring-indigo-500/10 scale-[1.02] z-20" 
                                                    : "border-slate-200 dark:border-white/5"
                                            )}
                                        >
                                            {/* Accent Gradient Line */}
                                            <div className={cn(
                                                "absolute top-0 inset-x-0 h-1 bg-gradient-to-r",
                                                post.authorRole === 'admin' ? "from-rose-500 to-orange-500" :
                                                post.authorRole === 'teacher' ? "from-emerald-500 to-indigo-500" :
                                                "from-indigo-600 to-purple-600"
                                            )} />

                                            {/* Post Header */}
                                            <div className="p-6 md:p-8 flex justify-between items-start">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-12 h-12 bg-white dark:bg-slate-800 shadow-lg border border-slate-100 dark:border-white/10 flex items-center justify-center font-black text-indigo-600 text-sm">
                                                        {post.authorName[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-3 mb-1">
                                                            <h4 className="font-black text-slate-900 dark:text-white text-base tracking-tight">{post.authorName}</h4>
                                                            <span className={cn(
                                                                "text-[9px] font-black px-2 py-0.5 uppercase tracking-widest border",
                                                                post.authorRole === 'admin' ? "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-500/10 dark:border-rose-500/20" :
                                                                post.authorRole === 'teacher' ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20" :
                                                                "bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-500/10 dark:border-indigo-500/20"
                                                            )}>
                                                                {post.authorRole === 'admin' ? 'الإدارة' : post.authorRole === 'teacher' ? 'معلم' : 'طالب'}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-black uppercase tracking-widest">
                                                            <Clock size={12} className="text-indigo-500" />
                                                            <span>{formatDistanceToNow(new Date(post.created_at) > new Date() ? new Date() : new Date(post.created_at), { addSuffix: true, locale: ar })}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    {isAdmin && (
                                                        <button 
                                                            onClick={() => handleDeletePost(post.id)}
                                                            className="p-3 text-slate-400 hover:text-rose-500 transition-colors bg-slate-50 dark:bg-slate-800/50 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                                                            title="حذف المنشور"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    )}
                                                    <button className="p-3 text-slate-400 hover:text-indigo-600 transition-colors bg-slate-50 dark:bg-slate-800/50">
                                                        <MoreHorizontal size={18} />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Post Body */}
                                            <div className="px-6 md:px-8 pb-8">
                                                <p className="text-slate-700 dark:text-slate-200 text-base md:text-lg font-medium leading-relaxed whitespace-pre-wrap">
                                                    {post.content}
                                                </p>
                                            </div>

                                            {/* Action Bar */}
                                            <div className="grid grid-cols-3 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-800/20 backdrop-blur-sm">
                                                <button 
                                                    onClick={() => handleVote(post.id, 'upvote')}
                                                    className={cn(
                                                        "py-5 flex items-center justify-center gap-3 text-[11px] font-black transition-all uppercase tracking-[0.2em] border-l border-slate-100 dark:border-white/5",
                                                        isLiked ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50/30 dark:bg-indigo-500/5" : "text-slate-400 hover:text-indigo-600 hover:bg-white dark:hover:bg-slate-800/50"
                                                    )}
                                                >
                                                    <ThumbsUp size={18} className={cn(isLiked && "fill-current animate-bounce")} />
                                                    <span>تفاعل</span>
                                                </button>
                                                <button 
                                                    onClick={() => toggleComments(post.id)}
                                                    className="py-5 flex items-center justify-center gap-3 text-[11px] font-black text-slate-400 hover:text-indigo-600 hover:bg-white dark:hover:bg-slate-800/50 transition-all uppercase tracking-[0.2em] border-l border-slate-100 dark:border-white/5"
                                                >
                                                    <MessageSquare size={18} />
                                                    <span>{post.commentCount || 0} تعليق</span>
                                                </button>
                                                <button 
                                                    onClick={() => handleReport(post.id)}
                                                    className="py-5 flex items-center justify-center gap-3 text-[11px] font-black text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/5 transition-all uppercase tracking-[0.2em]"
                                                >
                                                    <AlertTriangle size={18} />
                                                    <span>إبلاغ</span>
                                                </button>
                                            </div>

                                            {/* Comments Section */}
                                            <AnimatePresence>
                                                {viewingComments[post.id] && (
                                                    <motion.div 
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="bg-white dark:bg-[#030712] border-t border-slate-100 dark:border-white/5 p-6 md:p-8 space-y-8 overflow-hidden"
                                                    >
                                                        <div className="space-y-6">
                                                            {buildThreadedComments(post.comments || []).map((node) => (
                                                                <div key={node.comment.id} className="space-y-6">
                                                                    {/* Main Comment */}
                                                                    <div className="flex gap-5 group/comment">
                                                                        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/5 flex items-center justify-center font-black text-slate-400 text-xs shrink-0">
                                                                            {node.comment.authorName[0].toUpperCase()}
                                                                        </div>
                                                                        <div className="flex-1">
                                                                            <div className="bg-slate-50 dark:bg-slate-800/40 p-5 border border-slate-200 dark:border-white/5 relative group-hover/comment:border-indigo-500/30 transition-all duration-300">
                                                                                <div className="flex justify-between items-center mb-2">
                                                                                    <div className="flex items-center gap-2">
                                                                                        <h5 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tighter">{node.comment.authorName}</h5>
                                                                                        {node.comment.authorRole !== 'student' && <CheckCircle2 size={12} className="text-indigo-500" />}
                                                                                    </div>
                                                                                    <span className="text-[10px] text-slate-400 font-black tracking-widest">{formatDistanceToNow(new Date(node.comment.created_at) > new Date() ? new Date() : new Date(node.comment.created_at), { addSuffix: true, locale: ar })}</span>
                                                                                </div>
                                                                                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-bold">{node.comment.content}</p>
                                                                                
                                                                                <div className="flex gap-6 mt-4 pt-4 border-t border-slate-200/50 dark:border-white/5">
                                                                                    <button 
                                                                                        onClick={() => {
                                                                                            const currentText = commentTexts[post.id] || '';
                                                                                            const newText = `@${node.comment.authorName} ` + currentText;
                                                                                            setCommentTexts((prev) => ({ ...prev, [post.id]: newText }));
                                                                                            document.getElementById(`comment-input-${post.id}`)?.focus();
                                                                                        }}
                                                                                        className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest hover:underline"
                                                                                    >رد على التعليق</button>
                                                                                    {(isAdmin || currentUser?.id === node.comment.authorId) && (
                                                                                        <button onClick={() => handleDeleteComment(post.id, node.comment.id)} className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:underline">إزالة</button>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* Replies Container */}
                                                                    {node.replies.length > 0 && (
                                                                        <div className="pr-12 md:pr-16 space-y-4 border-r-2 border-indigo-600/10 dark:border-indigo-500/10 mr-4">
                                                                            {node.replies.map((replyNode) => (
                                                                                <div key={replyNode.comment.id} className="flex gap-4">
                                                                                    <div className="w-8 h-8 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 flex items-center justify-center font-black text-slate-400 text-[10px] shrink-0">
                                                                                        {replyNode.comment.authorName[0].toUpperCase()}
                                                                                    </div>
                                                                                    <div className="flex-1 bg-slate-50/50 dark:bg-slate-800/20 p-4 border border-slate-200/50 dark:border-white/5">
                                                                                        <div className="flex justify-between items-center mb-1.5">
                                                                                            <h5 className="text-[11px] font-black text-slate-800 dark:text-white">{replyNode.comment.authorName}</h5>
                                                                                            <span className="text-[9px] text-slate-400">{formatDistanceToNow(new Date(replyNode.comment.created_at) > new Date() ? new Date() : new Date(replyNode.comment.created_at), { addSuffix: true, locale: ar })}</span>
                                                                                        </div>
                                                                                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-bold">{replyNode.comment.content}</p>
                                                                                        {(isAdmin || currentUser?.id === replyNode.comment.authorId) && (
                                                                                            <button onClick={() => handleDeleteComment(post.id, replyNode.comment.id)} className="mt-3 text-[9px] font-black text-rose-500 uppercase hover:underline">إزالة</button>
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
                                                        <div className="flex gap-5 items-center pt-8 border-t border-slate-100 dark:border-white/5">
                                                            <div className="w-12 h-12 bg-white dark:bg-slate-800 border-2 border-indigo-600 flex items-center justify-center font-black text-indigo-600 text-xs shrink-0 shadow-lg">
                                                                <Plus size={20} />
                                                            </div>
                                                            <div className="flex-1 relative">
                                                                <input 
                                                                    id={`comment-input-${post.id}`}
                                                                    type="text"
                                                                    value={commentTexts[post.id] || ''}
                                                                    onChange={(e) => setCommentTexts((prev) => ({ ...prev, [post.id]: e.target.value }))}
                                                                    placeholder="اكتب تعليقك هنا..."
                                                                    className="w-full bg-slate-100 dark:bg-slate-800 border-none px-6 py-4 text-xs md:text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-600 transition-all placeholder:text-slate-400"
                                                                    onKeyDown={(e) => { if(e.key === 'Enter') handleAddComment(post.id); }}
                                                                />
                                                                <button
                                                                    onClick={() => handleAddComment(post.id)}
                                                                    disabled={!(commentTexts[post.id] || '').trim()}
                                                                    className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition-all disabled:opacity-30 shadow-lg shadow-indigo-600/30"
                                                                >
                                                                    <Send size={18} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>

                                            {/* Admin Quick Review Bar */}
                                            {isAdmin && post.status === 'pending' && (
                                                <div className="p-5 bg-amber-50 dark:bg-amber-900/10 border-t border-amber-200 dark:border-amber-500/20 flex flex-col md:flex-row justify-between items-center gap-4">
                                                    <div className="flex items-center gap-3 text-amber-700 dark:text-amber-400">
                                                        <AlertTriangle size={18} />
                                                        <span className="text-[11px] font-black uppercase tracking-widest">هذا المنشور يحتاج مراجعة فورية من الإدارة</span>
                                                    </div>
                                                    <div className="flex gap-3 w-full md:w-auto">
                                                        <button onClick={() => handleUpdateStatus(post.id, 'approved')} className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all">قبول</button>
                                                        <button onClick={() => handleDeletePost(post.id)} className="flex-1 md:flex-none bg-rose-600 hover:bg-rose-700 text-white px-8 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all">رفض</button>
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </AnimatePresence>
                </div>

                {/* ── Right Sidebar (Desktop Only) ── */}
                <div className="hidden lg:block lg:col-span-3 space-y-6">
                    <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-8 shadow-2xl relative overflow-hidden text-center">
                         <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShieldCheck size={32} className="text-indigo-600" />
                         </div>
                         <h4 className="text-sm font-black text-slate-900 dark:text-white mb-3 uppercase tracking-tighter">قوانين المشاركة</h4>
                         <p className="text-[10px] text-slate-500 leading-relaxed font-bold uppercase tracking-wider mb-6">
                            نحن نحرص على بيئة تعليمية آمنة ومحفزة للجميع. يرجى الالتزام بالاحترام المتبادل.
                         </p>
                         <button className="w-full py-3 border-2 border-indigo-600 text-indigo-600 text-[9px] font-black uppercase tracking-[0.3em] hover:bg-indigo-600 hover:text-white transition-all">
                            اقرأ المزيد
                         </button>
                    </div>

                    <div className="p-6 bg-slate-900 border border-white/5 relative group overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rotate-45 translate-x-12 -translate-y-12" />
                        <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4">إحصائيات اليوم</h4>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-slate-400">منشورات جديدة</span>
                                <span className="text-sm font-black text-white">+{posts.filter(p => new Date(p.created_at).toDateString() === new Date().toDateString()).length}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-slate-400">أعضاء نشطون</span>
                                <span className="text-sm font-black text-white">+{Math.floor(Math.random() * 50) + 20}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Mobile Floating Action Button (FAB) ── */}
            <div className="lg:hidden fixed bottom-8 left-8 z-[100]">
                <button 
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="w-14 h-14 bg-indigo-600 text-white rounded-none shadow-2xl flex items-center justify-center active:scale-90 transition-all border-b-4 border-indigo-800"
                >
                    <Plus size={24} />
                </button>
            </div>
        </div>
    );
};
