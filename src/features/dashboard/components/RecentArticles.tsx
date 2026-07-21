import { useState, useEffect } from 'react';
import { BookOpen, Eye, Calendar, ArrowLeft } from 'lucide-react';
import { api } from '../../../lib/api';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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
        <Card className="border-border/50 shadow-sm" dir="rtl">
            <CardHeader className="pb-2 pt-4 px-5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-error/10 text-error flex items-center justify-center">
                            <BookOpen size={14} />
                        </div>
                        <CardTitle className="text-xs font-bold text-main">آخر المقالات</CardTitle>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/admin/blog')}
                        className="text-[10px] font-semibold h-7 px-2 gap-1 text-muted hover:text-main"
                    >
                        إدارة المقالات
                        <ArrowLeft size={10} />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="px-5 pb-4">
                <div className="space-y-1">
                    {articles.map(article => (
                        <div
                            key={article.id}
                            onClick={() => navigate('/admin/blog')}
                            className="flex items-center justify-between p-2.5 rounded-lg hover:bg-accent/50 transition-all cursor-pointer"
                        >
                            <div className="flex items-center gap-2 min-w-0">
                                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-error/10 text-error shrink-0">
                                    {article.category}
                                </span>
                                <span className="text-xs font-medium text-main truncate">{article.title}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-medium text-muted shrink-0">
                                <span className="flex items-center gap-1"><Calendar size={10} /> {article.date}</span>
                                <span className="flex items-center gap-1"><Eye size={10} /> {article.views}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};
