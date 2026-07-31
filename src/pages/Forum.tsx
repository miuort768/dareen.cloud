import { useState, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Plus, Users, ThumbsUp, MessageCircle, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { EmptyState } from '../shared/components/ui/EmptyState';
import { useSearchParams } from 'react-router-dom';
import { api, safeArray } from '../lib/api';
import { useCurrentUser, useShowNotification, useLogout } from '../context/AppContext';
import { confirm } from '../lib/confirmDialog';
import type { Comment, Post } from '../features/forum/types';
import { ForumHeader, ForumCreatePost, ForumPostCard, ForumHelpBanner } from './forum-page';
import { TeacherDashboardHeader } from './TeacherDashboardHeader';
import { cn } from '../lib/utils';

const particles = Array.from({ length: 8 }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100,
    size: Math.random() * 5 + 2, duration: Math.random() * 6 + 4, delay: Math.random() * 3,
}));

export const Forum = () => {
    useEffect(() => { document.title = 'المنتدى | دارين السابعة للتعليم والتدريب'; }, []);
    const currentUser = useCurrentUser();
    const logout = useLogout();
    const showNotification = useShowNotification();
    const isAdmin = currentUser?.role === 'admin';
    const [searchParams] = useSearchParams();
    const highlightedPostId = searchParams.get('postId');
    const [fabOpen, setFabOpen] = useState(false);

    const queryClient = useQueryClient();
    const { data: posts = [], isLoading: loading } = useQuery<Post[]>({
        queryKey: ['forum'],
        queryFn: () => api.get<Post[]>('/forum'),
        select: (data) => safeArray<Post>(data),
    });

    const [newPostContent, setNewPostContent] = useState('');
    const [commentTexts, setCommentTexts] = useState<Record<string, string>>({});
    const [viewingComments, setViewingComments] = useState<Record<string, boolean>>({});
    const [showMenuPostId, setShowMenuPostId] = useState<string | null>(null);

    useEffect(() => {
        if (highlightedPostId && !loading) {
            const element = document.getElementById(`post-${highlightedPostId}`);
            if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [highlightedPostId, loading]);

    const handleCreatePost = async () => {
        if (!newPostContent.trim()) return;
        try {
            const data = await api.post<Record<string, unknown>>('/forum', { content: newPostContent });
            showNotification(data.message || 'تم إنشاء المنشور', 'success');
            setNewPostContent('');
            queryClient.invalidateQueries({ queryKey: ['forum'] });
        } catch (e) {
            console.error(e);
            showNotification('فشل النشر', 'error');
        }
    };

    const handleVote = async (postId: string, type: 'upvote' | 'downvote') => {
        try {
            const data = await api.post<{ upvotes: number; downvotes: number }>(`/forum/${postId}/vote`, { type });
            queryClient.setQueryData(['forum'], (old: Post[] = []) => old.map((p: Post) => p.id === postId ? { ...p, upvotes: data.upvotes, downvotes: data.downvotes } : p));
        } catch (e) {
            console.error(e);
            showNotification('فشل التصويت على هذا المنشور', 'error');
        }
    };

    const handleUpdateStatus = async (postId: string, status: 'approved' | 'rejected') => {
        try {
            await api.patch(`/forum/${postId}/status`, { status });
            showNotification('تم تحديث حالة المنشور', 'success');
            queryClient.invalidateQueries({ queryKey: ['forum'] });
        } catch (e) {
            console.error(e);
            showNotification('فشل تحديث الحالة', 'error');
        }
    };

    const handleDeletePost = async (postId: string) => {
        if (!await confirm('هل أنت متأكد من حذف هذا المنشور؟')) return;
        try {
            await api.delete(`/forum/${postId}`);
            showNotification('تم حذف المنشور', 'success');
            queryClient.invalidateQueries({ queryKey: ['forum'] });
        } catch (e) {
            console.error(e);
            showNotification('فشل الحذف', 'error');
        }
    };

    const toggleComments = async (postId: string) => {
        if (!viewingComments[postId]) {
            try {
                const data = await api.get<Comment[]>(`/forum/${postId}/comments`);
                queryClient.setQueryData(['forum'], (old: Post[] = []) => old.map((p: Post) => p.id === postId ? { ...p, comments: data } : p));
            } catch (e) {
                console.error(e);
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
            queryClient.invalidateQueries({ queryKey: ['forum'] });
        } catch (e) {
            console.error(e);
            showNotification('فشل إضافة التعليق', 'error');
        }
    };

    const handleDeleteComment = async (postId: string, commentId: string) => {
        if (!await confirm('هل أنت متأكد من حذف هذا التعليق؟')) return;
        try {
            await api.delete(`/forum/comments/${commentId}`);
            showNotification('تم حذف التعليق', 'success');
            queryClient.invalidateQueries({ queryKey: ['forum'] });
        } catch (e) {
            console.error(e);
            showNotification('فشل الحذف', 'error');
        }
    };

    const handleReport = async (postId: string) => {
        try {
            await api.post(`/forum/${postId}/report`);
            showNotification('تم إرسال البلاغ للمراجعة', 'info');
        } catch (e) {
            console.error(e);
            showNotification('فشل الإبلاغ', 'error');
        }
    };

    const totalUpvotes = useMemo(() => posts.reduce((s, p) => s + (typeof p.upvotes === 'number' ? p.upvotes : 0), 0), [posts]);
    const totalComments = useMemo(() => posts.reduce((s, p) => s + (p.comments?.length || 0), 0), [posts]);

    const kpiCards = useMemo(() => [
        { label: 'إجمالي المنشورات', value: posts.length, icon: MessageSquare, gradient: 'from-primary/20 to-primary/5', iconBg: 'bg-primary/10 text-primary', accent: 'bg-primary' },
        { label: 'إجمالي الإعجابات', value: totalUpvotes, icon: ThumbsUp, gradient: 'from-success/20 to-success/5', iconBg: 'bg-success/10 text-success', accent: 'bg-success' },
        { label: 'التعليقات', value: totalComments, icon: MessageCircle, gradient: 'from-warning/20 to-warning/5', iconBg: 'bg-warning/10 text-warning', accent: 'bg-warning' },
        { label: 'المشاركون', value: new Set(posts.map(p => p.userId)).size, icon: Users, gradient: 'from-info/20 to-info/5', iconBg: 'bg-info/10 text-info', accent: 'bg-info' },
    ], [posts, totalUpvotes, totalComments]);

    const fabActions = useMemo(() => [
        { icon: Plus, label: 'منشور جديد', onClick: () => document.querySelector('[data-create-post] textarea')?.focus() },
        { icon: Filter, label: 'المناقشات', onClick: () => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }) },
        { icon: MessageCircle, label: 'التعليقات', onClick: () => {} },
    ], []);

    return (
        <div className="min-h-full overflow-x-hidden relative bg-background pb-20 font-sans" dir="rtl">
            {currentUser?.role === 'teacher' && (
                <div className="hidden md:block">
                    <TeacherDashboardHeader logout={logout} />
                </div>
            )}
            <div className="relative z-10">
                <div className="relative overflow-hidden rounded-2xl mx-4 max-w-[700px] md:mx-auto mt-4">
                    {particles.map(p => (
                        <motion.div key={p.id} className="absolute rounded-full bg-white/10 pointer-events-none z-10"
                            style={{ width: p.size, height: p.size, left: `${p.x}%`, top: `${p.y}%` }}
                            animate={{ y: [0, -20, 0], opacity: [0.2, 0.5, 0.2] }} transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }} />
                    ))}
                    <ForumHeader />
                </div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-[700px] mx-auto px-4 mb-4">
                        {kpiCards.map((kpi, i) => {
                            const Icon = kpi.icon;
                            return (
                                <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 + i * 0.06 }}
                                    whileHover={{ scale: 1.02, y: -2 }} className={cn("relative overflow-hidden rounded-xl bg-gradient-to-br border border-border/50 p-4", kpi.gradient)}>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className={cn("p-2 rounded-lg", kpi.iconBg)}><Icon size={16} /></div>
                                        <div className={cn("h-1 w-12 rounded-full", kpi.accent)} />
                                    </div>
                                    <p className="text-xs text-muted mb-1">{kpi.label}</p>
                                    <p className="text-2xl font-bold text-main">{kpi.value}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>

                <div className="max-w-[700px] mx-auto px-4 space-y-6" data-create-post>
                    <ForumCreatePost newPostContent={newPostContent} setNewPostContent={setNewPostContent} handleCreatePost={handleCreatePost} />
                    {loading ? (
                        <div className="space-y-6">
                            {[1, 2, 3].map(i => <div key={`skel-${i}`} className="bg-card h-48 animate-pulse rounded-card" />)}
                        </div>
                    ) : posts.length === 0 ? (
                        <EmptyState icon={MessageSquare} title="لا توجد منشورات هنا"
                            className="bg-card rounded-card p-6 md:p-16 border-2 border-dashed border-border" />
                    ) : (
                        <div className="space-y-6">
                            {posts.map((post: Post) => {
                                const isLiked = post.upvotes.includes(currentUser?.id || '');
                                const isHighlighted = post.id === highlightedPostId;
                                return (
                                    <ForumPostCard key={post.id} post={post} isLiked={isLiked} isHighlighted={isHighlighted}
                                        isAdmin={isAdmin} currentUserId={currentUser?.id || ''}
                                        showMenuPostId={showMenuPostId} setShowMenuPostId={setShowMenuPostId}
                                        onVote={handleVote} onDelete={handleDeletePost} onReport={handleReport}
                                        onToggleComments={toggleComments} onAddComment={handleAddComment}
                                        onDeleteComment={handleDeleteComment} onUpdateStatus={handleUpdateStatus}
                                        commentTexts={commentTexts} setCommentTexts={setCommentTexts}
                                        viewingComments={viewingComments} />
                                );
                            })}
                        </div>
                    )}
                </div>
                <ForumHelpBanner />
            </div>

            <div className="fixed bottom-6 end-6 z-50 flex flex-col items-end gap-3">
                <AnimatePresence>
                    {fabOpen && fabActions.map((action, i) => (
                        <motion.div key={action.label} initial={{ opacity: 0, scale: 0.3, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.3, y: 20 }} transition={{ delay: 0.05 * (fabActions.length - 1 - i) }} className="flex items-center gap-2">
                            <span className="bg-card border border-border text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm whitespace-nowrap">{action.label}</span>
                            <button onClick={() => { action.onClick(); setFabOpen(false); }}
                                className="w-10 h-10 rounded-full bg-primary text-white shadow-lg hover:shadow-xl hover:bg-primary-hover transition-all flex items-center justify-center">
                                <action.icon size={18} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
                <motion.button onClick={() => setFabOpen(!fabOpen)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    className={cn("w-12 h-12 rounded-full shadow-xl text-white flex items-center justify-center transition-all", fabOpen ? "bg-error rotate-45" : "bg-primary")}>
                    <Plus size={24} />
                </motion.button>
            </div>
        </div>
    );
};
