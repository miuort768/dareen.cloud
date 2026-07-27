import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { MessageSquare } from 'lucide-react';
import { EmptyState } from '../shared/components/ui/EmptyState';
import { useSearchParams } from 'react-router-dom';
import { api, safeArray } from '../lib/api';
import { useCurrentUser, useShowNotification } from '../context/AppContext';
import { confirm } from '../lib/confirmDialog';
import type { Comment, Post } from '../features/forum/types';
import { ForumHeader, ForumCreatePost, ForumPostCard, ForumHelpBanner } from './forum-page';

export const Forum = () => {
    useEffect(() => { document.title = 'المنتدى | دارين السابعة للتعليم والتدريب'; }, []);
    const currentUser = useCurrentUser();
    const showNotification = useShowNotification();
    const isAdmin = currentUser?.role === 'admin';
    const [searchParams] = useSearchParams();
    const highlightedPostId = searchParams.get('postId');

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

    return (
        <div className="min-h-full overflow-x-hidden relative bg-background pb-20 md:animate-in md:fade-in md:duration-700 font-sans" dir="rtl">
            <div className="relative z-10">
                <ForumHeader />
                <div className="max-w-[700px] mx-auto px-4 space-y-6">
                    <ForumCreatePost newPostContent={newPostContent} setNewPostContent={setNewPostContent} handleCreatePost={handleCreatePost} />
                    {loading ? (
                        <div className="space-y-6">
                            {[1, 2, 3].map(i => <div key={`skel-${i}`} className="bg-card h-48 animate-pulse rounded-card shadow-soft" />)}
                        </div>
                    ) : posts.length === 0 ? (
                        <EmptyState
                            icon={MessageSquare}
                            title="لا توجد منشورات هنا"
                            className="bg-card rounded-card shadow-soft p-6 md:p-16 border-2 border-dashed border-border"
                        />
                    ) : (
                        <div className="space-y-6">
                            {posts.map((post: Post) => {
                                const isLiked = post.upvotes.includes(currentUser?.id || '');
                                const isHighlighted = post.id === highlightedPostId;
                                return (
                                    <ForumPostCard
                                        key={post.id}
                                        post={post}
                                        isLiked={isLiked}
                                        isHighlighted={isHighlighted}
                                        isAdmin={isAdmin}
                                        currentUserId={currentUser?.id || ''}
                                        showMenuPostId={showMenuPostId}
                                        setShowMenuPostId={setShowMenuPostId}
                                        onVote={handleVote}
                                        onDelete={handleDeletePost}
                                        onReport={handleReport}
                                        onToggleComments={toggleComments}
                                        onAddComment={handleAddComment}
                                        onDeleteComment={handleDeleteComment}
                                        onUpdateStatus={handleUpdateStatus}
                                        commentTexts={commentTexts}
                                        setCommentTexts={setCommentTexts}
                                        viewingComments={viewingComments}
                                    />
                                );
                            })}
                        </div>
                    )}
                </div>
                <ForumHelpBanner />
            </div>
        </div>
    );
};
