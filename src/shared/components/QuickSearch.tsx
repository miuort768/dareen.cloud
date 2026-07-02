import { useState, useEffect, useRef, useMemo } from 'react';
import { Search, User, GraduationCap, Users, FileText, Clock, TrendingUp, X, Lock, type LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useCurrentUser } from '../../context/AppContext';
import { useSharedData } from '../hooks/useSharedData';

interface SearchResult {
    id: string;
    type: 'student' | 'teacher' | 'parent' | 'page';
    title: string;
    subtitle?: string;
    link: string;
    icon: LucideIcon;
}

const PAGES: SearchResult[] = [
    { id: 'dashboard', type: 'page', title: 'نظرة عامة', link: '/', icon: TrendingUp },
    { id: 'students', type: 'page', title: 'إدارة الطلاب', link: '/students', icon: User },
    { id: 'teachers', type: 'page', title: 'المعلمات', link: '/teachers', icon: GraduationCap },
    { id: 'parents', type: 'page', title: 'أولياء الأمور', link: '/parents', icon: Users },
    { id: 'attendance', type: 'page', title: 'التحضير اليومي', link: '/attendance', icon: Clock },
    { id: 'finance', type: 'page', title: 'المالية', link: '/finance', icon: FileText }
];

export const QuickSearch = () => {
    const { students, teachers, parents } = useSharedData();

    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);

    const inputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();
    const currentUser = useCurrentUser();
    const isTeacher = currentUser?.role === 'teacher';

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(true);
            }
            if (e.key === 'Escape') setIsOpen(false);
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        if (isOpen && inputRef.current) inputRef.current.focus();
    }, [isOpen]);

    const results = useMemo<SearchResult[]>(() => {
        if (!query.trim()) {
            return PAGES;
        }

        const q = query.toLowerCase();
        const filteredPages = PAGES.filter(p => p.title.includes(q));

        const filteredStudents: SearchResult[] = students
            .filter(s => s.name?.toLowerCase().includes(q))
            .map(s => ({
                id: s.id, type: 'student', title: s.name, subtitle: s.grade, link: '/students', icon: User
            }));

        const filteredTeachers: SearchResult[] = teachers
            .filter(t => t.name?.toLowerCase().includes(q))
            .map(t => ({
                id: t.id, type: 'teacher', title: t.name, subtitle: t.subject, link: '/teachers', icon: GraduationCap
            }));

        const filteredParents: SearchResult[] = parents
            .filter(p => p.name?.toLowerCase().includes(q) || p.phone?.includes(q))
            .map(p => ({
                id: p.id, type: 'parent', title: p.name, subtitle: p.phone, link: '/parents', icon: Users
            }));

        return [...filteredPages, ...filteredStudents, ...filteredTeachers, ...filteredParents].slice(0, 8);
    }, [query, students, teachers, parents]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % results.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
        } else if (e.key === 'Enter' && results[selectedIndex]) {
            handleSelect(results[selectedIndex]);
        }
    };

    const handleSelect = (result: SearchResult) => {
        navigate(result.link);
        setIsOpen(false);
        setQuery('');
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-3 px-4 py-2 bg-surface hover:bg-primary-soft dark:bg-card dark:hover:bg-primary/20 transition-all text-muted hover:text-primary border border-transparent hover:border-primary"
            >
                <Search size={16} />
                <span className="text-sm font-bold">بحث سريع...</span>
                <kbd className="hidden lg:inline-block px-1.5 py-0.5 bg-white border border-border text-[10px] font-black rounded-none shadow-sm ml-4">Ctrl+K</kbd>
            </button>
        );
    }

    return (
        <>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] animate-in fade-in duration-300" onClick={() => setIsOpen(false)} />
            <div className="fixed top-24 left-1/2 -translate-x-1/2 w-full max-w-2xl z-[70] px-4 animate-in zoom-in-95 duration-200">
                <div className="bg-white dark:bg-card border-t-4 border-primary shadow-2xl overflow-hidden rounded-none">
                    <div className="flex items-center gap-4 p-5 bg-background dark:bg-card/50">
                        <Search className="text-primary" size={24} />
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="ابحث عن طالب، معلمة، أو صفحة عبر النظام..."
                            className="flex-1 bg-transparent outline-none text-lg font-bold text-main dark:text-on-primary placeholder-gray-400 text-right"
                            dir="rtl"
                        />
                        <button onClick={() => setIsOpen(false)} className="text-muted hover:text-error"><X size={20} /></button>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar p-2">
                        {isTeacher ? (
                            <div className="p-16 text-center">
                                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from--[var(--bg-warning)] to--[var(--bg-warning)] dark:from--[var(--bg-warning)]/30 dark:to--[var(--bg-warning)]/30 rounded-full flex items-center justify-center">
                                    <Lock size={48} className="text-warning dark:text-warning" />
                                </div>
                                <h3 className="font-black text-xl text-main dark:text-dim mb-3">نعتذر بشدة</h3>
                                <p className="text-muted dark:text-muted font-bold mb-2">
                                    الصلاحية الكاملة لمستر أحمد فقط
                                </p>
                                <p className="text-primary font-bold text-lg mt-4">نتمنى لك التوفيق 💪</p>
                            </div>
                        ) : results.length > 0 ? (
                            results.map((result, index) => {
                                const Icon = result.icon;
                                return (
                                    <button
                                        key={`${result.type}-${result.id}`}
                                        onClick={() => handleSelect(result)}
                                        className={cn(
                                            "w-full flex items-center gap-4 p-4 transition-all text-right group",
                                            index === selectedIndex ? "bg-primary text-on-primary shadow-lg" : "hover:bg-primary-soft text-main dark:text-dim dark:hover:bg-primary/10"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-12 h-12 flex items-center justify-center rounded-none shadow-sm",
                                            index === selectedIndex ? "bg-white/20" : "bg-surface dark:bg-card"
                                        )}>
                                            <Icon size={20} className={index === selectedIndex ? "text-on-primary" : "text-primary"} />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-black text-sm uppercase tracking-tight">{result.title}</h4>
                                            {result.subtitle && <p className={cn("text-[10px] font-bold mt-0.5", index === selectedIndex ? "text-primary" : "text-muted")}>{result.subtitle}</p>}
                                        </div>
                                        <span className={cn(
                                            "text-[9px] font-black px-2 py-1 uppercase tracking-widest",
                                            index === selectedIndex ? "bg-white/10 text-on-primary" : "bg-surface dark:bg-card text-muted"
                                        )}>
                                            {result.type === 'page' ? 'صفحة' : result.type === 'student' ? 'طالب' : result.type === 'teacher' ? 'معلمة' : 'ولي أمر'}
                                        </span>
                                    </button>
                                );
                            })
                        ) : (
                            <div className="p-16 text-center text-dim">
                                <Search size={64} className="mx-auto mb-4 opacity-10" />
                                <p className="font-black text-sm uppercase tracking-widest">لم يتم العثور على نتائج</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};
