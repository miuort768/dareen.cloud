import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PublicNavbar } from '../../components/public/PublicNavbar';
import { PublicFooter } from '../../components/public/PublicFooter';
import { SEO } from '../../components/SEO';
import { blogPosts as staticPosts } from '../../data/blogPosts';
import { Calendar, User, ArrowLeft, BookOpen, Loader2 } from 'lucide-react';
import { api } from '../../lib/api';
import { cn } from '../../lib/utils';

const gradeNames: Record<string, string> = {
    '1': 'الأول', '2': 'الثاني', '3': 'الثالث', '4': 'الرابع', '5': 'الخامس',
    '6': 'السادس', '7': 'السابع', '8': 'الثامن', '9': 'التاسع',
    '10': 'العاشر', '11': 'الحادي عشر', '12': 'الثاني عشر',
};

const types = [
    { id: 'foundation', name: 'التأسيس', color: 'from-orange-500 to-orange-700', link: '/courses?category=foundation' },
    { id: 'solutions', name: 'حل الكتب', color: 'from-emerald-600 to-emerald-800', link: '' },
    { id: 'notes', name: 'المذكرات', color: 'from-violet-600 to-violet-800', link: '' },
    { id: 'summaries', name: 'ملخصات', color: 'from-rose-600 to-rose-800', link: '' },
];

const curriculums = [
    { id: 'kuwait', name: 'منهج كويتي 🇰🇼', color: 'from-blue-600 to-blue-800' },
    { id: 'qatar', name: 'منهج قطري 🇶🇦', color: 'from-red-700 to-red-900' },
    { id: 'uae', name: 'منهج إماراتي 🇦🇪', color: 'from-green-700 to-green-900' },
    { id: 'saudi', name: 'منهج سعودي 🇸🇦', color: 'from-emerald-700 to-emerald-900' },
];

const gradesMap: Record<string, { id: string; name: string; sub: string; color: string }[]> = {
    kuwait: [
        { id: 'primary', name: 'ابتدائي', sub: 'الصف ١ - ٥', color: 'from-blue-400 to-blue-600' },
        { id: 'middle', name: 'متوسط', sub: 'الصف ٦ - ٩', color: 'from-blue-600 to-blue-800' },
        { id: 'secondary', name: 'ثانوي', sub: 'الصف ١٠ - ١٢', color: 'from-blue-800 to-blue-950' },
    ],
    qatar: [
        { id: 'basic', name: 'أساسي', sub: 'الصف ١ - ٩', color: 'from-red-500 to-red-700' },
        { id: 'secondary', name: 'ثانوي', sub: 'الصف ١٠ - ١٢', color: 'from-red-800 to-red-950' },
    ],
    uae: [
        { id: 'primary', name: 'ابتدائي', sub: 'الصف ١ - ٥', color: 'from-green-400 to-green-600' },
        { id: 'preparatory', name: 'إعدادي', sub: 'الصف ٦ - ٩', color: 'from-green-600 to-green-800' },
        { id: 'secondary', name: 'ثانوي', sub: 'الصف ١٠ - ١٢', color: 'from-green-800 to-green-950' },
    ],
    saudi: [
        { id: 'primary', name: 'ابتدائي', sub: 'الصف ١ - ٦', color: 'from-emerald-400 to-emerald-600' },
        { id: 'middle', name: 'متوسط', sub: 'الصف ٧ - ٩', color: 'from-emerald-600 to-emerald-800' },
        { id: 'secondary', name: 'ثانوي', sub: 'الصف ١٠ - ١٢', color: 'from-emerald-800 to-emerald-950' },
    ],
};

// Classrooms per curriculum per level
const classroomsMap: Record<string, Record<string, string[]>> = {
    kuwait: {
        primary: ['1','2','3','4','5'],
        middle: ['6','7','8','9'],
        secondary: ['10','11','12'],
    },
    qatar: {
        basic: ['1','2','3','4','5','6','7','8','9'],
        secondary: ['10','11','12'],
    },
    uae: {
        primary: ['1','2','3','4','5'],
        preparatory: ['6','7','8','9'],
        secondary: ['10','11','12'],
    },
    saudi: {
        primary: ['1','2','3','4','5','6'],
        middle: ['7','8','9'],
        secondary: ['10','11','12'],
    },
};

