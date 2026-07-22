import { useState, useEffect } from 'react';
import { BookOpen, Eye, Calendar, ArrowLeft } from 'lucide-react';
import { api } from '../../../lib/api';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
        <div className="rounded-2xl bg-card border border-border p-5 font-dash" dir="rtl">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-error-soft flex items-center justify-center">
                        <BookOpen size={16} className="text-error" />
                    </div>
                    <h3 className="text-sm font-bold text-main">آخر المقالات</h3>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/admin/blog')}
                    className="text-[10px] font-bold h-7 px-2.5 gap-1 rounded-lg text-muted hover:text-main"
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
                        className="flex items-center justify-between p-3 rounded-xl bg-surface hover:bg-hover transition-colors cursor-pointer"
                    >
                        <div className="flex items-center gap-2.5 min-w-0">
                            <Badge variant="outline" className="text-[9px] h-5 px-2 rounded-lg bg-error-soft text-error border-error/20 font-bold shrink-0">
                                {article.category}
                            </Badge>
                            <span className="text-xs font-semibold text-main truncate">{article.title}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-medium text-muted shrink-0">
                            <span className="flex items-center gap-1">
                                <Calendar size={9} />
                                {article.date}
                            </span>
                            <span className="flex items-center gap-1">
                                <Eye size={9} />
                                {article.views}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
