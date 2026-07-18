import { useState, useEffect, useCallback } from 'react';
import { useShowNotification } from '../context/AppContext';
import { api } from '../lib/api';
import { confirm } from '../lib/confirmDialog';
import { useSettingsStore } from '../store/settingsStore';
import { BlogHeader } from './admin-blog/BlogHeader';
import { BlogSearchBar } from './admin-blog/BlogSearchBar';
import { BlogForm } from './admin-blog/BlogForm';
import { BlogGrid } from './admin-blog/BlogGrid';
import type { BlogPost, BlogPostRaw } from './admin-blog/types';

export const AdminBlog = () => {
    const showNotification = useShowNotification();
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
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
    const { libraryWhatsapp: savedWhatsapp, libraryTelegram: savedTelegram, setSetting } = useSettingsStore();

    useEffect(() => {
        if (savedWhatsapp) setLibraryWhatsapp(savedWhatsapp);
        if (savedTelegram) setLibraryTelegram(savedTelegram);
    }, [savedWhatsapp, savedTelegram]);

    const fetchPosts = useCallback(async () => {
        try {
            setLoading(true);
            const data = await api.get<BlogPost[]>('/blog?all=true');
            setPosts(data.map(post => {
                const raw = post as BlogPostRaw;
                return {
                    ...post,
                    fileSize: post.fileSize || raw.file_size,
                    showButtons: post.showButtons ?? (raw.show_buttons === 1 || raw.show_buttons === true),
                    downloadButtonText: post.downloadButtonText || raw.download_button_text,
                    watchButtonText: post.watchButtonText || raw.watch_button_text,
                };
            }));
            setLoading(false);
        } catch (e) {
            console.error(e);
            showNotification('حدث خطأ في تحميل المقالات', 'error');
            setLoading(false);
        }
    }, [showNotification]);

    useEffect(() => { fetchPosts(); }, [fetchPosts]);

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
            setPosts(posts.filter(p => p.id !== id));
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
            fetchPosts();
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

    return (
        <div className="min-h-full pb-24 overflow-x-hidden relative" dir="rtl">
            <div className="max-w-page mx-auto px-2 space-y-6">
                <BlogHeader
                    handleOpenModal={() => handleOpenModal()}
                    showSettings={showSettings} setShowSettings={setShowSettings}
                    libraryWhatsapp={libraryWhatsapp} setLibraryWhatsapp={setLibraryWhatsapp}
                    libraryTelegram={libraryTelegram} setLibraryTelegram={setLibraryTelegram}
                    savedWhatsapp={savedWhatsapp} savedTelegram={savedTelegram}
                    savingSettings={savingSettings}
                    handleSaveSettings={handleSaveSettings}
                    handleCancelSettings={handleCancelSettings}
                />

                {!isModalOpen && (
                    <BlogSearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} filterType={filterType} setFilterType={setFilterType} />
                )}

                <BlogForm
                    isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen}
                    currentPost={currentPost} setCurrentPost={setCurrentPost}
                    contentPart1={contentPart1} setContentPart1={setContentPart1}
                    contentPart2={contentPart2} setContentPart2={setContentPart2}
                    submitting={submitting} handleSubmit={handleSubmit}
                />

                {!isModalOpen && (
                    <BlogGrid loading={loading} filteredPosts={filteredPosts} handleOpenModal={handleOpenModal} handleDelete={handleDelete} />
                )}
            </div>
        </div>
    );
};
