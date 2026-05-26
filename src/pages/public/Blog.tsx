import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MobileHeader } from '../../components/public/MobileHeader';
import { PublicFooter } from '../../components/public/PublicFooter';
import { SEO } from '../../components/SEO';
import { blogPosts as staticPosts } from '../../data/blogPosts';
import { Zap, CheckCircle, FileText, AlignLeft, Building2, Anchor, Building, Palmtree, GraduationCap, School, BookOpen, Loader2, ArrowLeft, Calendar, User, ChevronLeft, Library, Sparkles, Bell, BookCheck, Headset, MessageCircle, Send, Moon, ShieldCheck, Star } from 'lucide-react';
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
  { id: 'summaries', name: 'ملخصات', gradient: 'from-rose-500 to-pink-600', icon: AlignLeft },
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
  const { adminPhone } = useSettingsStore();
  const whatsappNumber = adminPhone.replace(/\D/g, '');
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

  return (
    <div className="min-h-full bg-[#fafafa] dark:bg-slate-950 font-sans relative flex flex-col">
      <SEO title="المكتبة التعليمية | دارين السابعة - نصائح وموارد تعليمية"
        description="مكتبة دارين السابعة التعليمية: نصائح للمذاكرة، شرح المناهج الخليجية، تحضير اختبارات القدرات، وأساليب التعلم عن بعد للطلاب في الكويت والسعودية والخليج."
        keywords="مكتبة دارين, مقالات تعليمية, نصائح المذاكرة, اختبار القدرات, المنهج الكويتي, المنهج السعودي, تعليم عن بعد"
        url="https://dareen.cloud/books"
        image="/dareen_books_banner.png"
        breadcrumbs={[{ name: 'الرئيسية', item: '/' }, { name: 'المكتبة', item: '/books' }]} />
      <MobileHeader />

      {/* ─── Mobile Layout ─── */}
      <main className="md:hidden pb-4 px-2 max-w-lg mx-auto relative min-h-screen bg-[#F8F8FC] dark:bg-slate-950">
        {isHeroView ? (
          <div>
            {/* Top header bar */}
            <div className="flex items-center justify-between mb-4 mt-1">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center">
                  <div className="w-4 h-0.5 bg-slate-600 rounded-full" />
                </div>
                <div className="relative">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full shadow-sm border border-slate-100">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
                      <BookOpen size={8} className="text-white" />
                    </div>
                    <span className="text-[9px] font-black text-slate-700">dareen - 7</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center">
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-400 flex items-center justify-center">
                    <div className="w-1 h-1 bg-slate-400 rounded-full" />
                  </div>
                </div>
                <div className="w-9 h-9 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center relative">
                  <div className="w-3 h-3 rounded-full bg-amber-400 absolute -top-0.5 -right-0.5 border-2 border-white" />
                  <Bell size={14} className="text-slate-600" />
                </div>
              </div>
            </div>

            {/* Hero Banner */}
            <div className="relative rounded-[32px] overflow-hidden mb-6 bg-gradient-to-br from-indigo-900 via-violet-800 to-purple-900 shadow-lg border border-violet-500/20">
              {/* Decorative elements */}
              <div className="absolute top-4 right-4 w-3 h-3 rounded-full bg-yellow-300/60 shadow-lg shadow-yellow-300/30" />
              <div className="absolute top-8 left-8 w-2 h-2 rounded-full bg-sky-300/60" />
              <div className="absolute bottom-12 right-10 w-2.5 h-2.5 rounded-full bg-pink-300/60" />
              <div className="absolute top-1/3 left-3 w-1.5 h-1.5 rounded-full bg-white/40" />
              <div className="absolute top-1/4 right-12 w-1.5 h-1.5 rounded-full bg-white/30" />
              <div className="absolute -top-6 -left-6 w-20 h-20 bg-violet-500/20 rounded-full blur-xl" />
              <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-indigo-500/20 rounded-full blur-xl" />
              {/* Stars */}
              {[0,1,2,3,4].map((s) => (
                <div key={s} className="absolute w-1 h-1 bg-white/60 rounded-full" style={{ top: `${15 + s * 15}%`, left: `${10 + s * 20}%` }} />
              ))}

              <div className="relative z-10 p-5 flex flex-col items-center text-center">
                {/* Logo badge */}
                <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center mb-3 shadow-lg">
                  <GraduationCap size={24} className="text-yellow-300" />
                </div>

                <h1 className="text-[22px] font-black text-white font-heading leading-tight mb-1">
                  دارين
                </h1>
                <p className="text-[10px] text-violet-200 font-bold mb-3">منصة تعليم إلكتروني</p>

                {/* Anime-style children */}
                <div className="flex items-center justify-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-200 to-sky-300 flex items-center justify-center shadow-inner relative">
                    <div className="text-[18px]">👧</div>
                    <div className="absolute -top-1 -left-1 w-3 h-3">
                      <Star size={8} className="text-yellow-300 fill-yellow-300" />
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center shadow-inner relative">
                      <div className="text-[22px]">🧑‍🎓</div>
                      <div className="absolute -top-1 -right-1 w-3 h-3">
                        <Star size={8} className="text-yellow-300 fill-yellow-300" />
                      </div>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-200 to-pink-300 flex items-center justify-center shadow-inner relative">
                    <div className="text-[18px]">👦</div>
                    <div className="absolute -top-1 -left-1 w-3 h-3">
                      <Star size={8} className="text-yellow-300 fill-yellow-300" />
                    </div>
                  </div>
                </div>
                <p className="text-[8px] text-violet-200/80 font-medium">معاً نصنع جيلاً مبدعاً</p>
              </div>
            </div>

            {/* Portal Card */}
            {view === 'types' && (
              <div className="bg-white rounded-[24px] p-4 mb-6 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-[13px] font-black text-slate-900">بوابة الكتب والملخصات</h2>
                  <div className="w-8 h-8 rounded-full bg-violet-50 flex items-center justify-center">
                    <Bell size={12} className="text-violet-600" />
                  </div>
                </div>

                {/* Dark purple section */}
                <div className="bg-gradient-to-br from-[#1a1040] via-[#2a1a60] to-[#3a2080] rounded-[20px] p-5 shadow-lg mb-4">
                  {/* Tabs */}
                  <div className="flex gap-2 mb-4">
                    <div className="px-3 py-1.5 rounded-full bg-white/15 text-white text-[9px] font-black text-center flex-1 backdrop-blur-sm border border-white/10">مركز دارين</div>
                    <div className="px-3 py-1.5 rounded-full bg-white/10 text-white/60 text-[9px] font-black text-center flex-1 backdrop-blur-sm border border-white/5">المذكرات التعليمية</div>
                  </div>

                  <p className="text-[10px] text-violet-200/80 leading-relaxed mb-4 font-medium">
                    نوفر لك أحدث المذكرات والملخصات الدراسية لجميع المراحل التعليمية في الخليج. حمل ما يناسبك الآن.
                  </p>

                  <div className="flex gap-2.5">
                    <button
                      onClick={() => setView('curriculums')}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-l from-[#6C4BFF] to-[#4A2DDB] text-white text-[10px] font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-[#6C4BFF]/30 active:scale-[0.97] transition-all"
                    >
                      <FileText size={12} />
                      تحميل مذكرة
                    </button>
                    <a
                      href={`https://wa.me/${whatsappNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-[10px] font-bold px-4 py-2.5 rounded-xl active:scale-[0.97] transition-all"
                    >
                      <MessageCircle size={12} />
                      تواصل معنا
                    </a>
                  </div>
                </div>

                {/* Features */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'جودة مضمونة', icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                    { label: 'محتوى موثوق', icon: BookCheck, color: 'text-indigo-500', bg: 'bg-indigo-50' },
                    { label: 'دعم مستمر', icon: Headset, color: 'text-violet-500', bg: 'bg-violet-50' },
                  ].map((f) => (
                    <div key={f.label} className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl bg-white border border-slate-100 shadow-sm">
                      <div className={`w-7 h-7 rounded-xl ${f.bg} flex items-center justify-center`}>
                        <f.icon size={12} className={f.color} />
                      </div>
                      <span className="text-[7px] font-black text-slate-700 text-center leading-tight">{f.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Selection Grid for sub-views */}
            {view !== 'types' && (
              <>
                <div className="bg-gradient-to-br from-violet-100 via-violet-50 to-white rounded-[32px] p-5 mb-6 shadow-sm border border-violet-100/50 mt-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/80 rounded-full mb-3 shadow-sm">
                    <BookOpen size={10} className="text-violet-600" />
                    <span className="text-[9px] font-black text-violet-600">
                      {view === 'curriculums' ? `تحميل ${currentTypeName}` : currentCurriculumName}
                    </span>
                  </div>
                  <h1 className="text-[17px] font-black text-indigo-950 leading-tight">
                    {view === 'curriculums' ? (
                      <>اختر <span className="text-transparent bg-clip-text bg-gradient-to-l from-[#6C4BFF] to-[#4A2DDB]">المنهج</span></>
                    ) : (
                      <>اختر <span className="text-transparent bg-clip-text bg-gradient-to-l from-[#6C4BFF] to-[#4A2DDB]">المرحلة</span></>
                    )}
                  </h1>
                  <p className="text-[10px] text-slate-500 font-medium mt-1 leading-relaxed">
                    {view === 'curriculums'
                      ? `تصفح وتحميل ${currentTypeName} لأفضل المناهج التعليمية في الخليج`
                      : `جميع ملفات ${currentCurriculumName} مرتبة ومصنفة لتسهيل الوصول`}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {gridItems.map((item: GridItem, i: number) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (view === 'curriculums') { setSelectedCurriculum(item.id); setView('grades'); }
                        else { setSelectedLevel(item.id); setView('classrooms'); }
                      }}
                      className={cn(
                        "relative flex flex-col items-center justify-center gap-1.5 p-4 rounded-2xl text-white overflow-hidden shadow-sm active:scale-[0.97] transition-all",
                        "bg-gradient-to-br", item.gradient
                      )}
                    >
                      <item.icon size={18} />
                      <span className="text-[10px] font-black text-center leading-tight">{item.name}</span>
                      {item.sub && <span className="text-[8px] text-white/70 font-bold">{item.sub}</span>}
                    </button>
                  ))}

                  <button onClick={goBack}
                    className="flex flex-col items-center justify-center gap-1.5 p-4 rounded-2xl bg-white border border-slate-200 text-slate-500 active:scale-[0.97] transition-all shadow-sm">
                    <ArrowLeft size={16} />
                    <span className="text-[10px] font-black">العودة</span>
                  </button>

                  <Link to="/courses"
                    className="flex flex-col items-center justify-center gap-1.5 p-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-700 text-white active:scale-[0.97] transition-all shadow-sm">
                    <Sparkles size={16} />
                    <span className="text-[10px] font-black">الدورات</span>
                  </Link>
                </div>
              </>
            )}

            {/* Floating Actions */}
            <div className="fixed left-4 bottom-24 flex flex-col gap-3 z-30">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/20 cursor-pointer hover:scale-110 transition-transform">
                <MessageCircle size={16} className="text-white" />
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 cursor-pointer hover:scale-110 transition-transform">
                <Send size={16} className="text-white" />
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20 cursor-pointer hover:scale-110 transition-transform">
                <Moon size={16} className="text-white" />
              </div>
            </div>
          </div>
        ) : view === 'results' ? (
          <div>
            <div className="bg-gradient-to-br from-violet-100 via-violet-50 to-white rounded-[32px] p-5 mb-4 shadow-sm border border-violet-100/50 mt-2">
              <div className="flex items-center gap-1.5 mb-3 text-[9px] font-bold text-slate-400 flex-wrap">
                {[
                  { label: 'الرئيسية', onClick: () => setView('types') },
                  ...(currentTypeName ? [{ label: currentTypeName, onClick: () => setView('curriculums') }] : []),
                  ...(currentCurriculumName ? [{ label: currentCurriculumName, onClick: () => setView('grades') }] : []),
                  ...(currentLevelName ? [{ label: currentLevelName, onClick: () => setView('classrooms') }] : []),
                  ...(selectedGrade ? [{ label: `الصف ${selectedGrade}`, onClick: () => setView('terms') }] : []),
                ].map((crumb, i, arr) => (
                  <span key={i} className="flex items-center gap-1">
                    {i > 0 && <ChevronLeft size={9} className="text-slate-300" />}
                    <button onClick={crumb.onClick}
                      className={i === arr.length - 1 && !selectedSubject ? 'text-indigo-600' : 'hover:text-indigo-500 transition-colors'}
                    >{crumb.label}</button>
                  </span>
                ))}
                {selectedSubject && <><ChevronLeft size={9} className="text-slate-300" /><span className="text-indigo-600 font-black">{currentSubjectName}</span></>}
              </div>

              <div className="flex gap-2">
                <button onClick={goBack} className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 text-white text-[9px] font-black rounded-xl transition-all shadow-sm">
                  <ArrowLeft size={12} /><span>تغيير المادة</span>
                </button>
                <button onClick={() => setView('types')} className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-950 text-white text-[9px] font-black rounded-xl transition-all shadow-sm">
                  <Library size={12} /><span>الرئيسية</span>
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
                <span className="text-[10px] font-black text-slate-400">جاري التحميل...</span>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-3 border border-slate-200">
                  <BookOpen size={20} className="text-slate-300" />
                </div>
                <p className="text-slate-500 font-black text-sm mb-1">لا يوجد محتوى بعد</p>
                <p className="text-slate-400 text-[10px] font-medium">سيتم إضافة المحتوى قريباً لهذا التصنيف</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredPosts.map((post, i) => (
                  <Link key={post.id} to={`/books/${post.slug}`} onClick={() => window.scrollTo(0, 0)}
                    className="flex items-start gap-3 bg-white rounded-2xl border border-slate-100 p-3 shadow-sm active:scale-[0.98] transition-all">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-50 shrink-0">
                      <img src={post.coverImage || 'https://via.placeholder.com/400x200'} alt={post.title} width="64" height="64" loading="lazy" className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[8px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">{post.subject || post.category}</span>
                      <h2 className="text-[11px] font-black text-slate-900 leading-snug mt-1 line-clamp-2">{post.title}</h2>
                      <p className="text-[8px] text-slate-400 mt-0.5">{post.date?.split('T')[0]}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="bg-gradient-to-br from-violet-100 via-violet-50 to-white rounded-[32px] p-5 mb-6 shadow-sm border border-violet-100/50 mt-2 text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/80 rounded-full shadow-sm mb-3">
                <BookOpen size={10} className="text-violet-600" />
                <span className="text-[9px] font-black text-violet-600">
                  {view === 'classrooms' ? `${currentCurriculumName} — ${currentLevelName}`
                    : view === 'terms' ? `الصف ${gradeNames[selectedGrade]}`
                      : `المواد — ${termLabel}`}
                </span>
              </div>
              <h1 className="text-[17px] font-black text-indigo-950">
                {view === 'classrooms' ? (<>اختر <span className="text-transparent bg-clip-text bg-gradient-to-l from-[#6C4BFF] to-[#4A2DDB]">الصف الدراسي</span></>)
                  : view === 'terms' ? (<>اختر <span className="text-transparent bg-clip-text bg-gradient-to-l from-[#6C4BFF] to-[#4A2DDB]">الترم</span></>)
                    : (<>اختر <span className="text-transparent bg-clip-text bg-gradient-to-l from-[#6C4BFF] to-[#4A2DDB]">المادة</span></>)}
              </h1>
              <p className="text-[10px] text-slate-500 font-medium mt-1">
                {view === 'classrooms' ? 'اختر الصف للوصول للمحتوى'
                  : view === 'terms' ? 'اختر الترم الدراسي'
                    : `${filteredPosts.length} نتيجة متاحة`}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {view === 'classrooms' && currentClassrooms.map((cls, i) => (
                <button key={cls} onClick={() => { setSelectedGrade(cls); setView('terms'); }}
                  className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-sm active:scale-[0.97] transition-all">
                  <GraduationCap size={18} />
                  <span className="text-[10px] font-black text-center">الصف {gradeNames[cls] || cls}</span>
                </button>
              ))}

              {view === 'terms' && (
                <>
                  <button onClick={() => { setSelectedTerm('1'); setView('subjects'); }}
                    className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-sm active:scale-[0.97] transition-all">
                    <BookOpen size={18} />
                    <span className="text-[10px] font-black">ترم أول</span>
                  </button>
                  <button onClick={() => { setSelectedTerm('2'); setView('subjects'); }}
                    className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 text-white shadow-sm active:scale-[0.97] transition-all">
                    <BookOpen size={18} />
                    <span className="text-[10px] font-black">ترم ثاني</span>
                  </button>
                </>
              )}

              {view === 'subjects' && currentSubjects.map((subj, i) => (
                <button key={subj.id} onClick={() => { setSelectedSubject(subj.id); setView('results'); window.scrollTo(0, 0); }}
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
                    ? 'دليلك الشامل للتفوق الدراسي — أحدث المناهج، ملخصات، وحلول الكتب لجميع المراحل في الخليج'
                    : view === 'curriculums'
                      ? `تصفح وتحميل ${currentTypeName} لأفضل المناهج التعليمية في الخليج`
                      : `جميع ملفات ${currentCurriculumName} مرتبة ومصنفة لتسهيل الوصول`}
                </p>

                <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto lg:mx-0">
                  {gridItems.map((item: GridItem, i: number) => (
                    <div key={item.id} className="animate-in zoom-in-95 duration-500" style={{ animationDelay: `${i * 80}ms` }}>
                      <button
                        onClick={() => {
                          if (view === 'types') { setSelectedType(item.id); setView('curriculums'); }
                          else if (view === 'curriculums') { setSelectedCurriculum(item.id); setView('grades'); }
                          else { setSelectedLevel(item.id); setView('classrooms'); }
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
                  ...(currentTypeName ? [{ label: currentTypeName, onClick: () => setView('curriculums') }] : []),
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
                <button onClick={goBack} className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-black rounded-xl transition-all">
                  <ArrowLeft size={14} /><span>تغيير المادة</span>
                </button>
                <button onClick={() => setView('types')} className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-white text-xs font-black rounded-xl transition-all">
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
                  {filteredPosts.map((post, i) => (
                    <div key={post.id} className="animate-in zoom-in-95 duration-500" style={{ animationDelay: `${i * 60}ms` }}>
                      <Link to={`/books/${post.slug}`} onClick={() => window.scrollTo(0, 0)}
                        className="group block bg-white dark:bg-slate-900/50 dark:backdrop-blur-xl border border-slate-100 dark:border-slate-800/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500 h-full flex flex-col">
                        <div className="relative aspect-video overflow-hidden bg-slate-50 dark:bg-slate-800/30">
                          <img src={post.coverImage || 'https://via.placeholder.com/400x200'} alt={post.title} width="400" height="225" loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent" />
                          <div className="absolute top-3 right-3 z-10">
                            <span className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm text-indigo-600 dark:text-indigo-400 text-[10px] font-black px-2.5 py-1 rounded-lg shadow-sm">{post.subject || post.category}</span>
                          </div>
                        </div>
                        <div className="p-4 flex flex-col flex-1">
                          <div className="flex items-center gap-3 text-[11px] font-bold text-slate-400 mb-2">
                            <span className="flex items-center gap-1"><Calendar size={12} /><span>{post.date?.split('T')[0]}</span></span>
                            <span className="flex items-center gap-1"><User size={12} /><span>{post.author}</span></span>
                          </div>
                          <h2 className="text-sm sm:text-base font-heading font-black text-slate-900 dark:text-slate-50 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-2">{post.title}</h2>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 flex-1">{post.excerpt}</p>
                          <div className="mt-4 inline-flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-black text-[11px] group/link">
                            <span>اقرأ المقال</span>
                            <ArrowLeft size={14} className="group-hover/link:-translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="text-center max-w-3xl mx-auto mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50/60 dark:bg-indigo-500/10 backdrop-blur-sm border border-indigo-100 dark:border-indigo-500/20 rounded-full mb-4">
                  <BookOpen size={13} className="text-indigo-600 dark:text-indigo-400" />
                  <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-300">
                    {view === 'classrooms' ? `${currentCurriculumName} — ${currentLevelName}`
                      : view === 'terms' ? `الصف ${gradeNames[selectedGrade]}`
                        : `المواد — ${termLabel}`}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-heading font-black text-slate-900 dark:text-slate-50 mb-3">
                  {view === 'classrooms' ? (<>اختر <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-600">الصف الدراسي</span></>)
                    : view === 'terms' ? (<>اختر <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-600">الترم</span></>)
                      : (<>اختر <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-600">المادة</span></>)}
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                  {view === 'classrooms' ? 'اختر الصف للوصول للمحتوى'
                    : view === 'terms' ? 'اختر الترم الدراسي'
                      : `${filteredPosts.length} نتيجة متاحة`}
                </p>
              </div>

              <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {view === 'classrooms' && currentClassrooms.map((cls, i) => (
                    <div key={cls} className="animate-in zoom-in-95 duration-500" style={{ animationDelay: `${i * 60}ms` }}>
                      <button onClick={() => { setSelectedGrade(cls); setView('terms'); }}
                        className="w-full py-5 px-3 flex flex-col items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 text-white border border-white/5 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 active:scale-[0.97]">
                        <GraduationCap size={22} />
                        <span className="text-xs sm:text-sm font-black text-center">الصف {gradeNames[cls] || cls}</span>
                      </button>
                    </div>
                  ))}

                  {view === 'terms' && (
                    <>
                      <div className="animate-in zoom-in-95 duration-500">
                        <button onClick={() => { setSelectedTerm('1'); setView('subjects'); }}
                          className="w-full py-5 px-3 flex flex-col items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 active:scale-[0.97]">
                          <BookOpen size={22} />
                          <span className="text-xs sm:text-sm font-black">ترم أول</span>
                        </button>
                      </div>
                      <div className="animate-in zoom-in-95 duration-500" style={{ animationDelay: '60ms' }}>
                        <button onClick={() => { setSelectedTerm('2'); setView('subjects'); }}
                          className="w-full py-5 px-3 flex flex-col items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 active:scale-[0.97]">
                          <BookOpen size={22} />
                          <span className="text-xs sm:text-sm font-black">ترم ثاني</span>
                        </button>
                      </div>
                    </>
                  )}

                  {view === 'subjects' && currentSubjects.map((subj, i) => (
                    <div key={subj.id} className="animate-in zoom-in-95 duration-500" style={{ animationDelay: `${i * 60}ms` }}>
                      <button onClick={() => { setSelectedSubject(subj.id); setView('results'); window.scrollTo(0, 0); }}
                        className={cn("w-full py-5 px-3 flex flex-col items-center justify-center gap-2 rounded-2xl bg-gradient-to-br text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 active:scale-[0.97]", subj.gradient)}>
                        <span className="text-xs sm:text-sm font-black text-center">{subj.name}</span>
                      </button>
                    </div>
                  ))}

                  <div className="animate-in zoom-in-95 duration-500">
                    <button onClick={goBack}
                      className="w-full py-5 px-3 flex flex-col items-center justify-center gap-2 rounded-2xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700/50 transition-all duration-300 active:scale-[0.97]">
                      <ArrowLeft size={20} />
                      <span className="text-xs font-black">العودة</span>
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
