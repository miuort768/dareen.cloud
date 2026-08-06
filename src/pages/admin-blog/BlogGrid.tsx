import { Edit2, Trash2, ExternalLink, Calendar, User, BookOpen } from 'lucide-react';
import { Image } from '../../shared/components/ui';
import type { BlogPost } from './types';

interface BlogGridProps {
    loading: boolean;
    filteredPosts: BlogPost[];
    handleOpenModal: (post?: BlogPost) => void;
    handleDelete: (id: string) => void;
}

export const BlogGrid = ({ loading, filteredPosts, handleOpenModal, handleDelete }: BlogGridProps) => {
    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 rounded-full border-2 border-border border-t-error animate-spin" />
            </div>
        );
    }

    if (filteredPosts.length === 0) {
        return (
            <div className="text-center py-20 bg-card border border-dashed border-border rounded-2xl">
                <div className="w-12 h-12 rounded-xl bg-error-soft text-error flex items-center justify-center mx-auto mb-3">
                    <BookOpen size={22} />
                </div>
                <p className="text-sm font-bold text-muted">لا توجد مقالات بعد! أضف أول مقال الآن</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPosts.map((post) => (
                <div key={post.id} className="bg-card border border-border overflow-hidden rounded-2xl">
                    <div className="relative h-36 overflow-hidden">
                        <Image src={post.coverImage || 'https://via.placeholder.com/400x200'} alt={post.title} className="w-full h-full" />
                        <div className="absolute top-2 start-2">
                            <span className="text-micro font-bold px-2 py-1 rounded-lg bg-error text-on-error">{post.category}</span>
                        </div>
                    </div>
                    <div className="p-3">
                        <h3 className="font-bold text-main mb-1 line-clamp-2 text-sm">{post.title}</h3>
                        <div className="flex items-center gap-2 text-micro font-bold text-muted mb-2">
                            <div className="flex items-center gap-1"><Calendar size={12} /> {post.date}</div>
                            <div className="flex items-center gap-1"><User size={12} /> {post.author}</div>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-border">
                            <div className="flex gap-2">
                                <button onClick={() => handleOpenModal(post)} className="w-8 h-8 flex items-center justify-center rounded-xl text-info hover:bg-info-soft transition-colors" aria-label="تعديل"><Edit2 size={14} /></button>
                                <button onClick={() => handleDelete(post.id)} className="w-8 h-8 flex items-center justify-center rounded-xl text-error hover:bg-error-soft transition-colors" aria-label="حذف"><Trash2 size={14} /></button>
                            </div>
                            <a href={`/books/${post.slug}`} target="_blank" rel="noopener noreferrer" aria-label="عرض المقال" className="w-8 h-8 flex items-center justify-center text-muted hover:bg-surface rounded-xl transition-colors"><ExternalLink size={14} /></a>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
