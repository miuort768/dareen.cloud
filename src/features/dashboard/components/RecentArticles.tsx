import { useState, useEffect } from 'react';
import { BookOpen, Eye, Calendar, ArrowLeft } from 'lucide-react';
import { api } from '../../../lib/api';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GlassCard } from '@/shared/components/ui';

interface Article {
    id: string;
    slug: string;
    title: string;
    category: string;
    date: string;
    views: number;
}

export const RecentArticles = () => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        api.get<Article[]>('/blog?all=true')
            .then(data => setArticles(data.slice(0, 5)))
            .catch((e) => console.warn(e))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return null;
    if (articles.length === 0) return null;

    return (
        <GlassCard dir="rtl">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-error to-rose-500 flex items-center justify-center shadow-lg shadow-error/20">
                        <BookOpen size={14} className="text-white" />
                    </div>
                    <h3 className="text-sm font-bold text-main">آخر المقالات</h3>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/admin/blog')}
                    className="text-[10px] font-bold h-8 px-3 gap-1.5 rounded-xl text-muted hover:text-main hover:bg-white/30 dark:hover:bg-white/5"
                >
                    إدارة المقالات
                    <ArrowLeft size={10} />
                </Button>
            </div>

            <div className="space-y-1.5">
                {articles.map(article => (
                    <div
                        key={article.id}
                        onClick={() => navigate('/admin/blog')}
                        className="flex items-center justify-between p-3 rounded-2xl bg-white/40 dark:bg-white/5 backdrop-blur-sm border border-white/20 hover:border-white/30 transition-all cursor-pointer hover:shadow-md"
                    >
                        <div className="flex items-center gap-2.5 min-w-0">
                            <Badge variant="outline" className="text-[9px] h-5 px-2.5 rounded-lg bg-gradient-to-br from-error/10 to-rose-500/10 text-error border-error/20 font-bold shrink-0">
                                {article.category}
                            </Badge>
                            <span className="text-xs font-semibold text-main truncate">{article.title}</span>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] font-medium text-muted shrink-0">
                            <span className="flex items-center gap-1 bg-white/30 dark:bg-white/5 px-2 py-0.5 rounded-lg">
                                <Calendar size={9} />
                                {article.date}
                            </span>
                            <span className="flex items-center gap-1 bg-white/30 dark:bg-white/5 px-2 py-0.5 rounded-lg">
                                <Eye size={9} />
                                {article.views}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </GlassCard>
    );
};
