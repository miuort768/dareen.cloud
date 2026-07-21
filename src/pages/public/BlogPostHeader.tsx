import { Link } from 'react-router-dom';
import { Calendar, Clock, User, ArrowRight, BookOpen, GraduationCap, School, Tag } from 'lucide-react';



const curriculumNames: Record<string, string> = { kuwait: 'منهج كويتي', qatar: 'منهج قطري', uae: 'منهج إماراتي', saudi: 'منهج سعودي' };
const levelNames: Record<string, string> = { primary: 'ابتدائي', middle: 'متوسط', secondary: 'ثانوي', basic: 'أساسي', preparatory: 'إعدادي' };
const subjectNames: Record<string, string> = { arabic: 'عربي', math: 'رياضيات', islamic: 'إسلامية', english: 'إنجليزي', science: 'علوم', physics: 'فيزياء', chemistry: 'كيمياء', biology: 'أحياء', history: 'تاريخ', geography: 'جغرافيا', social: 'اجتماعيات', computer: 'حاسب آلي', stats: 'إحصاء' };
const termNames: Record<string, string> = { '1': 'الفصل الأول', '2': 'الفصل الثاني' };
const gradeNames: Record<string, string> = { '1': 'الأول', '2': 'الثاني', '3': 'الثالث', '4': 'الرابع', '5': 'الخامس', '6': 'السادس', '7': 'السابع', '8': 'الثامن', '9': 'التاسع', '10': 'العاشر', '11': 'الحادي عشر', '12': 'الثاني عشر' };

interface BlogPostHeaderProps {
    post: { title: string; category: string; date: string; readingTime?: string; author: string; contentType?: string; curriculum?: string; level?: string; grade?: string; term?: string; subject?: string; tags?: string; coverImage?: string; excerpt?: string };
}

export const BlogPostHeader = ({ post }: BlogPostHeaderProps) => (
    <header className="container mx-auto px-4 max-w-4xl mb-6 md:mb-12">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 md:gap-0 mb-3 md:mb-6">
            <div className="order-2 md:order-1 flex flex-wrap gap-4 items-center">
                <span className="bg-error-light dark:bg-error/30 text-error dark:text-error font-black text-xs px-3 py-1.5 uppercase tracking-widest">{post.category}</span>
                <div className="flex items-center gap-4 text-xs text-muted dark:text-muted font-medium">
                    <div className="flex items-center gap-1.5"><Calendar size={14} /> <span>{post.date}</span></div>
                    {post.readingTime ? <div className="flex items-center gap-1.5"><Clock size={14} /> <span>{post.readingTime} دقيقة قراءة</span></div> : null}
                    <div className="bg-error-light dark:bg-error/30 text-error dark:text-error font-black text-xs sm:text-xs px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg"><User size={12} className="inline" /> {post.author}</div>
                    <div className="flex items-center gap-2 md:hidden mt-2">
                        <a href={`https://wa.me/?text=${encodeURIComponent(post.title + ' ' + window.location.href)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-success text-on-success text-xs font-bold rounded-lg hover:opacity-80 transition-all">
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.5 6.5a8.5 8.5 0 0 1-3.5 16.2"/><path d="M3 21l1.7-5.9a8.5 8.5 0 1 1 5.8 5.8L3 21z"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="12" y1="8" x2="12" y2="16"/></svg><span>واتساب</span>
                        </a>
                        <a href={`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(post.title)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-info text-on-info text-xs font-bold rounded-lg hover:opacity-80 transition-all">
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.2 4.2L2.8 12.9c-.8.3-.7 1.5.1 1.7l5.1 1.4 2 6.3c.3.9 1.4.9 1.7 0L21.2 4.2z"/><path d="M11.9 15.7l6.5-6.5"/><path d="M9 21l3.4-5.8"/></svg><span>تيليجرام</span>
                        </a>
                    </div>
                </div>
            </div>
            <Link to="/books" className="order-1 md:order-2 w-full md:w-auto inline-flex items-center justify-center md:justify-start gap-2 px-4 py-3 bg-hover dark:bg-card text-main dark:text-main hover:bg-primary hover:text-on-primary dark:hover:text-on-primary transition-all font-bold text-sm rounded-card">
                <ArrowRight size={16} /><span>العودة لجميع المقالات</span>
            </Link>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-black text-main dark:text-main leading-tight mb-2 md:mb-4">{post.title}</h1>
        {post.contentType !== 'more' && post.contentType !== 'foundation' && (post.curriculum || post.level || post.grade || post.term || post.subject) && (
            <div className="flex flex-wrap gap-2 mb-4">
                {post.curriculum && <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-info-light dark:bg-info/10 text-info dark:text-info text-xs font-bold rounded-lg border border-info/50 dark:border-info/20"><BookOpen size={12} />{curriculumNames[post.curriculum] || post.curriculum}</span>}
                {post.level && <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-success-light dark:bg-success/10 text-success dark:text-success text-xs font-bold rounded-lg border border-success/50 dark:border-success/20"><GraduationCap size={12} />{levelNames[post.level] || post.level}</span>}
                {post.grade && <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-soft dark:bg-primary/10 text-primary dark:text-primary text-xs font-bold rounded-lg border border-primary/50 dark:border-primary/20"><School size={12} />الصف {gradeNames[post.grade] || post.grade}</span>}
                {post.term && <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-warning-light dark:bg-warning/10 text-warning dark:text-warning text-xs font-bold rounded-lg border border-warning/50 dark:border-warning/20"><Tag size={12} />{termNames[post.term] || post.term}</span>}
                {post.subject && <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-error-light dark:bg-error/10 text-error dark:text-error text-xs font-bold rounded-lg border border-error/50 dark:border-error/20"><BookOpen size={12} />{subjectNames[post.subject] || post.subject}</span>}
            </div>
        )}
        {post.tags && (() => {
            const tags = Array.isArray(post.tags) ? post.tags : (typeof post.tags === 'string' ? post.tags.split(',').map(t => t.trim()) : []);
            if (tags.length === 0) return null;
            return (
                <div className="flex flex-wrap gap-2 mb-4">
                    {tags.map((tag: string, i: number) => <span key={`tag-${i}`} className="text-micro font-bold text-muted dark:text-muted bg-surface dark:bg-card px-2 py-1 rounded-lg">#{tag}</span>)}
                </div>
            );
        })()}
    </header>
);
