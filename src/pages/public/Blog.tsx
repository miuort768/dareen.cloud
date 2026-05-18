import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PublicNavbar } from '../../components/public/PublicNavbar';
import { PublicFooter } from '../../components/public/PublicFooter';
import { SEO } from '../../components/SEO';
import { blogPosts as staticPosts } from '../../data/blogPosts';
import { Zap, CheckCircle, FileText, AlignLeft, Building2, Anchor, Building, Palmtree, GraduationCap, School, BookOpen, Loader2, ArrowLeft, Calendar, User } from 'lucide-react';
import { api } from '../../lib/api';
import { cn } from '../../lib/utils';

const gradeNames: Record<string, string> = {
    '1': 'الأول', '2': 'الثاني', '3': 'الثالث', '4': 'الرابع', '5': 'الخامس',
    '6': 'السادس', '7': 'السابع', '8': 'الثامن', '9': 'التاسع',
    '10': 'العاشر', '11': 'الحادي عشر', '12': 'الثاني عشر',
};

const types = [
    { id: 'foundation', name: 'التأسيس', color: 'from-orange-500 to-orange-700', icon: Zap, link: '/courses?category=foundation' },
    { id: 'solutions', name: 'حل الكتب', color: 'from-emerald-600 to-emerald-800', icon: CheckCircle, link: '' },
    { id: 'notes', name: 'المذكرات', color: 'from-violet-600 to-violet-800', icon: FileText, link: '' },
    { id: 'summaries', name: 'ملخصات', color: 'from-rose-600 to-rose-800', icon: AlignLeft, link: '' },
];

const curriculums = [
    { id: 'kuwait', name: 'منهج كويتي', color: 'from-blue-600 to-blue-800', icon: Building2 },
    { id: 'qatar', name: 'منهج قطري', color: 'from-red-700 to-red-900', icon: Anchor },
    { id: 'uae', name: 'منهج إماراتي', color: 'from-green-700 to-green-900', icon: Building },
    { id: 'saudi', name: 'منهج سعودي', color: 'from-emerald-700 to-emerald-900', icon: Palmtree },
];

const gradesMap: Record<string, { id: string; name: string; sub: string; color: string; icon: React.ElementType }[]> = {
    kuwait: [
        { id: 'primary', name: 'المرحلة الابتدائية - كويتي', sub: 'الصف ١ - ٥', color: 'from-blue-400 to-blue-600', icon: School },
        { id: 'middle', name: 'المرحلة المتوسطة - كويتي', sub: 'الصف ٦ - ٩', color: 'from-blue-600 to-blue-800', icon: GraduationCap },
        { id: 'secondary', name: 'المرحلة الثانوية - كويتي', sub: 'الصف ١٠ - ١٢', color: 'from-blue-800 to-blue-950', icon: GraduationCap },
    ],
    qatar: [
        { id: 'basic', name: 'المرحلة الأساسية - قطري', sub: 'الصف ١ - ٩', color: 'from-red-500 to-red-700', icon: School },
        { id: 'secondary', name: 'المرحلة الثانوية - قطري', sub: 'الصف ١٠ - ١٢', color: 'from-red-800 to-red-950', icon: GraduationCap },
    ],
    uae: [
        { id: 'primary', name: 'المرحلة الابتدائية - إماراتي', sub: 'الصف ١ - ٥', color: 'from-green-400 to-green-600', icon: School },
        { id: 'preparatory', name: 'المرحلة الإعدادية - إماراتي', sub: 'الصف ٦ - ٩', color: 'from-green-600 to-green-800', icon: School },
        { id: 'secondary', name: 'المرحلة الثانوية - إماراتي', sub: 'الصف ١٠ - ١٢', color: 'from-green-800 to-green-950', icon: GraduationCap },
    ],
    saudi: [
        { id: 'primary', name: 'المرحلة الابتدائية - سعودي', sub: 'الصف ١ - ٦', color: 'from-emerald-400 to-emerald-600', icon: School },
        { id: 'middle', name: 'المرحلة المتوسطة - سعودي', sub: 'الصف ٧ - ٩', color: 'from-emerald-600 to-emerald-800', icon: School },
        { id: 'secondary', name: 'المرحلة الثانوية - سعودي', sub: 'الصف ١٠ - ١٢', color: 'from-emerald-800 to-emerald-950', icon: GraduationCap },
    ],
};

