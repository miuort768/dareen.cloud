import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { MobileHeader } from '../../components/public/MobileHeader';
import { PublicFooter } from '../../components/public/PublicFooter';
import { SEO } from '../../components/SEO';
import { blogPosts as staticPosts } from '../../data/blogPosts';
import { Zap, CheckCircle, FileText, AlignLeft, Building2, Anchor, Building, Palmtree, GraduationCap, School, BookOpen, Loader2, ArrowLeft, Calendar, User, ChevronLeft, Library, Sparkles, Bell, BookCheck, Headset, MessageCircle, ShieldCheck, Star, Play, Flame, Sun, Moon, Send } from 'lucide-react';
import { api } from '../../lib/api';
import { cn } from '../../lib/utils';
import { useSettingsStore } from '../../store/settingsStore';

const gradeNames: Record<string, string> = {
  '1': 'الأول', '2': 'الثاني', '3': 'الثالث', '4': 'الرابع', '5': 'الخامس',
  '6': 'السادس', '7': 'السابع', '8': 'الثامن', '9': 'التاسع',
  '10': 'العاشر', '11': 'الحادي عشر', '12': 'الثاني عشر',
};

const types = [
  { id: 'foundation', name: 'التأسيس', gradient: 'from-amber-500 to-orange-600', icon: Zap },
  { id: 'solutions', name: 'حل الكتب', gradient: 'from-emerald-500 to-teal-600', icon: CheckCircle },
  { id: 'notes', name: 'المذكرات', gradient: 'from-violet-500 to-purple-600', icon: FileText },
  { id: 'more', name: 'المزيد', gradient: 'from-rose-500 to-pink-600', icon: AlignLeft },
];

const curriculums = [
  { id: 'kuwait', name: 'منهج كويتي', gradient: 'from-sky-500 to-blue-600', icon: Building2 },
  { id: 'qatar', name: 'منهج قطري', gradient: 'from-red-500 to-rose-600', icon: Anchor },
  { id: 'uae', name: 'منهج إماراتي', gradient: 'from-green-500 to-emerald-600', icon: Building },
  { id: 'saudi', name: 'منهج سعودي', gradient: 'from-emerald-600 to-green-700', icon: Palmtree },
];

const gradesMap: Record<string, { id: string; name: string; sub: string; gradient: string; icon: React.ElementType }[]> = {
  kuwait: [
    { id: 'primary', name: 'ابتدائي', sub: 'الصف ١ - ٥', gradient: 'from-sky-400 to-sky-600', icon: School },
    { id: 'middle', name: 'متوسط', sub: 'الصف ٦ - ٩', gradient: 'from-sky-600 to-blue-700', icon: GraduationCap },
    { id: 'secondary', name: 'ثانوي', sub: 'الصف ١٠ - ١٢', gradient: 'from-blue-700 to-indigo-800', icon: GraduationCap },
  ],
  qatar: [
    { id: 'basic', name: 'أساسي', sub: 'الصف ١ - ٩', gradient: 'from-red-400 to-red-600', icon: School },
    { id: 'secondary', name: 'ثانوي', sub: 'الصف ١٠ - ١٢', gradient: 'from-red-700 to-rose-800', icon: GraduationCap },
  ],
  uae: [
    { id: 'primary', name: 'ابتدائي', sub: 'الصف ١ - ٥', gradient: 'from-green-400 to-emerald-600', icon: School },
    { id: 'preparatory', name: 'إعدادي', sub: 'الصف ٦ - ٩', gradient: 'from-emerald-600 to-green-700', icon: School },
    { id: 'secondary', name: 'ثانوي', sub: 'الصف ١٠ - ١٢', gradient: 'from-green-700 to-teal-800', icon: GraduationCap },
  ],
  saudi: [
    { id: 'primary', name: 'ابتدائي', sub: 'الصف ١ - ٦', gradient: 'from-emerald-400 to-emerald-600', icon: School },
    { id: 'middle', name: 'متوسط', sub: 'الصف ٧ - ٩', gradient: 'from-emerald-600 to-green-700', icon: School },
    { id: 'secondary', name: 'ثانوي', sub: 'الصف ١٠ - ١٢', gradient: 'from-green-700 to-teal-800', icon: GraduationCap },
  ],
};

