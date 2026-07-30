import { useState, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useShowNotification } from '../context/AppContext';
import { api, safeArray } from '../lib/api';
import { confirm } from '../lib/confirmDialog';
import { useSettingsStore } from '../store/settingsStore';
import { BlogHeader } from './admin-blog/BlogHeader';
import { BlogSearchBar } from './admin-blog/BlogSearchBar';
import { BlogForm } from './admin-blog/BlogForm';
import { BlogGrid } from './admin-blog/BlogGrid';
import type { BlogPost } from './admin-blog/types';
import { BookOpen, Plus, FileText, Eye, Star, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

const particles = Array.from({ length: 8 }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100,
    size: Math.random() * 5 + 2, duration: Math.random() * 6 + 4, delay: Math.random() * 3,
}));

export const AdminBlog = () => {
    useEffect(() => { document.title = 'المدونة | دارين السابعة للتعليم والتدريب'; }, []);
    const showNotification = useShowNotification();
    const queryClient = useQueryClient();
    const { data: posts = [], isLoading: loading } = useQuery<BlogPost[]>({
        queryKey: ['blog'],
        queryFn: () => api.get('/blog?all=true'),
        select: (data) => safeArray<BlogPost>(data).map(post => {
            const raw = post as Record<string, unknown>;
            return {
                ...post,
                fileSize: post.fileSize || (raw.file_size as string),
                showButtons: post.showButtons ?? (raw.show_buttons === 1 || raw.show_buttons === true),
                downloadButtonText: post.downloadButtonText || (raw.download_button_text as string),
                watchButtonText: post.watchButtonText || (raw.watch_button_text as string),
            };
        }),
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('');
    const [contentPart1, setContentPart1] = useState('');
    const [contentPart2, setContentPart2] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPost, setCurrentPost] = useState<Partial<BlogPost> | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [libraryWhatsapp, setLibraryWhatsapp] = useState('');
    const [libraryTelegram, setLibraryTelegram] = useState('');
    const [savingSettings, setSavingSettings] = useState(false);
    const [fabOpen, setFabOpen] = useState(false);
    const savedWhatsapp = useSettingsStore(s => s.libraryWhatsapp);
    const savedTelegram = useSettingsStore(s => s.libraryTelegram);
    const setSetting = useSettingsStore(s => s.setSetting);

    useEffect(() => {
        if (savedWhatsapp) setLibraryWhatsapp(savedWhatsapp);
        if (savedTelegram) setLibraryTelegram(savedTelegram);
    }, [savedWhatsapp, savedTelegram]);

    const handleOpenModal = (post: BlogPost | null = null) => {
        if (post) {
            setCurrentPost(post);
            const parts = post.content.split('\n\n').filter(Boolean);
            setContentPart1(parts[0] || '');
            setContentPart2(parts.slice(1).join('\n\n'));
        } else {
            setCurrentPost({
                title: '', slug: '', excerpt: '', content: '', coverImage: '', category: 'عام',
                keywords: '', author: 'فريق دارين', date: new Date().toISOString().split('T')[0],
                contentType: 'notes', curriculum: 'kuwait', level: 'middle', grade: '7', term: '1',
                subject: 'arabic', downloadLink: '', watchLink: '', showButtons: true,
                downloadButtonText: '', watchButtonText: '', isNew: false, views: 0,
                seoTitle: '', seoDescription: '', ogImage: '', focusKeyword: '', readingTime: 0,
                canonicalUrl: '', robotsIndex: true, isFeatured: false, tags: '',
            } as BlogPost);
            setContentPart1('');
            setContentPart2('');
        }
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!await confirm('هل أنت متأكد من حذف هذا المقال؟')) return;
        try {
            await api.delete(`/blog/${id}`);
            showNotification('تم حذف المقال بنجاح', 'success');
            queryClient.invalidateQueries({ queryKey: ['blog'] });
        } catch (e) {
            console.error(e);
            showNotification('حدث خطأ في الحذف', 'error');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentPost?.title || !currentPost?.slug) {
            showNotification('يرجى إكمال الحقول المطلوبة', 'warning');
            return;
        }
        const postData = { ...currentPost, content: contentPart1 + (contentPart2 ? '\n\n' + contentPart2 : '') };
        try {
            setSubmitting(true);
            if (currentPost.id) {
                await api.put(`/blog/${currentPost.id}`, postData);
                showNotification('تم تحديث المقال بنجاح', 'success');
            } else {
                await api.post('/blog', postData);
                showNotification('تم نشر المقال بنجاح', 'success');
            }
            setIsModalOpen(false);
            queryClient.invalidateQueries({ queryKey: ['blog'] });
        } catch (err) {
            showNotification(err instanceof Error ? err.message : 'حدث خطأ في الحفظ', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSaveSettings = async () => {
        setSavingSettings(true);
        try {
            await Promise.all([
                setSetting('libraryWhatsapp', libraryWhatsapp),
                setSetting('libraryTelegram', libraryTelegram),
            ]);
            showNotification('تم حفظ إعدادات المكتبة', 'success');
            setShowSettings(false);
        } catch (e) {
            console.error(e);
            showNotification('حدث خطأ في الحفظ', 'error');
        } finally {
            setSavingSettings(false);
        }
    };

    const handleCancelSettings = () => {
        setShowSettings(false);
        setLibraryWhatsapp(savedWhatsapp);
        setLibraryTelegram(savedTelegram);
    };

    const filteredPosts = posts.filter(post =>
        (post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.category.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (!filterType || post.contentType === filterType)
    );

    const kpiCards = useMemo(() => [
        { label: 'إجمالي المقالات', value: posts.length, icon: BookOpen, gradient: 'from-primary/20 to-primary/5', iconBg: 'bg-primary/10 text-primary', accent: 'bg-primary' },
        { label: 'المميزة', value: posts.filter(p => p.isFeatured).length, icon: Star, gradient: 'from-warning/20 to-warning/5', iconBg: 'bg-warning/10 text-warning', accent: 'bg-warning' },
        { label: 'إجمالي المشاهدات', value: posts.reduce((s, p) => s + (p.views || 0), 0), icon: Eye, gradient: 'from-success/20 to-success/5', iconBg: 'bg-success/10 text-success', accent: 'bg-success' },
        { label: 'الأنواع', value: new Set(posts.map(p => p.contentType)).size, icon: FileText, gradient: 'from-info/20 to-info/5', iconBg: 'bg-info/10 text-info', accent: 'bg-info' },
    ], [posts]);

    const fabActions = useMemo(() => [
        { icon: Plus, label: 'مقال جديد', onClick: () => handleOpenModal() },
        { icon: Filter, label: 'بحث', onClick: () => document.querySelector('[data-search]')?.scrollIntoView({ behavior: 'smooth' }) },
        { icon: Star, label: 'المميزة', onClick: () => setFilterType(filterType === '' ? 'notes' : '') },
    ], [filterType]);

    return (
        <div className="min-h-full pb-24 overflow-x-hidden relative" dir="rtl">
            <div className="max-w-page mx-auto px-2 space-y-3">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-error via-error/90 to-error-hover p-6 md:p-8">
                    {particles.map(p => (
                        <motion.div key={p.id} className="absolute rounded-full bg-white/10 pointer-events-none"
                            style={{ width: p.size, height: p.size, left: `${p.x}%`, top: `${p.y}%` }}
                            animate={{ y: [0, -20, 0], opacity: [0.2, 0.5, 0.2] }} transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }} />
                    ))}
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-2 rounded-xl bg-white/15 backdrop-blur-sm"><BookOpen className="text-white" size={20} /></div>
                                <span className="text-white/70 text-xs font-medium">المدونة</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">المقالات</h1>
                            <p className="text-white/70 text-sm">إدارة المقالات والدروس التعليمية</p>
                        </div>
                        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                            <div className="text-center">
                                <p className="text-white/60 text-xs mb-1">المقالات</p>
                                <p className="text-2xl font-bold text-white">{posts.length}</p>
                            </div>
                            <div className="w-px h-10 bg-white/10" />
                            <div className="text-center">
                                <p className="text-white/60 text-xs mb-1">المشاهدات</p>
                                <p className="text-2xl font-bold text-white">{posts.reduce((s, p) => s + (p.views || 0), 0)}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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

                <BlogHeader handleOpenModal={() => handleOpenModal()} showSettings={showSettings} setShowSettings={setShowSettings}
                    libraryWhatsapp={libraryWhatsapp} setLibraryWhatsapp={setLibraryWhatsapp}
                    libraryTelegram={libraryTelegram} setLibraryTelegram={setLibraryTelegram}
                    savedWhatsapp={savedWhatsapp} savedTelegram={savedTelegram}
                    savingSettings={savingSettings} handleSaveSettings={handleSaveSettings} handleCancelSettings={handleCancelSettings} />

                {!isModalOpen && (
                    <div data-search>
                        <BlogSearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} filterType={filterType} setFilterType={setFilterType} />
                    </div>
                )}

                <BlogForm isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen}
                    currentPost={currentPost} setCurrentPost={setCurrentPost}
                    contentPart1={contentPart1} setContentPart1={setContentPart1}
                    contentPart2={contentPart2} setContentPart2={setContentPart2}
                    submitting={submitting} handleSubmit={handleSubmit} />

                {!isModalOpen && (
                    <BlogGrid loading={loading} filteredPosts={filteredPosts} handleOpenModal={handleOpenModal} handleDelete={handleDelete} />
                )}
            </div>

            <div className="fixed bottom-6 end-6 z-50 flex flex-col items-end gap-3">
                <AnimatePresence>
                    {fabOpen && fabActions.map((action, i) => (
                        <motion.div key={action.label} initial={{ opacity: 0, scale: 0.3, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.3, y: 20 }} transition={{ delay: 0.05 * (fabActions.length - 1 - i) }} className="flex items-center gap-2">
                            <span className="bg-card border border-border text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm whitespace-nowrap">{action.label}</span>
                            <button onClick={() => { action.onClick(); setFabOpen(false); }}
                                className="w-10 h-10 rounded-full bg-error text-white shadow-lg hover:shadow-xl hover:bg-error-hover transition-all flex items-center justify-center">
                                <action.icon size={18} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
                <motion.button onClick={() => setFabOpen(!fabOpen)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    className={cn("w-12 h-12 rounded-full shadow-xl text-white flex items-center justify-center transition-all", fabOpen ? "bg-error rotate-45" : "bg-error")}>
                    <Plus size={24} />
                </motion.button>
            </div>
        </div>
    );
};