// Classrooms per curriculum per level
const classroomsMap: Record<string, Record<string, string[]>> = {
    kuwait: {
        primary: ['1', '2', '3', '4', '5'],
        middle: ['6', '7', '8', '9'],
        secondary: ['10', '11', '12'],
    },
    qatar: {
        basic: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
        secondary: ['10', '11', '12'],
    },
    uae: {
        primary: ['1', '2', '3', '4', '5'],
        preparatory: ['6', '7', '8', '9'],
        secondary: ['10', '11', '12'],
    },
    saudi: {
        primary: ['1', '2', '3', '4', '5', '6'],
        middle: ['7', '8', '9'],
        secondary: ['10', '11', '12'],
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

type ViewType = 'types' | 'curriculums' | 'grades' | 'classrooms' | 'terms' | 'subjects' | 'results';

export const Blog = () => {
    const [posts, setPosts] = useState<typeof staticPosts>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<ViewType>('types');
    const [selectedType, setSelectedType] = useState('');
    const [selectedCurriculum, setSelectedCurriculum] = useState('');
    const [selectedLevel, setSelectedLevel] = useState('');
    const [selectedGrade, setSelectedGrade] = useState('');
    const [selectedTerm, setSelectedTerm] = useState('');

    const [selectedSubject, setSelectedSubject] = useState('');

    const currentTypeName = types.find(t => t.id === selectedType)?.name || '';
    const currentCurriculumName = curriculums.find(c => c.id === selectedCurriculum)?.name || '';
    const currentLevelName = gradesMap[selectedCurriculum]?.find(g => g.id === selectedLevel)?.name || '';
    const currentSubjectName = (subjectsMap[selectedLevel] || subjectsMap.middle).find(s => s.id === selectedSubject)?.name || '';
    const currentGrades = gradesMap[selectedCurriculum] || [];
    const currentClassrooms = classroomsMap[selectedCurriculum]?.[selectedLevel] || [];
    const currentSubjects = subjectsMap[selectedLevel] || subjectsMap.middle;
    const termLabel = selectedTerm === '1' ? 'ترم أول' : selectedTerm === '2' ? 'ترم ثاني' : 'الكل';
    const btnBase = "relative h-16 flex flex-col items-center justify-center transition-all duration-300 shadow-lg shadow-black/5 dark:shadow-[0_0_15px_rgba(255,255,255,0.05)] group bg-gradient-to-br overflow-hidden";

    // فلترة المقالات بناءً على الاختيارات
    const filteredPosts = view === 'results' ? posts.filter(p => {
        if (selectedType && p.contentType !== selectedType) return false;
        if (selectedCurriculum && p.curriculum !== selectedCurriculum) return false;
        if (selectedLevel && p.level !== selectedLevel) return false;
        if (selectedGrade && p.grade !== selectedGrade) return false;
        if (selectedTerm && p.term && p.term !== selectedTerm) return false;
        if (selectedSubject && p.subject !== selectedSubject) return false;
        return true;
    }) : posts;

    const goBack = () => {
        if (view === 'results') setView('subjects');
        else if (view === 'subjects') setView('terms');
        else if (view === 'terms') setView('classrooms');
        else if (view === 'classrooms') setView('grades');
        else if (view === 'grades') setView('curriculums');
        else if (view === 'curriculums') setView('types');
    };


    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const data = await api.get<typeof staticPosts>('/blog');
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
                {/* Premium Background Elements - Enhanced */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse"></div>
                    <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]"></div>
                    <div className="absolute top-[20%] left-[5%] w-[15%] h-[15%] bg-indigo-400/5 rounded-full blur-[60px]"></div>

                    <div className="absolute inset-0 opacity-[0.08]"
                        style={{
                            backgroundImage: 'radial-gradient(circle at 5% 10%, #4F46E5 0%, transparent 35%), radial-gradient(circle at 95% 90%, #7C3AED 0%, transparent 35%)',
                            filter: 'blur(100px)'
                        }}>
                    </div>
                    <div className="absolute inset-0 opacity-[0.02]"
                        style={{
                            backgroundImage: 'url("https://www.transparenttextures.com/patterns/simple-dashed.png")',
                            backgroundSize: '150px 150px'
                        }}>
                    </div>
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    {(view === 'types' || view === 'curriculums' || view === 'grades') ? (
                        /* HERO VIEW (For Types, Curriculums, Grades) */
                        <div className="flex flex-col lg:flex-row items-center justify-center gap-2 lg:gap-4 lg:min-h-[450px] max-w-5xl mx-auto">
                            {/* Text Content */}
                            <div className="w-full lg:w-1/2 text-center lg:text-right">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50/50 dark:bg-indigo-500/10 backdrop-blur-sm border border-indigo-100 dark:border-indigo-500/20 rounded-full mb-4">
                                    <BookOpen size={14} className="text-indigo-600" />
                                    <span className="text-xs md:text-sm font-black text-indigo-600/80">
                                        {view === 'types' ? 'منصة المعرفة الذكية'
                                            : view === 'curriculums' ? `تحميل ${currentTypeName}`
                                                : currentCurriculumName}
                                    </span>
                                </div>
                                <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-black text-slate-900 dark:text-white mb-4 leading-tight">
                                    {view === 'types' ? (<>مدونة <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-600">دارين السابعة</span></>)
                                        : view === 'curriculums' ? (<>اختر <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-600">المنهج الدراسي</span></>)
                                            : (<>اختر <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-600">المرحلة الدراسية</span></>)}
                                </h1>
                                <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base leading-relaxed mb-6 max-w-lg mx-auto lg:mx-0 font-medium">
                                    {view === 'types' ? 'دليلك الشامل للتفوق الدراسي، أحدث المناهج الخليجية، ومصادر تعليمية حصرية.'
                                        : view === 'curriculums' ? `تصفح وتحميل ${currentTypeName} لأفضل المناهج التعليمية في الخليج.`
                                            : `جميع ملفات ${currentCurriculumName} مرتبة ومصنفة لتسهيل وصولك للمعلومة.`}
                                </p>

                                {/* Categories Grid - Hero Style */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto lg:mx-0">
                                    {view === 'types' && types.map((type) => (
                                        <button
                                            key={type.id}
                                            onClick={() => { setSelectedType(type.id); setView('curriculums'); }}
                                            className={cn("relative min-h-[3.5rem] py-2 px-3 flex flex-col items-center justify-center transition-all duration-300 shadow-lg dark:shadow-[0_0_15px_rgba(255,255,255,0.05)] group bg-gradient-to-br overflow-hidden border border-white/10", type.color)}
                                        >
                                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <div className="relative z-10 flex items-center gap-2">
                                                <type.icon size={18} className="text-white/80 group-hover:scale-110 transition-transform" />
                                                <span className="text-xs sm:text-sm font-black text-white text-center">{type.name}</span>
                                            </div>
                                        </button>
                                    ))}

                                    {view === 'curriculums' && curriculums.map((curr) => (
                                        <button
                                            key={curr.id}
                                            onClick={() => { setSelectedCurriculum(curr.id); setView('grades'); }}
                                            className={cn("relative min-h-[3.5rem] py-2 px-3 flex flex-col items-center justify-center transition-all duration-300 shadow-lg group bg-gradient-to-br overflow-hidden border border-white/10", curr.color)}
                                        >
                                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <div className="relative z-10 flex items-center gap-2">
                                                <curr.icon size={18} className="text-white/80 group-hover:scale-110 transition-transform" />
                                                <span className="text-xs sm:text-sm font-black text-white text-center">{curr.name}</span>
                                            </div>
                                        </button>
                                    ))}

                                    {view === 'grades' && currentGrades.map((grade) => (
                                        <button
                                            key={grade.id}
                                            onClick={() => { setSelectedLevel(grade.id); setView('classrooms'); }}
                                            className={cn("relative min-h-[3.5rem] py-2 px-3 flex flex-col items-center justify-center transition-all duration-300 shadow-lg group bg-gradient-to-br overflow-hidden border border-white/10", grade.color)}
                                        >
                                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <div className="relative z-10 flex items-center gap-2">
                                                <grade.icon size={18} className="text-white/80 group-hover:scale-110 transition-transform" />
                                                <span className="text-xs sm:text-sm font-black text-white text-center">{grade.name}</span>
                                            </div>
                                        </button>
                                    ))}

                                    {/* Control Buttons - Integrated into grid with dynamic balancing */}
                                    {(() => {
                                        const currentItemsCount =
                                            (view === 'types' ? types.length : 0) +
                                            (view === 'curriculums' ? curriculums.length : 0) +
                                            (view === 'grades' ? currentGrades.length : 0);

                                        const backBtnCount = (view !== 'types' ? 1 : 0);
                                        const browseBtnCount = 1;
                                        const totalItems = currentItemsCount + backBtnCount + browseBtnCount;
                                        const isTotalOdd = totalItems % 2 !== 0;

                                        return (<>
                                            {view !== 'types' && (
                                                <button
                                                    onClick={goBack}
                                                    className="relative min-h-[3.5rem] py-2 px-3 flex flex-col items-center justify-center transition-all duration-300 shadow-lg group bg-gradient-to-br from-rose-500 to-rose-700 overflow-hidden border border-white/10"
                                                >
                                                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    <div className="relative z-10 flex items-center gap-2">
                                                        <ArrowLeft size={16} className="text-white/80 group-hover:-translate-x-1 transition-transform" />
                                                        <span className="text-xs sm:text-sm font-black text-white text-center font-heading">العودة للخلف</span>
                                                    </div>
                                                </button>
                                            )}
                                            <Link
                                                to="/courses"
                                                className={cn(
                                                    "relative min-h-[3.5rem] py-2 px-3 flex flex-col items-center justify-center transition-all duration-300 shadow-lg group bg-gradient-to-br from-indigo-500 to-blue-700 overflow-hidden border border-white/10",
                                                    isTotalOdd && "sm:col-span-2"
                                                )}
                                            >
                                                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                <div className="relative z-10 flex items-center gap-2">
                                                    <BookOpen size={16} className="text-white/80 group-hover:scale-110 transition-transform" />
                                                    <span className="text-xs sm:text-sm font-black text-white text-center font-heading">تصفح الدورات</span>
                                                </div>
                                            </Link>
                                        </>);
                                    })()}
                                </div>
                            </div>

                            {/* Image Side (Desktop Only) */}
                            <div className="hidden lg:flex w-full lg:w-1/2 justify-center relative mt-2 lg:mt-0">
                                <div className="relative w-full max-w-[400px] aspect-auto lg:aspect-square flex items-center justify-center">
                                    {/* Decorative Elements - Static */}
                                    <div className="absolute inset-4 border border-dashed border-indigo-500/20 rounded-full"></div>
                                    <div className="absolute inset-12 border border-dashed border-purple-500/10 rounded-full"></div>
                                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-600/10 rounded-full blur-3xl"></div>

                                    <img
                                        src="/dareen_books_portal_v3.png"
                                        alt="بوابة دارين التعليمية"
                                        className="relative z-10 w-full h-auto object-contain drop-shadow-[0_15px_35px_rgba(79,70,229,0.2)]"
                                    />
                                </div>
                            </div>
                        </div>
                    ) : view === 'results' ? (
                        /* TIER 7: Results - filtered posts */
                        <div className="max-w-6xl mx-auto">
                            {/* Breadcrumb */}
                            <div className="flex flex-wrap items-center gap-2 mb-6 text-xs sm:text-sm font-black text-slate-400 ">
                                <button onClick={() => setView('types')} className="hover:text-indigo-600 transition-colors">الرئيسية</button>
                                <span>/</span><span className="text-slate-600">{currentTypeName}</span>
                                <span>/</span><span className="text-slate-600">{currentCurriculumName}</span>
                                <span>/</span><span className="text-slate-600">{currentLevelName}</span>
                                <span>/</span><span className="text-slate-600">الصف {selectedGrade}</span>
                                {selectedTerm && <><span>/</span><span className="text-slate-600">{termLabel}</span></>}
                                <span>/</span><span className="text-indigo-600">{currentSubjectName}</span>
                            </div>

                            {/* Back buttons */}
                            <div className="flex gap-2 mb-8">
                                <button onClick={goBack} className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs sm:text-sm font-black  transition-colors">
                                    <span>←</span><span>تغيير المادة</span>
                                </button>
                                <button onClick={() => setView('types')} className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-white text-xs sm:text-sm font-black  transition-colors">
                                    <span>⌂</span><span>الرئيسية</span>
                                </button>
                            </div>

                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-24">
                                    <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
                                    <span className="text-xs font-black text-gray-400 ">جاري التحميل...</span>
                                </div>
                            ) : filteredPosts.length === 0 ? (
                                <div className="text-center py-24 border-2 border-dashed border-slate-200 dark:border-slate-800">
                                    <BookOpen size={48} className="text-gray-200 mx-auto mb-4" />
                                    <p className="text-gray-400 font-bold text-lg mb-2">لا يوجد محتوى لهذا التصنيف بعد</p>
                                    <p className="text-gray-300 text-sm">سيتم إضافة المحتوى قريباً</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredPosts.map((post) => (
                                        <Link
                                            key={post.id}
                                            to={`/books/${post.slug}`}
                                            onClick={() => window.scrollTo(0, 0)}
                                            className="group bg-white dark:bg-slate-900/40 shadow-xl shadow-black/5 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 border border-gray-100 dark:border-slate-800/50 flex flex-col overflow-hidden"
                                        >
                                            <div className="relative aspect-video overflow-hidden">
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 z-10" />
                                                <img src={post.coverImage || 'https://via.placeholder.com/400x200'} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                                <div className="absolute top-3 right-3 z-20">
                                                    <span className="bg-indigo-600 text-white text-xs font-black px-3 py-1 ">{post.subject || post.category}</span>
                                                </div>
                                            </div>
                                            <div className="p-5 flex flex-col flex-grow">
                                                <div className="flex items-center gap-3 text-xs text-gray-400 font-black  mb-3">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar size={14} className="text-indigo-500" />
                                                        <span>{post.date?.split('T')[0]}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <User size={14} className="text-indigo-500" />
                                                        <span>{post.author}</span>
                                                    </div>
                                                </div>
                                                <h2 className="text-base sm:text-lg md:text-xl font-black text-gray-900 dark:text-white mb-3 font-heading group-hover:text-indigo-600 transition-colors leading-tight">{post.title}</h2>
                                                <p className="text-gray-500 dark:text-slate-400 text-sm mb-4 line-clamp-2 leading-relaxed font-medium flex-grow">{post.excerpt}</p>
                                                <div className="mt-auto inline-flex items-center gap-2 text-indigo-600 font-black text-xs ">
                                                    <span>اقرأ المقال</span>
                                                    <ArrowLeft size={16} className="group-hover:-translate-x-2 transition-transform" />
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        /* TIER 4-6: STANDARD DRILL-DOWN VIEW (Classrooms, Terms, Subjects) */
                        <>
                            <div className="text-center max-w-3xl mx-auto mb-8">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50/50 dark:bg-indigo-500/10 backdrop-blur-sm border border-indigo-100 dark:border-indigo-500/20 rounded-full mb-4">
                                    <BookOpen size={14} className="text-indigo-600" />
                                    <span className="text-xs sm:text-sm font-black  text-indigo-600/80">
                                        {view === 'classrooms' ? `${currentCurriculumName} — ${currentLevelName}`
                                            : view === 'terms' ? `الصف ${gradeNames[selectedGrade]} — ${currentLevelName}`
                                                : view === 'subjects' ? `${termLabel} — الصف ${gradeNames[selectedGrade]}`
                                                    : `${currentSubjectName} — الصف ${gradeNames[selectedGrade]}`}
                                    </span>
                                </div>
                                <h1 className="text-4xl md:text-5xl font-heading font-black text-slate-900 dark:text-white mb-3 transition-all duration-500">
                                    {view === 'classrooms' ? (<>مرحلة <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-600">{currentLevelName}</span></>)
                                        : view === 'terms' ? (<>الصف <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-600">{gradeNames[selectedGrade]}</span> — اختر الترم</>)
                                            : view === 'subjects' ? (<>مواد <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-600">{termLabel}</span> — الصف {gradeNames[selectedGrade]}</>)
                                                : (<><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-600">{currentSubjectName}</span> — الصف {gradeNames[selectedGrade]}</>)}
                                </h1>
                                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-xl mx-auto font-medium">
                                    {view === 'classrooms' ? 'اختر الصف الدراسي.'
                                        : view === 'terms' ? 'اختر الترم الدراسي.'
                                            : view === 'subjects' ? 'اختر المادة الدراسية للوصول للمحتوى.'
                                                : `${filteredPosts.length} نتيجة متاحة`}
                                </p>
                            </div>

                            <div className="max-w-4xl mx-auto mb-16">
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
                                    {/* TIER 4: Classrooms */}
                                    {view === 'classrooms' && currentClassrooms.map(cls => (
                                        <button key={cls} onClick={() => { setSelectedGrade(cls); setView('terms'); }} className={cn(btnBase, "from-slate-800 to-slate-900 border border-white/5", "animate-in zoom-in-95 duration-300")}>
                                            <div className="absolute inset-0 bg-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <span className="relative z-10 text-xs sm:text-sm font-black text-white text-center  px-2">الصف {gradeNames[cls] || cls}</span>
                                        </button>
                                    ))}

                                    {/* TIER 5: Terms */}
                                    {view === 'terms' && (<>
                                        <button onClick={() => { setSelectedTerm('1'); setView('subjects'); }} className={cn(btnBase, "from-indigo-600 to-indigo-800", "animate-in zoom-in-95 duration-300")}>
                                            <span className="relative z-10 text-xs sm:text-sm font-black text-white text-center  px-2">ترم أول</span>
                                        </button>
                                        <button onClick={() => { setSelectedTerm('2'); setView('subjects'); }} className={cn(btnBase, "from-purple-600 to-purple-800", "animate-in zoom-in-95 duration-300")}>
                                            <span className="relative z-10 text-xs sm:text-sm font-black text-white text-center  px-2">ترم ثاني</span>
                                        </button>
                                    </>)}

                                    {/* TIER 6: Subjects */}
                                    {view === 'subjects' && currentSubjects.map(subj => (
                                        <button key={subj.id} onClick={() => { setSelectedSubject(subj.id); setView('results'); window.scrollTo(0, 0); }} className={cn(btnBase, subj.color, "animate-in zoom-in-95 duration-300")}>
                                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <span className="relative z-10 text-xs sm:text-sm font-black text-white text-center  px-2">{subj.name}</span>
                                        </button>
                                    ))}

                                    {/* Universal Back Button */}
                                    <button onClick={goBack} className="relative h-16 flex flex-col items-center justify-center gap-1 shadow-lg dark:shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:bg-slate-700 group bg-slate-800 animate-in zoom-in-95 duration-300">
                                        <span className="text-xl text-white group-hover:-translate-x-1 transition-transform">←</span>
                                        <span className="text-xs font-black text-white/60 uppercase">العودة</span>
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </main>


            <PublicFooter />
        </div>
    );
};
