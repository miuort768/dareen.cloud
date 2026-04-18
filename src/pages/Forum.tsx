import { useState, useEffect } from 'react';
import { MessageSquare, ThumbsUp, Send, MoreHorizontal, AlertTriangle } from 'lucide-react';
import { api } from '../lib/api';
import { useApp } from '../context/AppContext';
import { formatDistanceToNow } from 'date-fns';
import { arEG } from 'date-fns/locale';
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

export const Forum = () => {
    const { currentUser, showNotification } = useApp();
    const isAdmin = currentUser?.role === 'admin';
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

    const handleCreatePost = async () => {
        if (!newPostContent.trim()) return;
        try {
            const data = await api.post<any>('/forum', { content: newPostContent });
            showNotification(data.message, 'success');
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
            setPosts(posts.map(p => p.id === postId ? { ...p, upvotes: data.upvotes, downvotes: data.downvotes } : p));
        } catch (error) {
            console.error(error);
            showNotification('فشل التصويت المرجو المحاولة لاحقا', 'error');
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
                setPosts(posts.map(p => p.id === postId ? { ...p, comments: data } : p));
            } catch (error) {
                console.error(error);
                showNotification('فشل تحميل التعليقات', 'error');
            }
        }
        setViewingComments(prev => ({ ...prev, [postId]: !prev[postId] }));
    };

    const handleAddComment = async (postId: string) => {
        const text = commentTexts[postId];
        if (!text || !text.trim()) return;

        try {
            await api.post(`/forum/${postId}/comments`, { content: text });
            setCommentTexts(prev => ({ ...prev, [postId]: '' }));
            showNotification('تم إضافة التعليق بنجاح', 'success');
            const data = await api.get<Comment[]>(`/forum/${postId}/comments`);
            setPosts(posts.map(p => p.id === postId ? { ...p, comments: data } : p));
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
            setPosts(posts.map(p => p.id === postId ? { ...p, comments: data } : p));
        } catch (err) {
            console.error(err);
            showNotification('فشل حذف التعليق', 'error');
        }
    };

    return (
        <div className="min-h-screen bg-[#f0f2f5] dark:bg-slate-950 pb-20 animate-in fade-in duration-500" dir="rtl">
            <div className="max-w-[680px] mx-auto pt-2 md:pt-6 space-y-4 -mx-4 md:mx-auto px-1 md:px-0 w-auto md:w-full">
                
                {/* 🖊️ Post Creation Box (FB Style) */}
                <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-3 md:p-4 shadow-sm md:rounded-lg">
                    <div className="flex gap-2 md:gap-3 items-center mb-3 md:mb-4">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0 overflow-hidden border border-slate-100">
                            <img src="/logo.png" alt="Dareen Logo" className="w-8 h-8 object-contain" />
                        </div>
                        <button 
                            onClick={() => document.getElementById('new-post-input')?.focus()}
                            className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-4 py-3 text-right text-slate-500 font-bold text-sm transition-colors border border-transparent"
                        >
                            بم تفكر يا {currentUser?.name?.split(' ')[0]}؟
                        </button>
                    </div>
                    <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                         <textarea
                            id="new-post-input"
                            value={newPostContent}
                            onChange={(e) => setNewPostContent(e.target.value)}
                            className="w-full bg-transparent border-none p-2 min-h-[60px] resize-none focus:ring-0 text-sm font-medium"
                            placeholder="شاركنا أفكارك..."
                        />
                        <div className="flex justify-end mt-2">
                             <button
                                onClick={handleCreatePost}
                                disabled={!newPostContent.trim()}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2 font-black text-xs uppercase tracking-widest disabled:opacity-30 disabled:grayscale transition-all"
                            >
                                <Send size={14} className="inline-block ml-2" />
                                نشر الآن
                            </button>
                        </div>
                    </div>
                </div>

                {/* 📱 Posts Feed */}
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white h-40 animate-pulse border border-slate-200"></div>
                        ))}
                    </div>
                ) : posts.length === 0 ? (
                    <div className="bg-white border-2 border-dashed border-slate-300 p-12 text-center text-slate-400 font-black uppercase tracking-widest">
                        لا توجد منشورات في الوقت الحالي
                    </div>
                ) : (
                    <div className="space-y-4">
                        {posts.map(post => {
                            const isLiked = post.upvotes.includes(currentUser?.id || '');

                            return (
                                <div key={post.id} className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-500 md:rounded-lg">
                                    {/* FB Header */}
                                    <div className="p-3 md:p-4 flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0 overflow-hidden border border-slate-100">
                                                <img src="/logo.png" alt="Dareen Logo" className="w-8 h-8 object-contain" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-black text-slate-900 dark:text-white text-sm hover:underline cursor-pointer">{post.authorName}</h4>
                                                    <span className={cn(
                                                        "text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tighter",
                                                        post.authorRole === 'admin' ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" :
                                                        post.authorRole === 'teacher' ? "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400" :
                                                        "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
                                                    )}>
                                                        {post.authorRole === 'admin' ? 'الإدارة' : post.authorRole === 'teacher' ? 'معلم' : 'طالب'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold mt-0.5">
                                                    <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: arEG })}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {post.status === 'pending' && (
                                                <span className="text-[9px] font-black bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5">مراجعة</span>
                                            )}
                                            <button className="text-slate-400 hover:bg-slate-100 p-1.5 transition-colors">
                                                <MoreHorizontal size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* FB Content */}
                                    <div className="px-3 md:px-4 pb-3 md:pb-4">
                                        <p className="text-slate-800 dark:text-slate-200 text-[13px] md:text-sm font-medium leading-[1.7] whitespace-pre-wrap">
                                            {post.content}
                                        </p>
                                    </div>

                                    {/* FB Actions Bar */}
                                    <div className="px-2 md:px-4 py-1.5 flex border-t border-slate-100 dark:border-slate-800 mt-2 bg-slate-50/30 dark:bg-slate-800/20">
                                        <button 
                                            onClick={() => handleVote(post.id, 'upvote')}
                                            className={cn(
                                                "flex-1 py-2 flex items-center justify-center gap-2 text-xs font-black transition-all hover:bg-white dark:hover:bg-slate-700 active:scale-95",
                                                isLiked ? "text-blue-600 bg-blue-50/50 dark:bg-blue-900/10" : "text-slate-600"
                                            )}
                                        >
                                            <ThumbsUp size={16} className={cn(isLiked && "fill-current")} />
                                            <span>أعجبني</span>
                                        </button>
                                        <button 
                                            onClick={() => toggleComments(post.id)}
                                            className="flex-1 py-2 flex items-center justify-center gap-2 text-xs font-black text-slate-600 transition-all hover:bg-white dark:hover:bg-slate-700 active:scale-95 border-x border-slate-100 dark:border-slate-800"
                                        >
                                            <MessageSquare size={16} />
                                            <span>تعليق</span>
                                        </button>
                                        <button 
                                            onClick={() => showNotification('تم إرسال التبليغ للإدارة للمراجعة', 'info')}
                                            className="flex-1 py-2 flex items-center justify-center gap-2 text-xs font-black text-rose-500 transition-all hover:bg-rose-50 dark:hover:bg-rose-900/10 active:scale-95"
                                        >
                                            <AlertTriangle size={16} />
                                            <span>تبليغ</span>
                                        </button>
                                    </div>

                                    {/* FB Comments Section */}
                                    {viewingComments[post.id] && (
                                        <div className="bg-slate-50 dark:bg-slate-800/50 p-3 md:p-4 space-y-4">
                                            <div className="space-y-3">
                                                {post.comments?.map(comment => (
                                                    <div key={comment.id} className="flex gap-2">
                                                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0 overflow-hidden border border-slate-100">
                                                            <img src="/logo.png" alt="Dareen Logo" className="w-6 h-6 object-contain" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="bg-slate-200/50 dark:bg-slate-700/50 p-2.5 inline-block">
                                                                <h5 className="text-[10px] font-black text-slate-900 dark:text-white mb-0.5">{comment.authorName}</h5>
                                                                <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-normal">{comment.content}</p>
                                                            </div>
                                                            <div className="flex gap-3 mt-1 text-[9px] text-slate-500 font-bold px-1">
                                                                <button className="hover:underline">أعجبني</button>
                                                                <button className="hover:underline">رد</button>
                                                                <span>{formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: arEG })}</span>
                                                                {(isAdmin || currentUser?.id === comment.authorId) && (
                                                                    <button onClick={() => handleDeleteComment(post.id, comment.id)} className="text-rose-500 hover:underline">حذف</button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* FB Add Comment Input */}
                                            <div className="flex gap-2 items-center">
                                                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0 overflow-hidden border border-slate-100">
                                                    <img src="/logo.png" alt="Dareen Logo" className="w-6 h-6 object-contain" />
                                                </div>
                                                <div className="flex-1 relative">
                                                    <input 
                                                        type="text"
                                                        value={commentTexts[post.id] || ''}
                                                        onChange={(e) => setCommentTexts(prev => ({ ...prev, [post.id]: e.target.value }))}
                                                        placeholder="اكتب تعليقاً..."
                                                        className="w-full bg-slate-200/50 dark:bg-slate-700/50 border-none px-4 py-2 text-xs font-medium focus:ring-0"
                                                        onKeyDown={(e) => { if(e.key === 'Enter') handleAddComment(post.id); }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Admin Controls Area */}
                                    {isAdmin && post.status === 'pending' && (
                                        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border-t border-amber-100 flex justify-between items-center">
                                            <span className="text-[10px] font-black text-amber-700">هذا المنشور يحتاج لمراجعة إدارية فنية</span>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleUpdateStatus(post.id, 'approved')} className="bg-emerald-600 text-white px-4 py-1.5 text-[10px] font-black">قبول</button>
                                                <button onClick={() => handleDeletePost(post.id)} className="bg-rose-600 text-white px-4 py-1.5 text-[10px] font-black">حذف</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
