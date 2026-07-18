import { useState, useEffect } from 'react';
import { BookOpen, Eye, Calendar } from 'lucide-react';
import { api } from '../../../lib/api';
import { useNavigate } from 'react-router-dom';


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
        <div className="bg-card border border-border shadow-sm rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-error-soft text-error flex items-center justify-center">
                        <BookOpen size={16} />
                    </div>
                    <h3 className="text-sm font-black text-main">آخر المقالات</h3>
                </div>
                <button
                    onClick={() => navigate('/admin/blog')}
                    className="text-micro font-bold text-info hover:underline"
                >
                    إدارة المقالات
                </button>
            </div>
            <div className="space-y-2">
                {articles.map(article => (
                    <div
                        key={article.id}
                        onClick={() => navigate('/admin/blog')}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-hover transition-all cursor-pointer"
                    >
                        <div className="flex items-center gap-2 min-w-0">
                            <span className="text-micro font-bold px-1.5 py-0.5 rounded-md bg-error-soft text-error shrink-0">
                                {article.category}
                            </span>
                            <span className="text-xs font-bold text-main truncate">{article.title}</span>
                        </div>
                        <div className="flex items-center gap-3 text-micro font-bold text-muted shrink-0">
                            <span className="flex items-center gap-1"><Calendar size={11} /> {article.date}</span>
                            <span className="flex items-center gap-1"><Eye size={11} /> {article.views}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