const subjectsMap: Record<string, { id: string; name: string; gradient: string }[]> = {
  primary: [
    { id: 'islamic', name: 'إسلامية', gradient: 'from-teal-500 to-teal-700' },
    { id: 'arabic', name: 'عربي', gradient: 'from-amber-500 to-amber-700' },
    { id: 'math', name: 'رياضيات', gradient: 'from-blue-500 to-blue-700' },
    { id: 'science', name: 'علوم', gradient: 'from-green-500 to-green-700' },
    { id: 'english', name: 'إنجليزي', gradient: 'from-indigo-500 to-indigo-700' },
    { id: 'social', name: 'اجتماعيات', gradient: 'from-orange-500 to-orange-700' },
  ],
  middle: [
    { id: 'islamic', name: 'إسلامية', gradient: 'from-teal-500 to-teal-700' },
    { id: 'arabic', name: 'عربي', gradient: 'from-amber-500 to-amber-700' },
    { id: 'math', name: 'رياضيات', gradient: 'from-blue-500 to-blue-700' },
    { id: 'physics', name: 'فيزياء', gradient: 'from-yellow-500 to-yellow-700' },
    { id: 'chemistry', name: 'كيمياء', gradient: 'from-purple-500 to-purple-700' },
    { id: 'biology', name: 'أحياء', gradient: 'from-green-600 to-green-800' },
    { id: 'english', name: 'إنجليزي', gradient: 'from-indigo-500 to-indigo-700' },
    { id: 'history', name: 'تاريخ', gradient: 'from-stone-500 to-stone-700' },
    { id: 'geography', name: 'جغرافيا', gradient: 'from-cyan-500 to-cyan-700' },
  ],
  secondary: [
    { id: 'islamic', name: 'إسلامية', gradient: 'from-teal-500 to-teal-700' },
    { id: 'arabic', name: 'عربي', gradient: 'from-amber-500 to-amber-700' },
    { id: 'math', name: 'رياضيات', gradient: 'from-blue-500 to-blue-700' },
    { id: 'physics', name: 'فيزياء', gradient: 'from-yellow-500 to-yellow-700' },
    { id: 'chemistry', name: 'كيمياء', gradient: 'from-purple-500 to-purple-700' },
    { id: 'biology', name: 'أحياء', gradient: 'from-green-600 to-green-800' },
    { id: 'english', name: 'إنجليزي', gradient: 'from-indigo-500 to-indigo-700' },
    { id: 'computer', name: 'حاسب آلي', gradient: 'from-slate-500 to-slate-700' },
    { id: 'stats', name: 'إحصاء', gradient: 'from-rose-500 to-rose-700' },
    { id: 'history', name: 'تاريخ', gradient: 'from-stone-500 to-stone-700' },
    { id: 'geography', name: 'جغرافيا', gradient: 'from-cyan-500 to-cyan-700' },
  ],
  basic: [],
  preparatory: [],
};
subjectsMap.basic = subjectsMap.middle;
subjectsMap.preparatory = subjectsMap.middle;

const subjectNameMap: Record<string, string> = {};
Object.values(subjectsMap).forEach(arr => arr.forEach(s => { if (!subjectNameMap[s.id]) subjectNameMap[s.id] = s.name; }));

type ViewType = 'types' | 'curriculums' | 'grades' | 'classrooms' | 'terms' | 'subjects' | 'results';

interface GridItem {
    id: string;
    name: string;
    gradient?: string;
    sub?: string;
    icon: React.ElementType;
    [key: string]: unknown;
}

const classroomsMap: Record<string, Record<string, string[]>> = {
  kuwait: { primary: ['1', '2', '3', '4', '5'], middle: ['6', '7', '8', '9'], secondary: ['10', '11', '12'] },
  qatar: { basic: ['1', '2', '3', '4', '5', '6', '7', '8', '9'], secondary: ['10', '11', '12'] },
  uae: { primary: ['1', '2', '3', '4', '5'], preparatory: ['6', '7', '8', '9'], secondary: ['10', '11', '12'] },
  saudi: { primary: ['1', '2', '3', '4', '5', '6'], middle: ['7', '8', '9'], secondary: ['10', '11', '12'] },
};

