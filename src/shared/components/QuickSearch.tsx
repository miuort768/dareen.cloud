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
                className="flex items-center gap-3 px-4 py-2 bg-gray-100 hover:bg-primary-50 dark:bg-gray-800 dark:hover:bg-primary-900/20 transition-all text-gray-500 hover:text-primary-600 border border-transparent hover:border-primary-200"
            >
                <Search size={16} />
                <span className="text-sm font-bold">بحث سريع...</span>
                <kbd className="hidden lg:inline-block px-1.5 py-0.5 bg-white border border-gray-200 text-[10px] font-black rounded-none shadow-sm ml-4">Ctrl+K</kbd>
            </button>
        );
    }

    return (
        <>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] animate-in fade-in duration-300" onClick={() => setIsOpen(false)} />
            <div className="fixed top-24 left-1/2 -translate-x-1/2 w-full max-w-2xl z-[70] px-4 animate-in zoom-in-95 duration-200">
                <div className="bg-white dark:bg-gray-900 border-t-4 border-primary-600 shadow-2xl overflow-hidden rounded-none">
                    <div className="flex items-center gap-4 p-5 bg-gray-50 dark:bg-gray-800/50">
                        <Search className="text-primary-600" size={24} />
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="ابحث عن طالب، معلمة، أو صفحة عبر النظام..."
                            className="flex-1 bg-transparent outline-none text-lg font-bold text-gray-900 dark:text-white placeholder-gray-400 text-right"
                            dir="rtl"
                        />
                        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-red-500"><X size={20} /></button>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar p-2">
                        {isTeacher ? (
                            <div className="p-16 text-center">
                                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30 rounded-full flex items-center justify-center">
                                    <Lock size={48} className="text-amber-600 dark:text-amber-400" />
                                </div>
                                <h3 className="font-black text-xl text-gray-700 dark:text-gray-200 mb-3">نعتذر بشدة</h3>
                                <p className="text-gray-500 dark:text-gray-400 font-bold mb-2">
                                    الصلاحية الكاملة لمستر أحمد فقط
                                </p>
                                <p className="text-primary-600 font-bold text-lg mt-4">نتمنى لك التوفيق 💪</p>
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
                                            index === selectedIndex ? "bg-primary-600 text-white shadow-lg" : "hover:bg-primary-50 text-gray-700 dark:text-gray-300 dark:hover:bg-primary-900/10"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-12 h-12 flex items-center justify-center rounded-none shadow-sm",
                                            index === selectedIndex ? "bg-white/20" : "bg-gray-100 dark:bg-gray-800"
                                        )}>
                                            <Icon size={20} className={index === selectedIndex ? "text-white" : "text-primary-600"} />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-black text-sm uppercase tracking-tight">{result.title}</h4>
                                            {result.subtitle && <p className={cn("text-[10px] font-bold mt-0.5", index === selectedIndex ? "text-primary-100" : "text-gray-400")}>{result.subtitle}</p>}
                                        </div>
                                        <span className={cn(
                                            "text-[9px] font-black px-2 py-1 uppercase tracking-widest",
                                            index === selectedIndex ? "bg-white/10 text-white" : "bg-gray-200 dark:bg-gray-800 text-gray-500"
                                        )}>
                                            {result.type === 'page' ? 'صفحة' : result.type === 'student' ? 'طالب' : result.type === 'teacher' ? 'معلمة' : 'ولي أمر'}
                                        </span>
                                    </button>
                                );
                            })
                        ) : (
                            <div className="p-16 text-center text-gray-300">
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