const subjectsMap: Record<string, { id: string; name: string; color: string }[]> = {
    primary: [
        { id: 'islamic', name: 'إسلامية', color: 'from-teal-500 to-teal-700' },
        { id: 'arabic', name: 'عربي', color: 'from-amber-500 to-amber-700' },
        { id: 'math', name: 'رياضيات', color: 'from-blue-500 to-blue-700' },
        { id: 'science', name: 'علوم', color: 'from-green-500 to-green-700' },
        { id: 'english', name: 'إنجليزي', color: 'from-indigo-500 to-indigo-700' },
        { id: 'social', name: 'اجتماعيات', color: 'from-orange-500 to-orange-700' },
    ],
    middle: [
        { id: 'islamic', name: 'إسلامية', color: 'from-teal-500 to-teal-700' },
        { id: 'arabic', name: 'عربي', color: 'from-amber-500 to-amber-700' },
        { id: 'math', name: 'رياضيات', color: 'from-blue-500 to-blue-700' },
        { id: 'physics', name: 'فيزياء', color: 'from-yellow-500 to-yellow-700' },
        { id: 'chemistry', name: 'كيمياء', color: 'from-purple-500 to-purple-700' },
        { id: 'biology', name: 'أحياء', color: 'from-green-600 to-green-800' },
        { id: 'english', name: 'إنجليزي', color: 'from-indigo-500 to-indigo-700' },
        { id: 'history', name: 'تاريخ', color: 'from-stone-500 to-stone-700' },
        { id: 'geography', name: 'جغرافيا', color: 'from-cyan-500 to-cyan-700' },
    ],
    secondary: [
        { id: 'islamic', name: 'إسلامية', color: 'from-teal-500 to-teal-700' },
        { id: 'arabic', name: 'عربي', color: 'from-amber-500 to-amber-700' },
        { id: 'math', name: 'رياضيات', color: 'from-blue-500 to-blue-700' },
        { id: 'physics', name: 'فيزياء', color: 'from-yellow-500 to-yellow-700' },
        { id: 'chemistry', name: 'كيمياء', color: 'from-purple-500 to-purple-700' },
        { id: 'biology', name: 'أحياء', color: 'from-green-600 to-green-800' },
        { id: 'english', name: 'إنجليزي', color: 'from-indigo-500 to-indigo-700' },
        { id: 'computer', name: 'حاسب آلي', color: 'from-slate-500 to-slate-700' },
        { id: 'stats', name: 'إحصاء', color: 'from-rose-500 to-rose-700' },
        { id: 'history', name: 'تاريخ', color: 'from-stone-500 to-stone-700' },
        { id: 'geography', name: 'جغرافيا', color: 'from-cyan-500 to-cyan-700' },
    ],
    // Qatar basic & UAE preparatory → middle-level subjects
    basic: [],
    preparatory: [],
};
subjectsMap.basic = subjectsMap.middle;
subjectsMap.preparatory = subjectsMap.middle;

type ViewType = 'types' | 'curriculums' | 'grades' | 'classrooms' | 'terms' | 'subjects';

