import { Link } from 'react-router-dom';
import { Image } from '../../shared/components/ui';

interface RelatedPost {
    slug: string;
    title: string;
    excerpt: string;
    coverImage: string;
    date: string;
}

interface BlogPostRelatedPostsProps {
    posts: RelatedPost[];
}

export const BlogPostRelatedPosts = ({ posts }: BlogPostRelatedPostsProps) => {
    if (!posts || !Array.isArray(posts) || posts.length === 0) return null;
    return (
        <div className="container mx-auto px-4 max-w-5xl mt-16 mb-8">
            <h2 className="text-2xl font-black text-main mb-6">مقالات ذات صلة</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {posts.map((rp) => (
                    <Link key={rp.slug} to={`/books/${rp.slug}`} className="group block bg-card rounded-card overflow-hidden shadow-md hover:shadow-xl transition-all border border-border">
                        <div className="aspect-[16/9] bg-surface overflow-hidden">
                            <Image src={rp.coverImage || ''} alt={rp.title} className="w-full h-full group-hover:scale-105" />
                        </div>
                        <div className="p-4">
                            <p className="text-micro font-bold text-muted mb-1">{rp.date}</p>
                            <h3 className="font-black text-sm text-main group-hover:text-error transition-colors line-clamp-2">{rp.title}</h3>
                            {rp.excerpt && <p className="text-xs text-muted mt-1 line-clamp-2">{rp.excerpt}</p>}
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};
