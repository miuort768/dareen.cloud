import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Play } from 'lucide-react';

interface BlogPostShareSectionProps {
    post: { title: string; slug: string };
    whatsappNumber: string;
}

export const BlogPostShareSection = ({ post, whatsappNumber }: BlogPostShareSectionProps) => {
    const [copied, setCopied] = useState(false);
    const url = window.location.href;

    return (
        <div className="border-t border-border dark:border-border pt-8 mt-0 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
                <span className="font-bold text-main dark:text-on-primary text-sm">شارك</span>
                <a href={`https://wa.me/?text=${encodeURIComponent(post.title + ' ' + url)}`} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-success flex items-center justify-center hover:opacity-80 transition-all text-on-primary" title="واتساب">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.5 6.5a8.5 8.5 0 0 1-3.5 16.2"/><path d="M3 21l1.7-5.9a8.5 8.5 0 1 1 5.8 5.8L3 21z"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="12" y1="8" x2="12" y2="16"/></svg>
                </a>
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-info flex items-center justify-center hover:opacity-80 transition-all text-on-primary" title="فيسبوك">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </a>
                <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title + ' ' + url)}`} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-black dark:bg-primary-active flex items-center justify-center hover:opacity-80 transition-all text-on-primary" title="تويتر">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4l11.7 16.4L20 4"/><path d="M4 20l6.5-8.8"/><path d="M14.5 8.8L20 4"/></svg>
                </a>
                <a href={`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(post.title)}`} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-info flex items-center justify-center hover:opacity-80 transition-all text-on-primary" title="تيليجرام">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.2 4.2L2.8 12.9c-.8.3-.7 1.5.1 1.7l5.1 1.4 2 6.3c.3.9 1.4.9 1.7 0L21.2 4.2z"/><path d="M11.9 15.7l6.5-6.5"/><path d="M9 21l3.4-5.8"/></svg>
                </a>
                <button onClick={() => { navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }); }} className="w-9 h-9 rounded-full bg-gradient-to-br from-primary via-primary to-warning flex items-center justify-center hover:opacity-80 transition-all text-on-primary" title="انسخ الرابط">
                    {copied ? <span className="text-micro font-black">تم</span> : <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>}
                </button>
                <button onClick={() => { navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }).catch(() => { if (navigator.share) navigator.share({ title: post.title, url }); }); }} className="w-9 h-9 rounded-full bg-background0 flex items-center justify-center hover:opacity-80 transition-all text-on-primary" title="نسخ الرابط">
                    {copied ? <span className="text-micro font-black">تم</span> : <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>}
                </button>
            </div>
            <div className="flex items-center gap-3">
                <a href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('السلام عليكم، لدي سؤال عن ' + post.title)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-4 bg-success text-on-primary font-black text-sm rounded-card hover:bg-success transition-all shadow-lg">
                    <MessageCircle size={18} /><span>لدي سؤال؟</span>
                </a>
                <Link to="/courses" className="inline-flex items-center gap-2 px-6 py-4 bg-card dark:bg-white text-main dark:text-main font-black text-sm rounded-card shadow-lg hover:bg-error dark:hover:bg-error hover:text-on-primary transition-all">
                    <Play size={18} /> ابدأ التعلم الآن
                </Link>
            </div>
        </div>
    );
};