export const Blog = () => {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<ViewType>('types');
    const [selectedType, setSelectedType] = useState('');
    const [selectedCurriculum, setSelectedCurriculum] = useState('');
    const [selectedLevel, setSelectedLevel] = useState('');
    const [selectedGrade, setSelectedGrade] = useState('');
    const [selectedTerm, setSelectedTerm] = useState('');

    const currentTypeName = types.find(t => t.id === selectedType)?.name || '';
    const currentCurriculumName = curriculums.find(c => c.id === selectedCurriculum)?.name || '';
    const currentLevelName = gradesMap[selectedCurriculum]?.find(g => g.id === selectedLevel)?.name || '';
    const currentGrades = gradesMap[selectedCurriculum] || [];
    const currentClassrooms = classroomsMap[selectedCurriculum]?.[selectedLevel] || [];
    const currentSubjects = subjectsMap[selectedLevel] || subjectsMap.middle;
    const termLabel = selectedTerm === '1' ? 'ترم أول' : selectedTerm === '2' ? 'ترم ثاني' : 'الكل';
    const btnBase = "relative h-16 flex flex-col items-center justify-center transition-all duration-300 shadow-lg shadow-black/5 group bg-gradient-to-br overflow-hidden";

    const goBack = () => {
        if (view === 'subjects') setView('terms');
        else if (view === 'terms') setView('classrooms');
        else if (view === 'classrooms') setView('grades');
        else if (view === 'grades') setView('curriculums');
        else if (view === 'curriculums') setView('types');
    };


    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const data = await api.get<any[]>('/blog');
                setPosts(data.length > 0 ? data : staticPosts);
            } catch (err) {
                console.error('Failed to fetch blog posts:', err);
                setPosts(staticPosts);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    return (
        <div className="min-h-full bg-[#fafafa] dark:bg-slate-950 font-sans text-gray-800 dark:text-slate-100 relative flex flex-col">
            <SEO
                title="المدونة التعليمية | مقالات ونصائح للتفوق الدراسي"
                description="استكشف أحدث المقالات التعليمية، نصائح المذاكرة، وتحديثات المناهج في السعودية، الكويت، ودول الخليج من خبراء دارين السابعة."
                keywords="مدونة دارين, مقالات تعليمية, نصائح المذاكرة, اختبار القدرات, المنهج الكويتي, المنهج السعودي, تعليم عن بعد"
                url="https://dareen-edu.com/books"
                breadcrumbs={[
                    { name: 'الرئيسية', item: '/' },
                    { name: 'المدونة', item: '/books' }
                ]}
            />
            <PublicNavbar />
            
            <main className="flex-grow pt-24 md:pt-32 pb-16 relative overflow-hidden bg-[#fafafa] dark:bg-slate-950">
                {/* Premium Background Elements */}
                <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.08]" 
                     style={{ 
                         backgroundImage: 'radial-gradient(circle at 5% 10%, #4F46E5 0%, transparent 35%), radial-gradient(circle at 95% 90%, #7C3AED 0%, transparent 35%)',
                         filter: 'blur(100px)'
                     }}>
                </div>
                <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.02]"
                     style={{ 
                         backgroundImage: 'url("https://www.transparenttextures.com/patterns/simple-dashed.png")',
                         backgroundSize: '150px 150px'
                     }}>
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    {/* Dynamic Header */}
                    <div className="text-center max-w-3xl mx-auto mb-8">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50/50 dark:bg-indigo-500/10 backdrop-blur-sm border border-indigo-100 dark:border-indigo-500/20 rounded-full mb-4">
                            <BookOpen size={14} className="text-indigo-600" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600/80">
                                {view === 'types' ? 'منصة المعرفة الذكية'
                                : view === 'curriculums' ? `تحميل ${currentTypeName}`
                                : view === 'grades' ? currentCurriculumName
                                : view === 'classrooms' ? `${currentCurriculumName} — ${currentLevelName}`
                                : view === 'terms' ? `الصف ${gradeNames[selectedGrade]} — ${currentLevelName}`
                                : `${termLabel} — الصف ${gradeNames[selectedGrade]}`}
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-heading font-black text-slate-900 dark:text-white mb-3 transition-all duration-500">
                            {view === 'types' ? (<>مدونة <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-600">دارين السابعة</span></>)
                            : view === 'curriculums' ? (<>تحميل <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-600">{currentTypeName}</span></>)
                            : view === 'grades' ? (<>تحميل <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-600">{currentCurriculumName}</span></>)
                            : view === 'classrooms' ? (<>مرحلة <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-600">{currentLevelName}</span></>)
                            : view === 'terms' ? (<>الصف <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-600">{gradeNames[selectedGrade]}</span> — اختر الترم</>)
                            : (<>مواد <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-600">{termLabel}</span> — الصف {gradeNames[selectedGrade]}</>)}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-xl mx-auto font-medium">
                            {view === 'types' ? 'دليلك الشامل للتفوق الدراسي، أحدث المناهج الخليجية، ونصائح الخبراء.'
                            : view === 'curriculums' ? 'اختر المنهج الدراسي المناسب لبلدك.'
                            : view === 'grades' ? 'اختر المرحلة الدراسية المناسبة.'
                            : view === 'classrooms' ? 'اختر الصف الدراسي.'
                            : view === 'terms' ? 'اختر الترم الدراسي.'
                            : 'اختر المادة الدراسية للوصول للمحتوى.'}
                        </p>
                    </div>

                    {/* 5-Tier Navigation */}
                    <div className="max-w-5xl mx-auto mb-16 px-2">
                        <div className={cn(
                            "grid gap-3",
                            view === 'classrooms' && currentClassrooms.length > 5
                                ? "grid-cols-3 md:grid-cols-6"
                                : "grid-cols-2 md:grid-cols-5"
                        )}>

                            {/* TIER 1: Types */}
                            {view === 'types' && (<>
                                {types.map(cat => cat.link ? (
                                    <Link key={cat.id} to={cat.link} onClick={() => window.scrollTo(0,0)} className={cn(btnBase, cat.color)}>
                                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <span className="relative z-10 text-[10px] sm:text-xs font-black text-white text-center uppercase tracking-widest px-2">{cat.name}</span>
                                    </Link>
                                ) : (
                                    <button key={cat.id} onClick={() => { setSelectedType(cat.id); setView('curriculums'); }} className={cn(btnBase, cat.color)}>
                                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <span className="relative z-10 text-[10px] sm:text-xs font-black text-white text-center uppercase tracking-widest px-2">{cat.name}</span>
                                    </button>
                                ))}
                                <Link to="/courses" className="relative h-16 flex items-center justify-center transition-all duration-300 shadow-lg hover:bg-indigo-600 group bg-slate-900 col-span-2 md:col-span-1">
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">المزيد</span>
                                </Link>
                            </>)}

                            {/* TIER 2: Curriculums */}
                            {view === 'curriculums' && (<>
                                {curriculums.map(curr => (
                                    <button key={curr.id} onClick={() => { setSelectedCurriculum(curr.id); setView('grades'); }} className={cn(btnBase, curr.color, "animate-in zoom-in-95 duration-300")}>
                                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <span className="relative z-10 text-[10px] sm:text-xs font-black text-white text-center tracking-widest px-2">{curr.name}</span>
                                    </button>
                                ))}
                                <button onClick={goBack} className="relative h-16 flex flex-col items-center justify-center gap-1 shadow-lg hover:bg-slate-700 group bg-slate-800 col-span-2 md:col-span-1 animate-in zoom-in-95 duration-300">
                                    <span className="text-xl text-white group-hover:-translate-x-1 transition-transform">←</span>
                                    <span className="text-[9px] font-black text-white/60 uppercase">الرئيسية</span>
                                </button>
                            </>)}

                            {/* TIER 3: Level (مرحلة) */}
                            {view === 'grades' && (<>
                                {currentGrades.map(grade => (
                                    <button key={grade.id} onClick={() => { setSelectedLevel(grade.id); setView('classrooms'); }} className={cn(btnBase, grade.color, "animate-in zoom-in-95 duration-300")}>
                                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <span className="relative z-10 text-[10px] sm:text-xs font-black text-white text-center tracking-widest px-2">{grade.name}</span>
                                        <span className="relative z-10 text-[8px] text-white/70 font-bold mt-0.5">{grade.sub}</span>
                                    </button>
                                ))}
                                <button onClick={goBack} className="relative h-16 flex flex-col items-center justify-center gap-1 shadow-lg hover:bg-slate-700 group bg-slate-800 animate-in zoom-in-95 duration-300">
                                    <span className="text-xl text-white group-hover:-translate-x-1 transition-transform">←</span>
                                    <span className="text-[9px] font-black text-white/60 uppercase">المنهج</span>
                                </button>
                                <button onClick={() => setView('types')} className="relative h-16 flex flex-col items-center justify-center gap-1 shadow-lg hover:bg-slate-900 group bg-slate-950 animate-in zoom-in-95 duration-300">
                                    <span className="text-xl text-white group-hover:-translate-x-1 transition-transform">⌂</span>
                                    <span className="text-[9px] font-black text-white/60 uppercase">الرئيسية</span>
                                </button>
                            </>)}

                            {/* TIER 4: Classrooms (صفوف) */}
                            {view === 'classrooms' && (<>
                                {currentClassrooms.map(g => (
                                    <button key={g} onClick={() => { setSelectedGrade(g); setView('terms'); }} className="relative h-16 flex flex-col items-center justify-center gap-0.5 shadow-lg hover:bg-indigo-700 group bg-indigo-600 animate-in zoom-in-95 duration-300 overflow-hidden">
                                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <span className="relative z-10 text-xs font-black text-white">الصف</span>
                                        <span className="relative z-10 text-lg font-black text-white leading-none">{g}</span>
                                    </button>
                                ))}
                                <button onClick={goBack} className="relative h-16 flex flex-col items-center justify-center gap-1 shadow-lg hover:bg-slate-700 group bg-slate-800 animate-in zoom-in-95 duration-300">
                                    <span className="text-xl text-white group-hover:-translate-x-1 transition-transform">←</span>
                                    <span className="text-[9px] font-black text-white/60 uppercase">المرحلة</span>
                                </button>
                                <button onClick={() => setView('types')} className="relative h-16 flex flex-col items-center justify-center gap-1 shadow-lg hover:bg-slate-900 group bg-slate-950 animate-in zoom-in-95 duration-300">
                                    <span className="text-xl text-white group-hover:-translate-x-1 transition-transform">⌂</span>
                                    <span className="text-[9px] font-black text-white/60 uppercase">الرئيسية</span>
                                </button>
                            </>)}

                            {/* TIER 5: Terms (ترم) */}
                            {view === 'terms' && (<>
                                <button
                                    onClick={() => { setSelectedTerm('1'); setView('subjects'); }}
                                    className="relative h-16 flex flex-col items-center justify-center gap-1 shadow-lg group bg-gradient-to-br from-indigo-500 to-indigo-700 col-span-1 animate-in zoom-in-95 duration-300 overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <span className="relative z-10 text-xs font-black text-white">ترم أول</span>
                                    <span className="relative z-10 text-[9px] text-white/70 font-bold">الفصل الأول</span>
                                </button>
                                <button
                                    onClick={() => { setSelectedTerm('2'); setView('subjects'); }}
                                    className="relative h-16 flex flex-col items-center justify-center gap-1 shadow-lg group bg-gradient-to-br from-purple-500 to-purple-700 col-span-1 animate-in zoom-in-95 duration-300 overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <span className="relative z-10 text-xs font-black text-white">ترم ثاني</span>
                                    <span className="relative z-10 text-[9px] text-white/70 font-bold">الفصل الثاني</span>
                                </button>
                                <button
                                    onClick={() => { setSelectedTerm(''); setView('subjects'); }}
                                    className="relative h-16 flex flex-col items-center justify-center gap-1 shadow-lg group bg-gradient-to-br from-slate-500 to-slate-700 col-span-1 animate-in zoom-in-95 duration-300 overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <span className="relative z-10 text-[10px] font-black text-white uppercase tracking-widest">الكل</span>
                                </button>
                                <button onClick={goBack} className="relative h-16 flex flex-col items-center justify-center gap-1 shadow-lg hover:bg-slate-700 group bg-slate-800 animate-in zoom-in-95 duration-300">
                                    <span className="text-xl text-white group-hover:-translate-x-1 transition-transform">←</span>
                                    <span className="text-[9px] font-black text-white/60 uppercase">الصف</span>
                                </button>
                                <button onClick={() => setView('types')} className="relative h-16 flex flex-col items-center justify-center gap-1 shadow-lg hover:bg-slate-900 group bg-slate-950 animate-in zoom-in-95 duration-300">
                                    <span className="text-xl text-white group-hover:-translate-x-1 transition-transform">⌂</span>
                                    <span className="text-[9px] font-black text-white/60 uppercase">الرئيسية</span>
                                </button>
                            </>)}

                            {/* TIER 6: Subjects (مواد) */}
                            {view === 'subjects' && (<>
                                {currentSubjects.map(subj => (
                                    <Link
                                        key={subj.id}
                                        to={`/courses?category=${selectedType}&curriculum=${selectedCurriculum}&level=${selectedLevel}&grade=${selectedGrade}${selectedTerm ? `&term=${selectedTerm}` : ''}&subject=${subj.id}`}
                                        onClick={() => window.scrollTo(0,0)}
                                        className={cn(btnBase, subj.color, "animate-in zoom-in-95 duration-300")}
                                    >
                                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <span className="relative z-10 text-[10px] sm:text-xs font-black text-white text-center tracking-widest px-2">{subj.name}</span>
                                    </Link>
                                ))}
                                <button onClick={goBack} className="relative h-16 flex flex-col items-center justify-center gap-1 shadow-lg hover:bg-slate-700 group bg-slate-800 animate-in zoom-in-95 duration-300">
                                    <span className="text-xl text-white group-hover:-translate-x-1 transition-transform">←</span>
                                    <span className="text-[9px] font-black text-white/60 uppercase">الترم</span>
                                </button>
                                <button onClick={() => setView('types')} className="relative h-16 flex flex-col items-center justify-center gap-1 shadow-lg hover:bg-slate-900 group bg-slate-950 animate-in zoom-in-95 duration-300">
                                    <span className="text-xl text-white group-hover:-translate-x-1 transition-transform">⌂</span>
                                    <span className="text-[9px] font-black text-white/60 uppercase">الرئيسية</span>
                                </button>
                            </>)}

                        </div>
                    </div>


                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24">
                            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
                            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">جاري تحميل المعرفة...</span>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                            {posts.map((post, idx) => (
                                <Link 
                                    key={post.id} 
                                    to={`/books/${post.slug}`} 
                                    className={cn(
                                        "group bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl rounded-none shadow-xl shadow-black/5 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 border border-gray-100 dark:border-slate-800/50 flex flex-col h-full overflow-hidden",
                                        idx === 0 && "md:col-span-2 md:flex-row md:min-h-[400px]"
                                    )}
                                >
                                    <div className={cn(
                                        "relative w-full overflow-hidden shrink-0",
                                        idx === 0 ? "md:w-[50%] aspect-video md:aspect-auto" : "aspect-video"
                                    )}>
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 z-10"></div>
                                        <img 
                                            src={post.coverImage} 
                                            alt={post.title} 
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                                        />
                                        <div className="absolute top-4 right-4 z-20">
                                            <span className="bg-indigo-600 text-white text-[9px] font-black px-3 py-1.5 uppercase tracking-wider shadow-xl">
                                                {post.category}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-6 md:p-10 flex flex-col flex-grow justify-center">
                                        <div className="flex items-center gap-4 text-[10px] text-gray-400 dark:text-slate-500 font-black uppercase tracking-widest mb-4">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar size={14} className="text-indigo-500" /> 
                                                <span>{post.date?.split('T')[0]}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <User size={14} className="text-indigo-500" /> 
                                                <span>{post.author}</span>
                                            </div>
                                        </div>
                                        <h2 className={cn(
                                            "font-black text-gray-900 dark:text-white mb-4 font-heading group-hover:text-indigo-600 transition-colors leading-tight",
                                            idx === 0 ? "text-2xl md:text-3xl" : "text-xl"
                                        )}>
                                            {post.title}
                                        </h2>
                                        <p className="text-gray-500 dark:text-slate-400 text-sm md:text-base mb-6 line-clamp-2 leading-relaxed font-medium">
                                            {post.excerpt}
                                        </p>
                                        <div className="mt-auto inline-flex items-center gap-3 text-indigo-600 dark:text-indigo-400 font-black text-xs uppercase tracking-[0.2em]">
                                            <span>اقرأ المقال بالكامل</span>
                                            <ArrowLeft size={18} className="group-hover:-translate-x-2 transition-transform" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {!loading && posts.length === 0 && (
                        <div className="text-center py-24">
                            <BookOpen size={48} className="text-gray-200 mx-auto mb-4" />
                            <p className="text-gray-400 font-bold">لا توجد مقالات حالياً، ننتظرك قريباً!</p>
                        </div>
                    )}
                </div>
            </main>

            <PublicFooter />
        </div>
    );
};
