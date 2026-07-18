import { MessageSquare, ThumbsUp, MoreHorizontal, AlertTriangle, Clock, Trash2, User, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from '../../lib/utils';
import { buildThreadedComments } from '../../features/forum/types';
import type { Comment, Post } from '../../features/forum/types';

interface ForumPostCardProps {
    post: Post;
    isLiked: boolean;
    isHighlighted: boolean;
    isAdmin: boolean;
    currentUserId: string;
    showMenuPostId: string | null;
    setShowMenuPostId: (v: string | null) => void;
    onVote: (postId: string, type: 'upvote') => void;
    onDelete: (postId: string) => void;
    onReport: (postId: string) => void;
    onToggleComments: (postId: string) => void;
    onAddComment: (postId: string) => void;
    onDeleteComment: (postId: string, commentId: string) => void;
    onUpdateStatus: (postId: string, status: 'approved' | 'rejected') => void;
    commentTexts: Record<string, string>;
    setCommentTexts: (fn: (prev: Record<string, string>) => Record<string, string>) => void;
    viewingComments: Record<string, boolean>;
}

export const ForumPostCard = ({
    post, isLiked, isHighlighted, isAdmin, currentUserId, showMenuPostId, setShowMenuPostId,
    onVote, onDelete, onReport, onToggleComments, onAddComment, onDeleteComment, onUpdateStatus,
    commentTexts, setCommentTexts, viewingComments
}: ForumPostCardProps) => (
    <div key={post.id} id={`post-${post.id}`}
        className={cn("bg-card rounded-card shadow-soft transition-all duration-500", isHighlighted && "ring-2 ring-primary shadow-sm")}>
        <div className="p-4 md:p-5 flex justify-between items-start">
            <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-card bg-primary-soft flex items-center justify-center font-bold text-primary text-sm">
                    {(post.authorName?.[0] || '').toUpperCase()}
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-0.5">
                        <h4 className="font-bold text-main dark:text-main text-sm">{post.authorName}</h4>
                        {post.authorRole === 'admin' && <span className="text-micro font-bold px-2 py-0.5 rounded-card bg-error-light text-error border border-error">إدارة</span>}
                        {post.authorRole === 'teacher' && <span className="text-micro font-bold px-2 py-0.5 rounded-card bg-success-light text-success border border-success">معلم</span>}
                        {post.authorRole === 'student' && <span className="text-micro font-bold px-2 py-0.5 rounded-card bg-info-light text-info border border-info">طالب</span>}
                    </div>
                    <div className="flex items-center gap-1.5 text-micro text-muted font-medium">
                        <Clock size={9} />
                        <span>{formatDistanceToNow(new Date(post.created_at) > new Date() ? new Date() : new Date(post.created_at), { addSuffix: true, locale: ar })}</span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-1">
                {isAdmin && (
                    <button onClick={() => onDelete(post.id)} className="p-2 text-dim hover:text-error transition-colors rounded-xl hover:bg-error-light dark:hover:bg-error/20" aria-label="حذف المنشور">
                        <Trash2 size={15} />
                    </button>
                )}
                <div className="relative">
                    <button onClick={() => setShowMenuPostId(showMenuPostId === post.id ? null : post.id)}
                        className="p-2 text-dim hover:text-muted transition-colors rounded-xl hover:bg-surface dark:hover:bg-primary-active/50" aria-label="القائمة">
                        <MoreHorizontal size={17} />
                    </button>
                    {showMenuPostId === post.id && (
                        <div className="absolute end-0 top-full mt-1 w-36 bg-card rounded-card shadow-soft border border-border z-50 py-1">
                            <button onClick={() => { onReport(post.id); setShowMenuPostId(null); }}
                                className="w-full px-4 py-2 text-micro font-bold text-start text-muted dark:text-dim hover:bg-surface dark:hover:bg-primary-active flex items-center gap-2">
                                <AlertTriangle size={12} className="text-error" /> الإبلاغ عن المنشور
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
        <div className="px-4 pb-5">
            <p className="text-main dark:text-dim text-sm md:text-base font-medium leading-[1.9] whitespace-pre-wrap">{post.content}</p>
        </div>
        <div className="px-3 md:px-4 py-1.5 flex border-t border-border dark:border-border">
            <button onClick={() => onVote(post.id, 'upvote')}
                className={cn("flex-1 py-2.5 flex items-center justify-center gap-2 text-xs font-bold transition-all active:scale-95 rounded-xl",
                    isLiked ? "text-primary bg-primary-soft dark:bg-primary-active/20" : "text-muted hover:text-muted hover:bg-surface dark:hover:bg-primary-active/50")}>
                <ThumbsUp size={15} className={cn(isLiked && "fill-current")} />
                <span>إعجاب</span>
            </button>
            <button onClick={() => onToggleComments(post.id)}
                className="flex-1 py-2.5 flex items-center justify-center gap-2 text-xs font-bold text-muted hover:text-muted transition-all active:scale-95 rounded-xl hover:bg-surface dark:hover:bg-primary-active/50 mx-1">
                <MessageSquare size={15} />
                <span>{post.commentCount || 0} تعليق</span>
            </button>
            <button onClick={() => onReport(post.id)}
                className="flex-1 py-2.5 flex items-center justify-center gap-2 text-xs font-bold text-error hover:text-error transition-all active:scale-95 rounded-xl hover:bg-error-light dark:hover:bg-error/20">
                <AlertTriangle size={15} />
                <span>بلاغ</span>
            </button>
        </div>
        {viewingComments[post.id] && (
            <div className="bg-background rounded-card border-t border-border p-4 md:p-5 space-y-4">
                <div className="space-y-3">
                    {buildThreadedComments(post.comments || []).map((node) => (
                        <div key={node.comment.id} className="space-y-3">
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-card bg-primary-soft flex items-center justify-center font-bold text-primary text-micro shrink-0">
                                    {(node.comment.authorName?.[0] || '').toUpperCase()}
                                </div>
                                <div className="flex-1">
                                    <div className="bg-card rounded-card p-3.5 shadow-sm border border-border">
                                        <div className="flex justify-between items-center mb-1">
                                            <h5 className="text-xs font-bold text-main dark:text-main">{node.comment.authorName}</h5>
                                            <span className="text-micro text-muted font-medium">{formatDistanceToNow(new Date(node.comment.created_at) > new Date() ? new Date() : new Date(node.comment.created_at), { addSuffix: true, locale: ar })}</span>
                                        </div>
                                        <p className="text-xs text-muted dark:text-dim leading-relaxed">{node.comment.content}</p>
                                        <div className="flex gap-3 mt-2 pt-2 border-t border-border dark:border-border/50">
                                            <button onClick={() => {
                                                const currentText = commentTexts[post.id] || '';
                                                setCommentTexts((prev) => ({ ...prev, [post.id]: `@${node.comment.authorName} ${currentText}` }));
                                                document.getElementById(`comment-input-${post.id}`)?.focus();
                                            }} className="text-micro font-bold text-primary hover:text-primary transition-colors">رد</button>
                                            {(isAdmin || currentUserId === node.comment.authorId) && (
                                                <button onClick={() => onDeleteComment(post.id, node.comment.id)} className="text-micro font-bold text-error hover:text-error transition-colors">حذف</button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {node.replies.length > 0 && (
                                <div className="ps-7 space-y-2 border-s-2 border-primary dark:border-primary/30 ms-3">
                                    {node.replies.map((replyNode) => (
                                        <div key={replyNode.comment.id} className="flex gap-2">
                                            <div className="w-6 h-6 rounded-card bg-primary-soft flex items-center justify-center font-bold text-primary text-micro shrink-0">
                                                {(replyNode.comment.authorName?.[0] || '').toUpperCase()}
                                            </div>
                                            <div className="flex-1 bg-card rounded-card p-2.5 shadow-sm border border-border">
                                                <div className="flex justify-between items-center mb-0.5">
                                                    <h5 className="text-micro font-bold text-main dark:text-main">{replyNode.comment.authorName}</h5>
                                                    <span className="text-micro text-muted">{formatDistanceToNow(new Date(replyNode.comment.created_at) > new Date() ? new Date() : new Date(replyNode.comment.created_at), { addSuffix: true, locale: ar })}</span>
                                                </div>
                                                <p className="text-micro text-muted dark:text-dim leading-relaxed">{replyNode.comment.content}</p>
                                                {(isAdmin || currentUserId === replyNode.comment.authorId) && (
                                                    <button onClick={() => onDeleteComment(post.id, replyNode.comment.id)} className="mt-1 text-micro font-bold text-error hover:text-error transition-colors">حذف</button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                <div className="flex gap-3 items-center pt-3 border-t border-border">
                    <div className="w-9 h-9 rounded-card bg-primary-soft flex items-center justify-center shrink-0">
                        <User size={14} className="text-primary" />
                    </div>
                    <div className="flex-1 relative">
                        <input id={`comment-input-${post.id}`} type="text" aria-label="رد على المنشور"
                            value={commentTexts[post.id] || ''}
                            onChange={(e) => setCommentTexts((prev) => ({ ...prev, [post.id]: e.target.value }))}
                            placeholder="اكتب رداً على هذا المنشور..."
                            className="w-full bg-card rounded-card pe-10 ps-4 py-2.5 text-xs font-medium text-main focus:outline-none focus:ring-2 focus:ring-focus transition-all border border-border placeholder:text-muted"
                            onKeyDown={(e) => { if (e.key === 'Enter') onAddComment(post.id); }} />
                        <button onClick={() => onAddComment(post.id)}
                            disabled={!(commentTexts[post.id] || '').trim()} aria-label="إرسال التعليق"
                            className="absolute end-1 top-1/2 -translate-y-1/2 w-7 h-7 bg-primary hover:bg-primary-hover text-on-primary flex items-center justify-center rounded-card transition-all disabled:opacity-30 active:scale-90">
                            <Send size={11} />
                        </button>
                    </div>
                </div>
            </div>
        )}
        {isAdmin && post.status === 'pending' && (
            <div className="p-3.5 bg-warning-light rounded-card border-t border-warning flex justify-between items-center">
                <div className="flex items-center gap-2 text-warning dark:text-warning">
                    <AlertTriangle size={13} />
                    <span className="text-micro font-bold">هذا المنشور ينتظر الموافقة</span>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => onUpdateStatus(post.id, 'approved')} className="bg-success hover:bg-success text-on-primary px-3.5 py-1.5 text-micro font-bold rounded-card transition-all active:scale-95">موافقة</button>
                    <button onClick={() => onDelete(post.id)} className="bg-error hover:bg-error text-on-primary px-3.5 py-1.5 text-micro font-bold rounded-card transition-all active:scale-95">حذف</button>
                </div>
            </div>
        )}
    </div>
);
