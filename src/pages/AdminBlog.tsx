import { useState, useEffect, useCallback } from 'react';
import { useShowNotification } from '../context/AppContext';
import { Plus, Search, Edit2, Trash2, ExternalLink, Calendar, User, Tag, Image as ImageIcon, Link as LinkIcon, Loader2, Save, X, BookOpen } from 'lucide-react';
import { api } from '../lib/api';

interface BlogPost {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    coverImage: string;
    category: string;
    keywords: string;
    author: string;
    date: string;
    // ‰Ÿ«„ «· ’‰Ì› «·ÃœÌœ
    contentType: string;   // notes | solutions | summaries | foundation
    curriculum: string;    // kuwait | qatar | uae | saudi
    level: string;         // primary | middle | secondary | basic | preparatory
    grade: string;         // 1-12
    term: string;          // 1 | 2 | ''
    subject: string;       // arabic | math | physics ...
}

export const AdminBlog = () => {
    const showNotification = useShowNotification();
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPost, setCurrentPost] = useState<Partial<BlogPost> | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const fetchPosts = useCallback(async () => {
        try {
            setLoading(true);
            const data = await api.get<BlogPost[]>('/blog');
            setPosts(data);
            } catch {
                setError('ÕœÀ Œÿ√ √À‰«¡ Ã·» «·»Ì«‰« ');
                setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const handleOpenModal = (post: BlogPost | null = null) => {
        if (post) {
            setCurrentPost(post);
        } else {
            setCurrentPost({
                title: '',
                slug: '',
                excerpt: '',
                content: '',
                coverImage: '',
                category: '⁄«„',
                keywords: '',
                author: '≈œ«—… œ«—Ì‰',
                date: new Date().toISOString().split('T')[0],
                contentType: 'notes',
                curriculum: 'kuwait',
                level: 'middle',
                grade: '7',
                term: '1',
                subject: 'arabic',
            });
        }
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Â· √‰  „ √ﬂœ „‰ Õ–› Â–« «·„ﬁ«·ø')) return;
        try {
            await api.delete(`/blog/${id}`);
            showNotification(' „ Õ–› «·„ﬁ«· »‰Ã«Õ', 'success');
            setPosts(posts.filter(p => p.id !== id));
        } catch {
            showNotification('›‘· Õ–› «·„ﬁ«·', 'error');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentPost?.title || !currentPost?.slug) {
            showNotification('Ì—ÃÏ „·¡ «·ÕﬁÊ· «·√”«”Ì…', 'warning');
            return;
        }

        try {
            setSubmitting(true);
            if (currentPost.id) {
                await api.put(`/blog/${currentPost.id}`, currentPost);
                showNotification(' „  ÕœÌÀ «·„ﬁ«· »‰Ã«Õ', 'success');
            } else {
                await api.post('/blog', currentPost);
                showNotification(' „ ≈÷«›… «·„ﬁ«· »‰Ã«Õ', 'success');
            }
            setIsModalOpen(false);
            fetchPosts();
        } catch (err) {
            showNotification(err.message || '›‘· Õ›Ÿ «·„ﬁ«·', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredPosts = posts.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-full pb-24 overflow-x-hidden relative bg-gradient-to-br from-slate-50 via-white to-sky-50/30 dark:from-[#020617] dark:via-slate-950 dark:to-sky-950/20 font-dash" dir="rtl">
            <div className="absolute inset-0 opacity-\[0\.03\] dark:opacity-\[0\.05\] opacity-50 pointer-events-none" />
            <div className="relative z-10 max-w-[1600px] mx-auto px-2 space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-medium text-slate-900 dark:text-white">≈œ«—… «·„œÊ‰… «· ⁄·Ì„Ì…</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">√÷› ÊÕ—— «·„ﬁ«·«  ·“Ì«œ… ŸÂÊ— «·„‰’… ›Ì „Õ—ﬂ«  «·»ÕÀ.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-br from-red-600 to-rose-700 text-white font-medium rounded-none hover:from-red-700 hover:to-rose-800 transition-all shadow-sm shadow-red-600/20"
                >
                    <Plus size={20} />
                    <span>„ﬁ«· ÃœÌœ</span>
                </button>
            </div>

            {/* Search & Filters */}
            <div className="bg-white dark:bg-slate-900 p-4 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
                <div className="relative flex-grow">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="»ÕÀ ›Ì «·⁄‰«ÊÌ‰ √Ê «· ’‰Ì›« ..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border-none pr-12 py-3 focus:ring-2 focus:ring-red-500 transition-all font-normal text-sm"
                    />
                </div>
            </div>

            {/* Posts Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
                </div>
            ) : filteredPosts.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800">
                    <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500 dark:text-slate-400 font-normal">·« ÌÊÃœ „ﬁ«·«  Õ«·Ì«° «»œ√ »≈÷«›… √Ê· „ﬁ«·!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPosts.map(post => (
                        <div key={post.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm group overflow-hidden">
                            <div className="relative h-40 overflow-hidden">
                                <img src={post.coverImage || 'https://via.placeholder.com/400x200'} alt={post.title} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute top-2 right-2">
                                    <span className="bg-red-600 text-white text-[10px] font-medium px-2 py-1 uppercase">{post.category}</span>
                                </div>
                            </div>
                            <div className="p-5">
                                <h3 className="font-medium text-slate-900 dark:text-white mb-2 line-clamp-2 min-h-[3rem]">{post.title}</h3>
                                <div className="flex items-center gap-3 text-[10px] text-slate-500 mb-4">
                                    <div className="flex items-center gap-1"><Calendar size={12} /> {post.date}</div>
                                    <div className="flex items-center gap-1"><User size={12} /> {post.author}</div>
                                </div>
                                <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800">
                                    <div className="flex gap-2">
                                        <button onClick={() => handleOpenModal(post)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"><Edit2 size={18} /></button>
                                        <button onClick={() => handleDelete(post.id)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"><Trash2 size={18} /></button>
                                    </div>
                                    <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer" className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"><ExternalLink size={18} /></a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Form */}
            {isModalOpen && currentPost && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60   animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-sm border border-slate-200 dark:border-slate-800">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <h2 className="text-xl font-medium">{currentPost.id ? ' ⁄œÌ· „ﬁ«·' : '≈÷«›… „ﬁ«· ÃœÌœ'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-slate-400 uppercase tracking-widest block">⁄‰Ê«‰ «·„ﬁ«·</label>
                                    <input
                                        required
                                        type="text"
                                        value={currentPost.title}
                                        onChange={(e) => setCurrentPost({ ...currentPost, title: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none px-4 py-3 focus:ring-2 focus:ring-red-500 font-normal text-sm"
                                        placeholder="„À«·: √›÷· ÿ—ﬁ «·„–«ﬂ—…..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-slate-400 uppercase tracking-widest block">«·—«»ÿ «·„Œ ’— (Slug)</label>
                                    <div className="relative">
                                        <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input
                                            required
                                            type="text"
                                            value={currentPost.slug}
                                            onChange={(e) => setCurrentPost({ ...currentPost, slug: e.target.value.replace(/\s+/g, '-').toLowerCase() })}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none px-4 py-3 pl-10 focus:ring-2 focus:ring-red-500 font-normal text-sm text-left"
                                            dir="ltr"
                                            placeholder="best-study-tips"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-slate-400 uppercase tracking-widest block">«· ’‰Ì›</label>
                                    <div className="relative">
                                        <Tag className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input
                                            type="text"
                                            value={currentPost.category}
                                            onChange={(e) => setCurrentPost({ ...currentPost, category: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none pr-10 py-3 focus:ring-2 focus:ring-red-500 font-normal text-sm"
                                            placeholder="„À«·: ‰’«∆Õ  ⁄·Ì„Ì…"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-slate-400 uppercase tracking-widest block">«·ﬂ« »</label>
                                    <input
                                        type="text"
                                        value={currentPost.author}
                                        onChange={(e) => setCurrentPost({ ...currentPost, author: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none px-4 py-3 focus:ring-2 focus:ring-red-500 font-normal text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-slate-400 uppercase tracking-widest block">«· «—ÌŒ</label>
                                    <input
                                        type="date"
                                        value={currentPost.date?.split('T')[0]}
                                        onChange={(e) => setCurrentPost({ ...currentPost, date: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none px-4 py-3 focus:ring-2 focus:ring-red-500 font-normal text-sm"
                                    />
                                </div>
                            </div>

                            {/* ?? Classification Fields ?? */}
                            <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-800 p-4">
                                <p className="text-[10px] font-medium text-indigo-600 uppercase tracking-widest mb-4"> ’‰Ì› «·„Õ ÊÏ ó ÌŸÂ— ›Ì ‰Ÿ«„ «· ’›Õ</p>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-medium text-slate-400 uppercase">‰Ê⁄ «·„Õ ÊÏ</label>
                                        <select value={currentPost.contentType} onChange={e => setCurrentPost({ ...currentPost, contentType: e.target.value })} className="w-full bg-white dark:bg-slate-800 border-none px-3 py-2.5 text-sm font-normal focus:ring-2 focus:ring-indigo-500">
                                            <option value="notes">„–ﬂ—« </option>
                                            <option value="solutions">Õ· ﬂ »</option>
                                            <option value="summaries">„·Œ’« </option>
                                            <option value="foundation"> √”Ì”</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-medium text-slate-400 uppercase">«·„‰ÂÃ</label>
                                        <select value={currentPost.curriculum} onChange={e => setCurrentPost({ ...currentPost, curriculum: e.target.value })} className="w-full bg-white dark:bg-slate-800 border-none px-3 py-2.5 text-sm font-normal focus:ring-2 focus:ring-indigo-500">
                                            <option value="kuwait">ﬂÊÌ Ì</option>
                                            <option value="qatar">ﬁÿ—Ì</option>
                                            <option value="uae">≈„«—« Ì</option>
                                            <option value="saudi">”⁄ÊœÌ</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-medium text-slate-400 uppercase">«·„—Õ·…</label>
                                        <select value={currentPost.level} onChange={e => setCurrentPost({ ...currentPost, level: e.target.value })} className="w-full bg-white dark:bg-slate-800 border-none px-3 py-2.5 text-sm font-normal focus:ring-2 focus:ring-indigo-500">
                                            <option value="primary">«» œ«∆Ì</option>
                                            <option value="middle">„ Ê”ÿ</option>
                                            <option value="secondary">À«‰ÊÌ</option>
                                            <option value="basic">√”«”Ì (ﬁÿ—)</option>
                                            <option value="preparatory">≈⁄œ«œÌ (≈„«—« )</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-medium text-slate-400 uppercase">«·’›</label>
                                        <select value={currentPost.grade} onChange={e => setCurrentPost({ ...currentPost, grade: e.target.value })} className="w-full bg-white dark:bg-slate-800 border-none px-3 py-2.5 text-sm font-normal focus:ring-2 focus:ring-indigo-500">
                                            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map(g => <option key={g} value={g}>«·’› {g}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-medium text-slate-400 uppercase">«· —„</label>
                                        <select value={currentPost.term} onChange={e => setCurrentPost({ ...currentPost, term: e.target.value })} className="w-full bg-white dark:bg-slate-800 border-none px-3 py-2.5 text-sm font-normal focus:ring-2 focus:ring-indigo-500">
                                            <option value="1"> —„ √Ê·</option>
                                            <option value="2"> —„ À«‰Ì</option>
                                            <option value="">«·ﬂ·</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-medium text-slate-400 uppercase">«·„«œ…</label>
                                        <select value={currentPost.subject} onChange={e => setCurrentPost({ ...currentPost, subject: e.target.value })} className="w-full bg-white dark:bg-slate-800 border-none px-3 py-2.5 text-sm font-normal focus:ring-2 focus:ring-indigo-500">
                                            <option value="arabic">⁄—»Ì</option>
                                            <option value="math">—Ì«÷Ì« </option>
                                            <option value="islamic">≈”·«„Ì…</option>
                                            <option value="english">≈‰Ã·Ì“Ì</option>
                                            <option value="science">⁄·Ê„</option>
                                            <option value="physics">›Ì“Ì«¡</option>
                                            <option value="chemistry">ﬂÌ„Ì«¡</option>
                                            <option value="biology">√ÕÌ«¡</option>
                                            <option value="history"> «—ÌŒ</option>
                                            <option value="geography">Ã€—«›Ì«</option>
                                            <option value="social">«Ã „«⁄Ì« </option>
                                            <option value="computer">Õ«”» ¬·Ì</option>
                                            <option value="stats">≈Õ’«¡</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-slate-400 uppercase tracking-widest block">—«»ÿ ’Ê—… «·€·«›</label>
                                <div className="relative">
                                    <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="url"
                                        value={currentPost.coverImage}
                                        onChange={(e) => setCurrentPost({ ...currentPost, coverImage: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none px-4 py-3 pl-10 focus:ring-2 focus:ring-red-500 font-normal text-sm text-left"
                                        dir="ltr"
                                        placeholder="https://..."
                                    />
                                </div>
                                {currentPost.coverImage && (
                                    <div className="mt-2 h-32 w-full border border-slate-100 dark:border-slate-800 overflow-hidden">
                                        <img
                                            src={currentPost.coverImage}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=Invalid+Image+Link';
                                            }}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-slate-400 uppercase tracking-widest block">«·ﬂ·„«  «·œ·«·Ì… (Keywords) - „›’Ê·… »›«’·…</label>
                                <input
                                    type="text"
                                    value={currentPost.keywords}
                                    onChange={(e) => setCurrentPost({ ...currentPost, keywords: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-none px-4 py-3 focus:ring-2 focus:ring-red-500 font-normal text-sm"
                                    placeholder="”ÌÊ°  ⁄·Ì„° «·ﬂÊÌ ° «·”⁄ÊœÌ…"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-slate-400 uppercase tracking-widest block">„ﬁ ÿ› «·„ﬁ«· («·Ÿ«Â— ›Ì «·Œ«—Ã)</label>
                                <textarea
                                    rows={2}
                                    value={currentPost.excerpt}
                                    onChange={(e) => setCurrentPost({ ...currentPost, excerpt: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-none px-4 py-3 focus:ring-2 focus:ring-red-500 font-normal text-sm resize-none"
                                    placeholder="Ê’› „Œ ’— ··„ﬁ«· ·Ã–» «·ﬁ—«¡..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-slate-400 uppercase tracking-widest block">„Õ ÊÏ «·„ﬁ«· (Ìœ⁄„ HTML)</label>
                                <textarea
                                    rows={10}
                                    required
                                    value={currentPost.content}
                                    onChange={(e) => setCurrentPost({ ...currentPost, content: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-none px-4 py-3 focus:ring-2 focus:ring-red-500 font-normal text-sm resize-none font-mono"
                                    placeholder="«ﬂ » „Õ ÊÏ «·„ﬁ«· Â‰«..."
                                />
                            </div>
                        </form>

                        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex justify-end gap-4">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="px-6 py-3 font-normal text-slate-500 hover:text-slate-800 transition-colors"
                            >
                                ≈·€«¡
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                onClick={handleSubmit}
                                className="flex items-center gap-2 px-10 py-3 bg-red-600 text-white font-medium hover:bg-red-700 transition-all disabled:bg-slate-400 shadow-sm shadow-red-600/20"
                            >
                                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save size={20} />}
                                <span>Õ›Ÿ «·„ﬁ«· «·¬‰</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
};
