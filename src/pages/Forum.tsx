import { useState, useEffect } from 'react';
import { MessageSquare, ThumbsUp, ThumbsDown, Send, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { api } from '../lib/api';
import { useApp } from '../context/AppContext';
import { PageHeader } from '../shared/components/ui/PageHeader';
import { formatDistanceToNow } from 'date-fns';
import { arEG } from 'date-fns/locale';

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
            // Fetch comments
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
            
            // Re-fetch comments
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
    }

    return (
        <div className="space-y-6 pb-32 animate-in fade-in duration-500" dir="rtl">
            <PageHeader 
                icon={MessageSquare} 
                title="منتدى النقاشات" 
                subtitle="مساحة حرة للتواصل بين الطلاب، المعلمين وأولياء الأمور"
                color="indigo"
            />

            {/* Create Post Section - Sharp cyber-brutalist style */}
            <div className="bg-white border-2 border-gray-950 p-4 shadow-[2px_2px_0px_0px_black] rounded-none">
                <textarea
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="بم تفكر؟ شاركنا أفكارك، أسئلتك، واستفساراتك..."
                    className="w-full bg-gray-50 border-2 border-gray-950 p-3 min-h-[100px] resize-y rounded-none text-gray-950 focus:outline-none focus:ring-0 mb-4 font-bold"
                />
                <div className="flex justify-end">
                    <button
                        onClick={handleCreatePost}
                        disabled={!newPostContent.trim()}
                        className="bg-indigo-600 text-white px-6 py-2 border-2 border-gray-950 shadow-[2px_2px_0px_0px_black] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center gap-2 font-black uppercase text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send size={16} />
                        نشر المشاركة
                    </button>
                </div>
            </div>

            {/* Posts Feed */}
            {loading ? (
                <div className="text-center py-10 font-black text-gray-400 animate-pulse">جاري التحميل...</div>
            ) : posts.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-gray-400 p-10 text-center text-gray-500 font-bold">
                    لا توجد منشورات حتى الآن. كن أول من يشارك!
                </div>
            ) : (
                <div className="space-y-6">
                    {posts.map(post => (
                        <div key={post.id} className="bg-white border-2 border-gray-950 relative rounded-none shadow-[2px_2px_0px_0px_black]">
                            {/* Moderation Banner for Admin */}
                            {isAdmin && post.status === 'pending' && (
                                <div className="bg-amber-100 border-b-2 border-gray-950 p-2 flex justify-between items-center text-amber-950 font-bold text-xs">
                                    <span>هذا المنشور بانتظار المراجعة</span>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleUpdateStatus(post.id, 'approved')} className="flex items-center gap-1 bg-emerald-500 text-white px-2 py-1 border-2 border-gray-950 hover:bg-emerald-600">
                                            <CheckCircle size={14} /> قبول
                                        </button>
                                        <button onClick={() => handleDeletePost(post.id)} className="flex items-center gap-1 bg-rose-500 text-white px-2 py-1 border-2 border-gray-950 hover:bg-rose-600">
                                            <XCircle size={14} /> رفض
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="p-4 md:p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <div className="w-10 h-10 bg-indigo-100 border-2 border-gray-950 flex items-center justify-center font-black text-indigo-800 text-lg shadow-[2px_2px_0px_0px_black]">
                                            {post.authorName.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-black text-gray-950 text-sm">{post.authorName}</h3>
                                            <div className="flex items-center gap-2 text-[10px]">
                                                <span className="bg-gray-200 text-gray-800 px-1.5 py-0.5 border border-gray-950 uppercase font-bold">
                                                    {post.authorRole === 'admin' ? 'إدارة' : post.authorRole === 'teacher' ? 'معلم' : post.authorRole === 'student' ? 'طالب' : 'ولي أمر'}
                                                </span>
                                                <span className="text-gray-500">
                                                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: arEG })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {isAdmin && post.status === 'approved' && (
                                        <button onClick={() => handleDeletePost(post.id)} className="text-gray-400 hover:text-rose-600 transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                    {(!isAdmin && post.status === 'pending') && (
                                        <span className="text-amber-600 font-bold text-[10px] bg-amber-50 px-2 py-1 border border-amber-600">قيد المراجعة</span>
                                    )}
                                </div>

                                <p className="text-gray-800 font-medium whitespace-pre-wrap leading-relaxed text-sm">
                                    {post.content}
                                </p>

                                {/* Action Bar */}
                                <div className="mt-6 flex items-center justify-between border-t-2 border-gray-100 pt-4 flex-wrap gap-4">
                                    <div className="flex gap-4">
                                        <button 
                                            onClick={() => handleVote(post.id, 'upvote')}
                                            className={`flex items-center gap-1.5 text-xs font-black px-3 py-1.5 border-2 border-gray-950 transition-colors ${post.upvotes.includes(currentUser?.id || '') ? 'bg-indigo-600 text-white shadow-[2px_2px_0px_0px_black]' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:shadow-[2px_2px_0px_0px_black]'}`}
                                        >
                                            <ThumbsUp size={14} />
                                            <span>{post.upvotes.length}</span>
                                        </button>
                                        <button 
                                            onClick={() => handleVote(post.id, 'downvote')}
                                            className={`flex items-center gap-1.5 text-xs font-black px-3 py-1.5 border-2 border-gray-950 transition-colors ${post.downvotes.includes(currentUser?.id || '') ? 'bg-rose-600 text-white shadow-[2px_2px_0px_0px_black]' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:shadow-[2px_2px_0px_0px_black]'}`}
                                        >
                                            <ThumbsDown size={14} />
                                            <span>{post.downvotes.length}</span>
                                        </button>
                                    </div>
                                    
                                    <button 
                                        onClick={() => toggleComments(post.id)}
                                        className="text-indigo-600 font-black text-xs hover:underline flex items-center gap-1"
                                    >
                                        <MessageSquare size={14} />
                                        التعليقات
                                    </button>
                                </div>
                            </div>

                            {/* Comments Section */}
                            {viewingComments[post.id] && (
                                <div className="bg-gray-50 border-t-2 border-gray-950 p-4">
                                    {/* Comments List */}
                                    <div className="space-y-4 mb-4">
                                        {post.comments?.map(comment => (
                                            <div key={comment.id} className="bg-white border-2 border-gray-950 p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]">
                                                <div className="flex justify-between items-start mb-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-black text-gray-950 text-xs">{comment.authorName}</span>
                                                        <span className="bg-indigo-100 text-indigo-800 px-1 py-0.5 text-[8px] font-bold border border-gray-950">
                                                            {comment.authorRole === 'admin' ? 'إدارة' : comment.authorRole === 'teacher' ? 'معلم' : comment.authorRole === 'student' ? 'طالب' : 'ولي أمر'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[9px] text-gray-500 font-medium">
                                                            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: arEG })}
                                                        </span>
                                                        {isAdmin && (
                                                            <button onClick={() => handleDeleteComment(post.id, comment.id)} className="text-gray-400 hover:text-rose-600"><Trash2 size={12} /></button>
                                                        )}
                                                    </div>
                                                </div>
                                                <p className="text-gray-700 text-xs font-medium">{comment.content}</p>
                                            </div>
                                        ))}
                                        {post.comments?.length === 0 && (
                                            <p className="text-center text-gray-400 text-xs font-bold my-4">لا توجد تعليقات. بادر بالتعليق أولاً!</p>
                                        )}
                                    </div>

                                    {/* Add comment */}
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <input 
                                            type="text"
                                            value={commentTexts[post.id] || ''}
                                            onChange={(e) => setCommentTexts(prev => ({ ...prev, [post.id]: e.target.value }))}
                                            placeholder="اكتب تعليقك هنا..."
                                            className="flex-1 border-2 border-gray-950 px-3 py-2 text-xs font-bold focus:outline-none focus:ring-0 rounded-none shadow-[2px_2px_0px_0px_black]"
                                            onKeyDown={(e) => { if(e.key === 'Enter') handleAddComment(post.id); }}
                                        />
                                        <button 
                                            onClick={() => handleAddComment(post.id)}
                                            className="bg-gray-950 text-white px-4 py-2 border-2 border-gray-950 font-black text-[10px] tracking-widest shadow-[2px_2px_0px_0px_black] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all text-center flex items-center justify-center whitespace-nowrap"
                                        >
                                            إرسال التعليق
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