export const Blog = () => {
  const navigate = useNavigate();
  const { adminPhone } = useSettingsStore();
  const whatsappNumber = adminPhone.replace(/\D/g, '');
  const [posts, setPosts] = useState<typeof staticPosts>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const view = (searchParams.get('view') as ViewType) || 'types';
  const selectedType = searchParams.get('type') || '';
  const selectedCurriculum = searchParams.get('curriculum') || '';
  const selectedLevel = searchParams.get('level') || '';
  const selectedGrade = searchParams.get('grade') || '';
  const selectedTerm = searchParams.get('term') || '';
  const selectedSubject = searchParams.get('subject') || '';

  const setView = useCallback((v: ViewType) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('view', v);
      if (v === 'types') { ['type','curriculum','level','grade','term','subject'].forEach(k => next.delete(k)); }
      else if (v === 'curriculums') { ['level','grade','term','subject'].forEach(k => next.delete(k)); }
      else if (v === 'grades') { ['grade','term','subject'].forEach(k => next.delete(k)); }
      else if (v === 'classrooms') { ['term','subject'].forEach(k => next.delete(k)); }
      else if (v === 'terms') { next.delete('subject'); }
      return next;
    });
  }, [setSearchParams]);
  const setSelectedType = useCallback((id: string) => { setSearchParams(prev => { const n = new URLSearchParams(prev); n.set('type', id); return n; }); }, [setSearchParams]);
  const setSelectedCurriculum = useCallback((id: string) => { setSearchParams(prev => { const n = new URLSearchParams(prev); n.set('curriculum', id); return n; }); }, [setSearchParams]);
  const setSelectedLevel = useCallback((id: string) => { setSearchParams(prev => { const n = new URLSearchParams(prev); n.set('level', id); return n; }); }, [setSearchParams]);
  const setSelectedGrade = useCallback((id: string) => { setSearchParams(prev => { const n = new URLSearchParams(prev); n.set('grade', id); return n; }); }, [setSearchParams]);
  const setSelectedTerm = useCallback((id: string) => { setSearchParams(prev => { const n = new URLSearchParams(prev); n.set('term', id); return n; }); }, [setSearchParams]);
  const setSelectedSubject = useCallback((id: string) => { setSearchParams(prev => { const n = new URLSearchParams(prev); n.set('subject', id); return n; }); }, [setSearchParams]);

  const currentTypeName = types.find(t => t.id === selectedType)?.name || '';
  const currentCurriculumName = curriculums.find(c => c.id === selectedCurriculum)?.name || '';
  const currentLevelName = gradesMap[selectedCurriculum]?.find(g => g.id === selectedLevel)?.name || '';
  const currentSubjectName = (subjectsMap[selectedLevel] || subjectsMap.middle).find(s => s.id === selectedSubject)?.name || '';
  const currentGrades = gradesMap[selectedCurriculum] || [];
  const currentClassrooms = classroomsMap[selectedCurriculum]?.[selectedLevel] || [];
  const currentSubjects = subjectsMap[selectedLevel] || subjectsMap.middle;
  const termLabel = selectedTerm === '1' ? 'ترم أول' : selectedTerm === '2' ? 'ترم ثاني' : 'الكل';

  const filteredPosts = view === 'results' ? posts.filter(p => {
    if (selectedType && p.contentType !== selectedType) return false;
    if (selectedCurriculum && p.curriculum !== selectedCurriculum) return false;
    if (selectedLevel && p.level !== selectedLevel) return false;
    if (selectedGrade && p.grade !== selectedGrade) return false;
    if (selectedTerm && p.term && p.term !== selectedTerm) return false;
    if (selectedSubject && p.subject !== selectedSubject) return false;
    return true;
  }) : posts;

  const directTypes = ['foundation', 'more'];
  const isDirectType = directTypes.includes(selectedType);

  const goBack = () => {
    if (view === 'results') {
      if (isDirectType) setView('types');
      else setView('subjects');
    } else if (view === 'subjects') setView('terms');
    else if (view === 'terms') setView('classrooms');
    else if (view === 'classrooms') setView('grades');
    else if (view === 'grades') setView('curriculums');
    else if (view === 'curriculums') setView('types');
    else navigate('/');
  };

  const isHeroView = view === 'types' || view === 'curriculums' || view === 'grades';
  const gridItems = view === 'types' ? types : view === 'curriculums' ? curriculums : currentGrades;

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await api.get<typeof staticPosts>('/blog');
        setPosts(data.length > 0 ? data : staticPosts);
      } catch {
        setPosts(staticPosts);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  // Independent dark mode for library page
  const [libraryTheme, setLibraryTheme] = useState(() => {
    try { return localStorage.getItem('library-theme') || 'light'; }
    catch { return 'light'; }
  });
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(libraryTheme);
    try { localStorage.setItem('library-theme', libraryTheme); } catch {}
  }, [libraryTheme]);

  const { libraryWhatsapp, libraryTelegram } = useSettingsStore();

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-slate-950 font-sans relative flex flex-col">
      <SEO title="المكتبة التعليمية | دارين السابعة - نصائح وموارد تعليمية"
        description="مكتبة دارين السابعة التعليمية: نصائح للمذاكرة، شرح المناهج الخليجية، تحضير اختبارات القدرات، وأساليب التعلم عن بعد للطلاب في الكويت والسعودية والخليج."
        keywords="مكتبة دارين, مقالات تعليمية, نصائح المذاكرة, اختبار القدرات, المنهج الكويتي, المنهج السعودي, تعليم عن بعد"
        url="https://dareen.cloud/books"
        image="/dareen_books_banner.png"
        breadcrumbs={[{ name: 'الرئيسية', item: '/' }, { name: 'المكتبة', item: '/books' }]} />
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'المكتبة التعليمية - دارين السابعة',
          description: 'مكتبة دارين السابعة التعليمية: كتب، مذكرات، ملخصات، واختبارات للمناهج الخليجية',
          url: 'https://dareen.cloud/books',
          mainEntity: { '@type': 'ItemList', itemListElement: [] },
          publisher: { '@type': 'EducationalOrganization', name: 'دارين السابعة', url: 'https://dareen.cloud' }
        })}
      </script>
      <MobileHeader />

      {/* ─── Mobile Layout ─── */}
      <main className="md:hidden pb-0 px-3 relative flex-1 bg-[#F8F8FC] dark:bg-slate-950">
        {isHeroView ? (
          <div className="pb-6">
            {/* Top header bar */}
            <div className="flex items-center justify-between mb-5 mt-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center">
                  <div className="w-4 h-0.5 bg-slate-600 dark:bg-slate-300 rounded-full" />
                </div>
                <div className="relative">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
                      <BookOpen size={10} className="text-white" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">dareen - 7</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a href={`https://wa.me/${libraryWhatsapp.replace(/\D/g, '')}?text=${encodeURIComponent('السلام عليكم، أرغب في الاستفسار عن المكتبة التعليمية')}`}
                  target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center hover:bg-green-50 dark:hover:bg-green-900/30 transition-all">
                  <MessageCircle size={16} className="text-green-600 dark:text-green-400" />
                </a>
                <a href={libraryTelegram.startsWith('http') ? libraryTelegram : `https://t.me/${libraryTelegram}`}
                  target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center hover:bg-sky-50 dark:hover:bg-sky-900/30 transition-all">
                  <Send size={16} className="text-sky-600 dark:text-sky-400" />
                </a>
                <button onClick={() => setLibraryTheme(t => t === 'dark' ? 'light' : 'dark')}
                  className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                  {libraryTheme === 'dark' ? <Sun size={16} className="text-amber-500" /> : <Moon size={16} className="text-slate-600 dark:text-slate-400" />}
                </button>
              </div>
            </div>

            {/* Hero Banner */}
            <div className="relative bg-gradient-to-br from-violet-100 via-violet-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-950 rounded-2xl overflow-hidden mb-6 shadow-sm border border-violet-100/50 dark:border-slate-800">
              <div className="flex items-center gap-4 p-5">
                <div className="flex-1">
                  <p className="text-[18px] font-black text-indigo-950 dark:text-indigo-100 leading-tight mb-1">
                    برعادية دارين<span className="text-blue-600 dark:text-blue-400"> السابعة</span>
                  </p>
                  <p className="text-[12px] font-bold text-violet-600 dark:text-violet-400 mb-2">أفضل الكتب والملخصات و نماذج الامتحانات</p>
                  <p className="text-[9px] text-slate-500 dark:text-slate-400 leading-relaxed mb-3">أفضل المعلمين وأحدث التقنيات لتفوق أبنائكم.</p>
                  <div className="flex flex-col gap-1.5">
                    <Link to="/courses" className="bg-indigo-600 text-white text-[10px] font-bold px-4 py-2 rounded-full shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all flex items-center justify-center gap-1 w-full">
                      <Play className="w-3 h-3 fill-white" />
                      تصفح الدورات
                    </Link>
                    <a
                      href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('السلام عليكم، أرغب في حجز حصة تجريبية مجانية')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-[10px] font-bold px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all w-full text-center block"
                    >
                      طلب حصة مجانية
                    </a>
                  </div>
                </div>
                <div className="relative shrink-0">
                  <div className="absolute inset-0 bg-violet-200/50 dark:bg-violet-800/30 rounded-full blur-xl" />
                  <div className="relative w-[90px]">
                    <img src="/hero-child.png" alt="طفل يدرس على منصة دارين" width="90" height="90" className="w-full h-auto object-contain drop-shadow-lg" />
                  </div>
                </div>
              </div>
            </div>

            {/* Selection Grid */}
            <div className="bg-gradient-to-br from-violet-50/80 via-white to-indigo-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 rounded-3xl p-5 mb-5 shadow-sm border border-violet-100/50 dark:border-slate-800">
              <h2 className="text-xl font-black text-indigo-950 dark:text-indigo-100 leading-tight">
                {view === 'types' ? (
                  <>اختر <span className="text-transparent bg-clip-text bg-gradient-to-l from-[#6C4BFF] to-[#4A2DDB]">الخدمة</span></>
                ) : view === 'curriculums' ? (
                  <>اختر <span className="text-transparent bg-clip-text bg-gradient-to-l from-[#6C4BFF] to-[#4A2DDB]">المنهج</span></>
                ) : (
                  <>اختر <span className="text-transparent bg-clip-text bg-gradient-to-l from-[#6C4BFF] to-[#4A2DDB]">المرحلة</span></>
                )}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1.5 leading-relaxed">
                {view === 'types'
                  ? 'اختر ما تريد من كتب او مذكرات مجانا'
                  : view === 'curriculums'
                  ? `تصفح وتحميل ${currentTypeName} لأفضل المناهج التعليمية في الخليج`
                  : `جميع ملفات ${currentCurriculumName} مرتبة ومصنفة لتسهيل الوصول`}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {gridItems.map((item: GridItem, i: number) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setSearchParams(prev => {
                      const next = new URLSearchParams(prev);
                      if (view === 'types') {
                        if (directTypes.includes(item.id)) {
                          next.set('type', item.id); next.set('view', 'results'); ['curriculum','level','grade','term','subject'].forEach(k => next.delete(k));
                        } else {
                          next.set('type', item.id); next.set('view', 'curriculums'); ['level','grade','term','subject'].forEach(k => next.delete(k));
                        }
                      } else if (view === 'curriculums') { next.set('curriculum', item.id); next.set('view', 'grades'); ['grade','term','subject'].forEach(k => next.delete(k)); }
                      else { next.set('level', item.id); next.set('view', 'classrooms'); ['term','subject'].forEach(k => next.delete(k)); }
                      return next;
                    });
                  }}
                  className={cn(
                    "relative flex flex-col items-center justify-center gap-2 p-5 rounded-2xl text-white overflow-hidden shadow-lg active:scale-[0.97] transition-all",
                    "bg-gradient-to-br", item.gradient
                  )}
                >
                  <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
                    <item.icon size={20} />
                  </div>
                  <span className="text-sm font-black text-center leading-tight">{item.name}</span>
                  {item.sub && <span className="text-[11px] text-white/70 font-bold">{item.sub}</span>}
                </button>
              ))}

              <button onClick={goBack}
                className="flex flex-col items-center justify-center gap-2 p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 active:scale-[0.97] transition-all shadow-sm">
                <ArrowLeft size={20} />
                <span className="text-sm font-black">العودة</span>
              </button>

              <Link to="/courses"
                className="flex flex-col items-center justify-center gap-2 p-5 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-700 text-white active:scale-[0.97] transition-all shadow-lg">
                <Sparkles size={20} />
                <span className="text-sm font-black">الدورات</span>
              </Link>
            </div>
          </div>
        ) : view === 'results' ? (
          <div className="pb-6">
            <div className="bg-gradient-to-br from-violet-50/80 via-white to-indigo-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 rounded-3xl p-5 mb-5 shadow-sm border border-violet-100/50 dark:border-slate-800 mt-1">
              <div className="flex items-center gap-1.5 mb-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 flex-wrap">
                {[
                  { label: 'الرئيسية', onClick: () => setView('types') },
                  ...(currentTypeName ? [{ label: currentTypeName, onClick: () => isDirectType ? setView('types') : setView('curriculums') }] : []),
                  ...(currentCurriculumName ? [{ label: currentCurriculumName, onClick: () => setView('grades') }] : []),
                  ...(currentLevelName ? [{ label: currentLevelName, onClick: () => setView('classrooms') }] : []),
                  ...(selectedGrade ? [{ label: `الصف ${selectedGrade}`, onClick: () => setView('terms') }] : []),
                ].map((crumb, i, arr) => (
                  <span key={i} className="flex items-center gap-1">
                    {i > 0 && <ChevronLeft size={10} className="text-slate-300 dark:text-slate-600" />}
                    <button onClick={crumb.onClick}
                      className={i === arr.length - 1 && !selectedSubject ? 'text-indigo-600 dark:text-indigo-400 font-black' : 'text-slate-500 dark:text-slate-400 hover:text-indigo-500 transition-colors'}
                    >{crumb.label}</button>
                  </span>
                ))}
                {selectedSubject && <><ChevronLeft size={10} className="text-slate-300 dark:text-slate-600" /><span className="text-indigo-600 dark:text-indigo-400 font-black">{currentSubjectName}</span></>}
              </div>

              <div className="flex gap-2">
                {!isDirectType && (
                <button onClick={goBack} className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-800 dark:bg-slate-700 text-white text-[11px] font-bold rounded-2xl transition-all shadow-sm">
                  <ArrowLeft size={14} /><span>تغيير المادة</span>
                </button>
                )}
                <button onClick={() => setView('types')} className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-950 text-white text-[11px] font-bold rounded-2xl transition-all shadow-sm">
                  <Library size={14} /><span>الرئيسية</span>
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-indigo-600 dark:text-indigo-400 animate-spin mb-4" />
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500">جاري التحميل...</span>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-3xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4 border border-slate-200 dark:border-slate-700">
                  <BookOpen size={24} className="text-slate-300 dark:text-slate-600" />
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-black text-base mb-1">لا يوجد محتوى بعد</p>
                <p className="text-slate-400 dark:text-slate-500 text-xs font-medium">سيتم إضافة المحتوى قريباً لهذا التصنيف</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredPosts.map((post, i) => {
                  const isMore = selectedType === 'more';
                  return (
                  <Link key={post.id} to={`/books/${post.slug}`} onClick={() => window.scrollTo(0, 0)}
                    className={`group block bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm active:scale-[0.98] transition-all h-full flex flex-col ${isMore ? '' : 'rounded-2xl'}`}>
                    <div className={`relative aspect-video bg-slate-50 dark:bg-slate-800/30 ${isMore ? '' : 'overflow-hidden rounded-t-2xl'}`}>
                      <img src={post.coverImage || 'https://via.placeholder.com/400x200'} alt={post.title} width="400" height="225" loading="lazy" className="w-full h-full object-cover" />
                      {!isMore && (
                        <div className="absolute top-3 right-3 z-10">
                          <span className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm text-indigo-600 dark:text-indigo-400 text-[10px] font-black px-2.5 py-1 rounded-lg shadow-sm">{subjectNameMap[post.subject] || post.category}</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <div className="flex items-center gap-3 text-[11px] font-bold text-slate-400 mb-2">
                        <span className="flex items-center gap-1">{post.date?.split('T')[0]}</span>
                        {isMore && (
                          <span className="flex items-center gap-0.5"><Flame size={12} className="text-orange-500" />{post.views ?? 0}</span>
                        )}
                      </div>
                      <h2 className={`text-sm font-black leading-snug line-clamp-2 ${isMore ? 'text-blue-600 dark:text-blue-400' : 'text-slate-900 dark:text-white'}`}>{post.title}</h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 flex-1 mt-2">{post.excerpt}</p>
                      <div className="mt-4 inline-flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-black text-[11px] group/link">
                        <span>اقرأ المقال</span>
                        <ArrowLeft size={14} className="group-hover/link:-translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="pb-6">
            <div className="bg-gradient-to-br from-violet-100 via-violet-50 to-white rounded-[32px] p-5 mb-6 shadow-sm border border-violet-100/50 mt-2 text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/80 rounded-full shadow-sm mb-3">
                <BookOpen size={10} className="text-violet-600" />
                <span className="text-[9px] font-black text-violet-600">
                  {view === 'classrooms' ? `${currentCurriculumName} — ${currentLevelName}`
                    : view === 'terms' ? `الصف ${gradeNames[selectedGrade]}`
                      : `المواد — ${termLabel}`}
                </span>
              </div>
              <h2 className="text-[17px] font-black text-indigo-950">
                {view === 'classrooms' ? (<>اختر <span className="text-transparent bg-clip-text bg-gradient-to-l from-[#6C4BFF] to-[#4A2DDB]">الصف الدراسي</span></>)
                  : view === 'terms' ? (<>اختر <span className="text-transparent bg-clip-text bg-gradient-to-l from-[#6C4BFF] to-[#4A2DDB]">الترم</span></>)
                    : (<>اختر <span className="text-transparent bg-clip-text bg-gradient-to-l from-[#6C4BFF] to-[#4A2DDB]">المادة</span></>)}
              </h2>
              <p className="text-[10px] text-slate-500 font-medium mt-1">
                {view === 'classrooms' ? 'اختر الصف للوصول للمحتوى'
                  : view === 'terms' ? 'اختر الترم الدراسي'
                    : `${filteredPosts.length} نتيجة متاحة`}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {view === 'classrooms' && currentClassrooms.map((cls, i) => (
                <button key={cls} onClick={() => { setSearchParams(prev => { const n = new URLSearchParams(prev); n.set('grade', cls); n.set('view', 'terms'); n.delete('subject'); return n; }); }}
                  className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-sm active:scale-[0.97] transition-all">
                  <GraduationCap size={18} />
                  <span className="text-[10px] font-black text-center">الصف {gradeNames[cls] || cls}</span>
                </button>
              ))}

              {view === 'terms' && (
                <>
                  <button onClick={() => { setSearchParams(prev => { const n = new URLSearchParams(prev); n.set('term', '1'); n.set('view', 'subjects'); return n; }); }}
                    className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-sm active:scale-[0.97] transition-all">
                    <BookOpen size={18} />
                    <span className="text-[10px] font-black">ترم أول</span>
                  </button>
                  <button onClick={() => { setSearchParams(prev => { const n = new URLSearchParams(prev); n.set('term', '2'); n.set('view', 'subjects'); return n; }); }}
                    className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 text-white shadow-sm active:scale-[0.97] transition-all">
                    <BookOpen size={18} />
                    <span className="text-[10px] font-black">ترم ثاني</span>
                  </button>
                </>
              )}

              {view === 'subjects' && currentSubjects.map((subj, i) => (
                <button key={subj.id} onClick={() => { setSearchParams(prev => { const n = new URLSearchParams(prev); n.set('subject', subj.id); n.set('view', 'results'); return n; }); window.scrollTo(0, 0); }}
                  className={cn("flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-gradient-to-br text-white shadow-sm active:scale-[0.97] transition-all", subj.gradient)}>
                  <span className="text-[10px] font-black text-center">{subj.name}</span>
                </button>
              ))}

              <button onClick={goBack}
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-white border border-slate-200 text-slate-500 shadow-sm active:scale-[0.97] transition-all">
                <ArrowLeft size={16} />
                <span className="text-[10px] font-black">العودة</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ─── Desktop Layout ─── */}
      <main className="hidden md:block flex-grow pt-24 md:pt-32 pb-6 relative overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-15%] right-[-10%] w-[60%] h-[60%] bg-gradient-to-br from-indigo-500/8 to-purple-500/8 rounded-full blur-[140px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-gradient-to-tr from-sky-500/5 to-indigo-500/5 rounded-full blur-[120px]" />
          <div className="absolute top-[40%] left-[50%] translate-x-[-50%] w-[80%] h-[1px] bg-gradient-to-r from-transparent via-indigo-200/20 to-transparent" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 relative z-10 max-w-6xl">
          {isHeroView ? (
            <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12 max-w-5xl mx-auto">
              <div className="w-full lg:w-[55%] text-center lg:text-right">
                <div className="inline-flex animate-in fade-in slide-in-from-top-2 duration-500 items-center gap-2 px-4 py-1.5 bg-indigo-50/60 dark:bg-indigo-500/10 backdrop-blur-sm border border-indigo-100 dark:border-indigo-500/20 rounded-full mb-5">
                  <BookOpen size={13} className="text-indigo-600 dark:text-indigo-400" />
                  <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-300">
                    {view === 'types' ? 'المعرفة بين يديك' : view === 'curriculums' ? `تحميل ${currentTypeName}` : currentCurriculumName}
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black text-slate-900 dark:text-slate-50 mb-4 leading-tight animate-in fade-in slide-in-from-bottom-4 duration-700">
                  {view === 'types' ? (
                    <>مكتبة <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-600 dark:from-indigo-400 dark:to-purple-400">دارين</span> التعليمية</>
                  ) : view === 'curriculums' ? (
                    <>اختر <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-600">المنهج</span></>
                  ) : (
                    <>اختر <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-600">المرحلة</span></>
                  )}
                </h1>

                <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0 font-medium animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
                  {view === 'types'
                    ? 'دليلك الشامل للتفوق الدراسي — أحدث المناهج، ملخصات، وحلول الكتب لجميع المراحل في مناهج الكويت و قطر والامارات والسعودية'
                    : view === 'curriculums'
                      ? `تصفح وتحميل ${currentTypeName} لأفضل المناهج التعليمية في الخليج`
                      : `جميع ملفات ${currentCurriculumName} مرتبة ومصنفة لتسهيل الوصول`}
                </p>

                <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto lg:mx-0">
                  {gridItems.map((item: GridItem, i: number) => (
                    <div key={item.id} className="animate-in zoom-in-95 duration-500" style={{ animationDelay: `${i * 80}ms` }}>
                      <button
                        onClick={() => {
                          setSearchParams(prev => {
                            const next = new URLSearchParams(prev);
                            if (view === 'types') {
                              if (directTypes.includes(item.id)) {
                                next.set('type', item.id); next.set('view', 'results'); ['curriculum','level','grade','term','subject'].forEach(k => next.delete(k));
                              } else {
                                next.set('type', item.id); next.set('view', 'curriculums'); ['level','grade','term','subject'].forEach(k => next.delete(k));
                              }
                            } else if (view === 'curriculums') { next.set('curriculum', item.id); next.set('view', 'grades'); ['grade','term','subject'].forEach(k => next.delete(k)); }
                            else { next.set('level', item.id); next.set('view', 'classrooms'); ['term','subject'].forEach(k => next.delete(k)); }
                            return next;
                          });
                        }}
                        className={cn(
                          "relative w-full py-4 px-3 flex flex-col items-center justify-center gap-1.5 rounded-2xl text-white overflow-hidden transition-all duration-300 active:scale-[0.97] shadow-lg",
                          "bg-gradient-to-br", item.gradient
                        )}
                      >
                        <div className="absolute inset-0 bg-white/0 hover:bg-white/10 transition-colors duration-300" />
                        <item.icon size={20} className="relative z-10" />
                        <span className="relative z-10 text-xs sm:text-sm font-black text-center leading-tight">{item.name}</span>
                        {item.sub && <span className="relative z-10 text-[9px] text-white/70 font-bold">{item.sub}</span>}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="hidden lg:flex w-full lg:w-[45%] justify-center animate-in fade-in slide-in-from-left-8 duration-700 delay-300">
                <div className="relative w-full max-w-[380px] aspect-square flex items-center justify-center">
                  <div className="absolute inset-4 border border-dashed border-indigo-500/15 rounded-full" />
                  <div className="absolute inset-12 border border-dashed border-purple-500/8 rounded-full" />
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/8 to-purple-600/8 rounded-full blur-3xl" />
                  <picture>
                    <source srcSet="/dareen_books_portal_v3.webp" type="image/webp" />
                    <source srcSet="/dareen_books_portal_v3.avif" type="image/avif" />
                    <img src="/dareen_books_portal_v3.png" alt="بوابة دارين التعليمية" width="380" height="380" loading="lazy"
                      className="relative z-10 w-full h-auto object-contain drop-shadow-[0_15px_35px_rgba(79,70,229,0.15)]" />
                  </picture>
                </div>
              </div>
            </div>
          ) : view === 'results' ? (
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center gap-2 mb-6 text-xs sm:text-sm font-bold text-slate-400 flex-wrap">
                {[
                  { label: 'الرئيسية', onClick: () => setView('types') },
                  ...(currentTypeName ? [{ label: currentTypeName, onClick: () => isDirectType ? setView('types') : setView('curriculums') }] : []),
                  ...(currentCurriculumName ? [{ label: currentCurriculumName, onClick: () => setView('grades') }] : []),
                  ...(currentLevelName ? [{ label: currentLevelName, onClick: () => setView('classrooms') }] : []),
                  ...(selectedGrade ? [{ label: `الصف ${selectedGrade}`, onClick: () => setView('terms') }] : []),
                ].map((crumb, i, arr) => (
                  <span key={i} className="flex items-center gap-2">
                    {i > 0 && <ChevronLeft size={12} className="text-slate-300" />}
                    <button onClick={crumb.onClick}
                      className={i === arr.length - 1 && !selectedSubject ? 'text-indigo-600' : 'hover:text-indigo-500 transition-colors'}
                    >{crumb.label}</button>
                  </span>
                ))}
                {selectedSubject && <><ChevronLeft size={12} className="text-slate-300" /><span className="text-indigo-600 font-black">{currentSubjectName}</span></>}
              </div>

              <div className="flex gap-2 mb-8">
                {!isDirectType && (
                <button onClick={goBack} className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-black rounded-xl transition-all">
                  <ArrowLeft size={14} /><span>تغيير المادة</span>
                </button>
                )}
                <button onClick={() => setView('types')} className="w-full md:w-auto inline-flex items-center justify-center md:justify-start gap-2 px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-white text-xs font-black rounded-xl transition-all">
                  <Library size={14} /><span>الرئيسية</span>
                </button>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-24">
                  <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
                  <span className="text-xs font-black text-slate-400">جاري التحميل...</span>
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="text-center py-24 animate-in fade-in duration-500">
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center mx-auto mb-4 border border-slate-200 dark:border-slate-700/50">
                    <BookOpen size={28} className="text-slate-300 dark:text-slate-600" />
                  </div>
                  <p className="text-slate-500 font-black text-lg mb-1">لا يوجد محتوى بعد</p>
                  <p className="text-slate-400 text-sm font-medium">سيتم إضافة المحتوى قريباً لهذا التصنيف</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredPosts.map((post, i) => {
                    const isMore = selectedType === 'more';
                    return (
                    <div key={post.id} className="animate-in zoom-in-95 duration-500" style={{ animationDelay: `${i * 60}ms` }}>
                      <Link to={`/books/${post.slug}`} onClick={() => window.scrollTo(0, 0)}
                        className={`group block bg-white dark:bg-slate-900/50 dark:backdrop-blur-xl border border-slate-100 dark:border-slate-800/50 ${isMore ? '' : 'rounded-2xl overflow-hidden'} shadow-sm hover:shadow-xl ${isMore ? '' : 'hover:shadow-indigo-500/5'} transition-all duration-500 h-full flex flex-col`}>
                        <div className={`relative aspect-video ${isMore ? '' : 'overflow-hidden'} bg-slate-50 dark:bg-slate-800/30`}>
                          <img src={post.coverImage || 'https://via.placeholder.com/400x200'} alt={post.title} width="400" height="225" loading="lazy" decoding="async" className={`w-full h-full object-cover ${isMore ? '' : 'group-hover:scale-105 transition-transform duration-700'}`} />
                          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent" />
                          {!isMore && (
                            <div className="absolute top-3 right-3 z-10">
                              <span className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm text-indigo-600 dark:text-indigo-400 text-[10px] font-black px-2.5 py-1 rounded-lg shadow-sm">{subjectNameMap[post.subject] || post.category}</span>
                            </div>
                          )}
                        </div>
                        <div className="p-4 flex flex-col flex-1">
                          <div className="flex items-center gap-3 text-[11px] font-bold text-slate-400 mb-2">
                            <span className="flex items-center gap-1"><Calendar size={12} /><span>{post.date?.split('T')[0]}</span></span>
                            {isMore ? (
                              <span className="flex items-center gap-0.5"><Flame size={12} className="text-orange-500" /><span>{post.views ?? 0}</span></span>
                            ) : (
                              <span className="flex items-center gap-1"><User size={12} /><span>{post.author}</span></span>
                            )}
                          </div>
                          <h2 className={`text-sm sm:text-base font-heading font-black leading-snug mb-2 ${isMore ? 'text-blue-600 dark:text-blue-400' : 'text-slate-900 dark:text-slate-50 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors'}`}>{post.title}</h2>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 flex-1">{post.excerpt}</p>
                          <div className="mt-4 inline-flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-black text-[11px] group/link">
                            <span>اقرأ المقال</span>
                            <ArrowLeft size={14} className="group-hover/link:-translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </Link>
                    </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="text-center max-w-3xl mx-auto mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50/60 dark:bg-indigo-500/10 backdrop-blur-sm border border-indigo-100 dark:border-indigo-500/20 rounded-2xl mb-4">
                  <BookOpen size={14} className="text-indigo-600 dark:text-indigo-400" />
                  <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-300">
                    {view === 'classrooms' ? `${currentCurriculumName} — ${currentLevelName}`
                      : view === 'terms' ? `الصف ${gradeNames[selectedGrade]}`
                        : `المواد — ${termLabel}`}
                  </span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-slate-50 mb-3">
                  {view === 'classrooms' ? (<>اختر <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-600">الصف الدراسي</span></>)
                    : view === 'terms' ? (<>اختر <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-600">الترم</span></>)
                      : (<>اختر <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-600">المادة</span></>)}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                  {view === 'classrooms' ? 'اختر الصف للوصول للمحتوى'
                    : view === 'terms' ? 'اختر الترم الدراسي'
                      : `${filteredPosts.length} نتيجة متاحة`}
                </p>
              </div>

              <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
                  {view === 'classrooms' && currentClassrooms.map((cls, i) => (
                    <div key={cls} className="animate-in zoom-in-95 duration-500" style={{ animationDelay: `${i * 60}ms` }}>
                      <button onClick={() => { setSearchParams(prev => { const n = new URLSearchParams(prev); n.set('grade', cls); n.set('view', 'terms'); n.delete('subject'); return n; }); }}
                        className="w-full py-6 px-3 flex flex-col items-center justify-center gap-3 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 text-white border border-white/5 shadow-lg active:scale-[0.97] transition-all">
                        <GraduationCap size={24} />
                        <span className="text-sm font-black text-center">الصف {gradeNames[cls] || cls}</span>
                      </button>
                    </div>
                  ))}

                  {view === 'terms' && (
                    <>
                      <div className="animate-in zoom-in-95 duration-500">
                  <button onClick={() => { setSearchParams(prev => { const n = new URLSearchParams(prev); n.set('term', '1'); n.set('view', 'subjects'); return n; }); }}
                          className="w-full py-6 px-3 flex flex-col items-center justify-center gap-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-lg active:scale-[0.97] transition-all">
                          <BookOpen size={24} />
                          <span className="text-sm font-black">ترم أول</span>
                        </button>
                      </div>
                      <div className="animate-in zoom-in-95 duration-500" style={{ animationDelay: '60ms' }}>
                  <button onClick={() => { setSearchParams(prev => { const n = new URLSearchParams(prev); n.set('term', '2'); n.set('view', 'subjects'); return n; }); }}
                          className="w-full py-6 px-3 flex flex-col items-center justify-center gap-3 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 text-white shadow-lg active:scale-[0.97] transition-all">
                          <BookOpen size={24} />
                          <span className="text-sm font-black">ترم ثاني</span>
                        </button>
                      </div>
                    </>
                  )}

                  {view === 'subjects' && currentSubjects.map((subj, i) => (
                    <div key={subj.id} className="animate-in zoom-in-95 duration-500" style={{ animationDelay: `${i * 60}ms` }}>
                      <button onClick={() => { setSearchParams(prev => { const n = new URLSearchParams(prev); n.set('subject', subj.id); n.set('view', 'results'); return n; }); window.scrollTo(0, 0); }}
                        className={cn("w-full py-6 px-3 flex flex-col items-center justify-center gap-3 rounded-2xl bg-gradient-to-br text-white shadow-lg active:scale-[0.97] transition-all", subj.gradient)}>
                        <span className="text-sm font-black text-center">{subj.name}</span>
                      </button>
                    </div>
                  ))}

                  <div className="animate-in zoom-in-95 duration-500">
                    <button onClick={goBack}
                      className="w-full py-6 px-3 flex flex-col items-center justify-center gap-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 shadow-sm active:scale-[0.97] transition-all">
                      <ArrowLeft size={22} />
                      <span className="text-sm font-black">العودة</span>
                    </button>
                  </div>
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
