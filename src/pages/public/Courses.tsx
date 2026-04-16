import { useState } from 'react';
import { PublicNavbar } from '../../components/public/PublicNavbar';
import { PublicFooter } from '../../components/public/PublicFooter';
import { Search, Users, Sparkles, LayoutGrid, GraduationCap, BookOpen, Globe, Languages, Target, Star } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { SEO } from '../../components/SEO';

// Import course images
import foundationImg from '../../assets/courses/foundation.png';
import kuwaitiImg from '../../assets/courses/kuwaiti-curriculum.jpg';
import qatariImg from '../../assets/courses/qatari-curriculum.jpg';
import saudiImg from '../../assets/courses/saudi-curriculum.jpg';
import uaeImg from '../../assets/courses/uae-curriculum.jpg';
import omanImg from '../../assets/courses/oman-curriculum.jpg';
import egyptImg from '../../assets/courses/egypt-curriculum.jpg';
import jordanImg from '../../assets/courses/jordan-curriculum.jpg';

const COURSES = [
    { id: 1, category: 'foundation', title: 'كورس التأسيس الشامل', desc: 'البرنامج الأقوى لتأسيس طفلك في (اللغة العربية، الإنجليزية، والرياضيات) بأساليب تفاعلية حديثة تضمن إتقان المهارات الأساسية في وقت قياسي.', students: '5.2k', rating: 4.9, price: 'متاح الآن', image: foundationImg },
    { id: 2, category: 'quran', title: 'حفظ القرآن الكريم', desc: 'حلقات تحفيظ فردية وجماعية مع التركيز على التجويد والمراجعة المستمرة.', students: '8.4k', rating: 4.8, price: 'متاح الآن', image: foundationImg },
    { id: 14, category: 'quran', title: 'حفظ مقرر دراسي', desc: 'تحفيظ المنهج الدراسي للتربية الإسلامية بدقة وإتقان لجميع المراحل الدراسية.', students: '4.3k', rating: 4.7, price: 'متاح الآن', image: foundationImg },
    { id: 15, category: 'quran', title: 'أحكام التجويد والتلاوة', desc: 'دراسة تطبيقية ونظرية لأحكام التجويد لتحسين جودة التلاوة وإتقان مخارج الحروف.', students: '3.6k', rating: 4.6, price: 'متاح الآن', image: foundationImg },

    // Gulf & Regional Curricula
    { id: 3, category: 'gulf', title: 'المنهج الكويتي', desc: 'تغطية شاملة لجميع مواد المنهج الكويتي للمراحل الابتدائية والمتوسطة والثانوية.', students: '4.5k', rating: 4.7, price: 'متاح الآن', image: kuwaitiImg },
    { id: 9, category: 'gulf', title: 'المنهج السعودي', desc: 'شرح متكامل لجميع مواد المنهج السعودي المطور لجميع المراحل الدراسية مع نخبة من الأساتذة.', students: '4.1k', rating: 4.8, price: 'متاح الآن', image: saudiImg },
    { id: 10, category: 'gulf', title: 'المنهج الإماراتي', desc: 'متابعة دقيقة وشرح وافٍ للمناهج الإماراتية الحديثة، مع التركيز على نواتج التعلم المتطورة.', students: '3.2k', rating: 4.5, price: 'متاح الآن', image: uaeImg },
    { id: 4, category: 'gulf', title: 'المنهج القطري', desc: 'دروس تقوية ومتابعة يومية لطلاب المنهج القطري مع نخبة من المعلمين المختصين.', students: '3.3k', rating: 4.6, price: 'متاح الآن', image: qatariImg },
    { id: 5, category: 'gulf', title: 'منهج سلطنة عُمان', desc: 'شرح مبسط ووافٍ للمناهج العمانية، يركز على الفهم العميق والتحضير للاختبارات.', students: '3.1k', rating: 4.4, price: 'متاح الآن', image: omanImg },
    { id: 11, category: 'gulf', title: 'المنهج المصري', desc: 'دروس تقوية لطلاب المنهج المصري المقيمين في الخارج بأسلوب مبسط يحاكي النظام التعليمي المصري.', students: '4.8k', rating: 4.7, price: 'متاح الآن', image: egyptImg },
    { id: 6, category: 'gulf', title: 'المنهج الأردني', desc: 'تعليم عالي الجودة يواكب المعايير الأردنية، مع التركيز على المواد العلمية والأدبية.', students: '2.8k', rating: 4.3, price: 'متاح الآن', image: jordanImg },

    { id: 7, category: 'english', title: 'اللغة الإنجليزية', desc: 'تطوير مهارات التحدث والكتابة باللغة الإنجليزية باستخدام مناهج عالمية تفاعلية.', students: '3.9k', rating: 4.8, price: 'متاح الآن', image: foundationImg },
    { id: 12, category: 'english', title: 'اللغة العربية', desc: 'تحسين مهارات القراءة والكتابة والنحو العربي بأساليب مبسطة وشيقة لجميع المستويات.', students: '4.2k', rating: 4.7, price: 'متاح الآن', image: foundationImg },
    { id: 13, category: 'english', title: 'اللغة الفرنسية', desc: 'تعلم أساسيات ومستويات اللغة الفرنسية مع نخبة من المتخصصين بأسلوب تفاعلي ممتع.', students: '2.9k', rating: 4.5, price: 'متاح الآن', image: foundationImg },
    { id: 8, category: 'skills', title: 'كورس القدرات', desc: 'تجهيز الطلاب لاختبارات القدرات العامة (الكمي واللفظي) بأحدث الاستراتيجيات والأساليب العلمية.', students: '3.5k', rating: 4.9, price: 'متاح الآن', image: foundationImg },
];

const CATEGORIES = [
    { label: 'الكل', value: 'all', icon: LayoutGrid },
    { label: 'التأسيس', value: 'foundation', icon: GraduationCap },
    { label: 'القرآن الكريم', value: 'quran', icon: BookOpen },
    { label: 'مناهج الخليج', value: 'gulf', icon: Globe },
    { label: 'اللغات', value: 'english', icon: Languages },
    { label: 'القدرات', value: 'skills', icon: Target },
];

// Star rating component
const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
            <Star
                key={star}
                size={10}
                className={star <= Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-yellow-200 fill-yellow-100'}
            />
        ))}
        <span className="text-[9px] font-black text-gray-600 mr-1">{rating}</span>
    </div>
);

export const Courses = () => {
    const { adminPhone } = useSettings();
    const whatsappNumber = adminPhone.replace(/\D/g, '');
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredCourses = COURSES.filter(course => {
        const matchesCategory = activeCategory === 'all' || course.category === activeCategory;
        const searchLower = (searchQuery || '').toLowerCase().trim();
        const matchesSearch = !searchLower ||
            (course.title || '').toLowerCase().includes(searchLower) ||
            (course.desc || '').toLowerCase().includes(searchLower);
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 font-sans text-gray-800 dark:text-slate-100 relative flex flex-col">
            <SEO
                title="الدورات والبرامج"
                description="استكشف مجموعة واسعة من الدورات التعليمية المبتكرة في معهد دارين. كورس التأسيس الشامل، المناهج الخليجية، تحفيظ القرآن، ودورات اللغات."
            />
            <PublicNavbar />

            <main className="flex-grow pt-24 md:pt-32 pb-24 relative overflow-hidden bg-white dark:bg-slate-950">
                {/* Background Art - Watermelon Theme */}
                <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.1]" 
                     style={{ 
                         backgroundImage: 'radial-gradient(circle at 10% 20%, #EF4444 0%, transparent 40%), radial-gradient(circle at 90% 80%, #16A34A 0%, transparent 40%)',
                         filter: 'blur(100px)'
                     }}>
                </div>
                {/* Subtle Mesh Pattern */}
                <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.05]"
                     style={{ 
                         backgroundImage: 'url("https://www.transparenttextures.com/patterns/simple-dashed.png")',
                         backgroundSize: '200px 200px'
                     }}>
                </div>

                <div className="container mx-auto px-4 relative z-10">

                    {/* Header */}
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/50 backdrop-blur-sm border border-red-50 rounded-full mb-6 animate-fade-in group hover:border-red-100 shadow-sm transition-all">
                            <Sparkles size={14} className="text-red-500" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">استكشف مستقبل التعلم</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl lg:text-7xl font-heading font-black text-slate-900 dark:text-slate-50 mb-4 leading-tight">
                            <span className="block mb-2 md:mb-3">دورات <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-green-600">معهد دارين</span></span>
                            <span className="text-xl md:text-3xl text-gray-400 dark:text-slate-400 font-bold block">
                                استثمر في <span className="text-red-600 underline decoration-green-500/30 decoration-8 underline-offset-8">مستقبل طفلك</span> اليوم
                            </span>
                        </h1>
                        <p className="text-xs md:text-lg text-slate-900 dark:text-slate-100 max-w-3xl mx-auto leading-relaxed font-black mt-8">
                            نقدم باقة متنوعة من البرامج التعليمية المصممة بعناية لتناسب جميع المستويات والمراحل الدراسية، بأساليب تفاعلية تجعل التعلم متعة حقيقية.
                        </p>
                    </div>

                    {/* Search & Filters */}
                    <div className="max-w-5xl mx-auto mb-20 relative px-2">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative group">
                                <input
                                    type="text"
                                    placeholder="ابحث عن دورتك المفضلة..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full px-12 py-5 rounded-xl bg-white border border-gray-100 shadow-2xl shadow-red-500/5 focus:border-red-500/30 focus:ring-4 focus:ring-red-500/5 outline-none transition-all text-lg placeholder:text-gray-300 font-bold"
                                />
                                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 w-6 h-6 group-focus-within:text-red-500 transition-colors" />
                            </div>
                            <button className="px-10 py-5 bg-black text-white font-black text-sm uppercase tracking-widest rounded-xl hover:bg-red-600 transition-all duration-500 shadow-xl shadow-black/10 flex items-center justify-center gap-3">
                                <span>بحث ذكي</span>
                                <Target size={18} className="animate-pulse" />
                            </button>
                        </div>

                        <div className="flex flex-wrap justify-center gap-2 md:gap-3 mt-10">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat.value}
                                    onClick={() => setActiveCategory(cat.value)}
                                    className={`flex items-center gap-2 px-6 py-3.5 rounded-full font-black text-[10px] md:text-sm transition-all duration-500 border-2 ${activeCategory === cat.value
                                        ? 'bg-slate-900 dark:bg-slate-100 border-slate-900 dark:border-slate-100 text-white dark:text-slate-950 shadow-xl shadow-black/20 dark:shadow-indigo-500/20 -translate-y-1'
                                        : 'bg-white dark:bg-slate-900/50 dark:backdrop-blur-md text-gray-500 dark:text-slate-400 border-gray-100 dark:border-slate-800 hover:border-slate-900 dark:hover:border-slate-100 hover:text-slate-900 dark:hover:text-slate-100'
                                        }`}
                                >
                                    <cat.icon size={16} className={`${activeCategory === cat.value ? 'text-green-500' : 'text-gray-300'}`} />
                                    <span className={`tracking-tight whitespace-nowrap ${activeCategory === cat.value ? 'text-white' : ''}`}>{cat.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Desktop Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8 max-w-7xl mx-auto">
                        {filteredCourses.map((course) => (
                            <div
                                key={course.id}
                                className="group relative bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl border border-gray-100 dark:border-slate-800/50 rounded-2xl overflow-hidden flex flex-col h-full shadow-lg shadow-gray-200/20 dark:shadow-black/50 hover:shadow-2xl dark:hover:shadow-indigo-500/10 transition-all duration-500"
                            >
                                {/* Course Header (Clean Image Area) */}
                                <div className="h-40 relative overflow-hidden bg-gray-50">
                                    <img
                                        src={course.image}
                                        alt={course.title}
                                        className="w-full h-full object-cover object-center"
                                    />
                                    
                                    {/* Corner Status Badge */}
                                    <div className="absolute top-3 right-3 z-20">
                                        <div className="bg-black/85 backdrop-blur-md px-3 py-1.5 rounded-full text-[9px] font-black uppercase text-green-500 tracking-tighter shadow-sm flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                            {course.price}
                                        </div>
                                    </div>
                                </div>

                                {/* Course Content */}
                                <div className="px-5 pt-8 pb-0 flex flex-col flex-grow relative">
                                    {/* Star Rating Badge - half on image, half on content */}
                                    <div className="absolute -top-4 left-4 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 px-2.5 py-1.5 flex items-center gap-1">
                                        <StarRating rating={course.rating} />
                                    </div>

                                    <div className="mt-0 mb-1">
                                        <h3 className="text-base md:text-lg font-black font-heading leading-tight text-slate-900 dark:text-slate-50 group-hover:text-red-600 transition-colors min-h-[3rem]">
                                            {course.title}
                                        </h3>
                                        <div className="h-1 w-12 bg-green-500/20 rounded-full mt-1 group-hover:w-20 group-hover:bg-red-500/50 transition-all duration-700"></div>
                                    </div>

                                    <p className="text-gray-400 text-[11px] md:text-xs leading-relaxed font-medium line-clamp-3 mb-4 mt-2">
                                        {course.desc}
                                    </p>

                                    <div className="mt-auto border-t border-gray-50">
                                        <div className="flex items-center justify-between py-3 px-1">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center">
                                                    <Users size={12} className="text-red-500" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-slate-900 dark:text-slate-100 leading-none">{course.students}</span>
                                                    <span className="text-[8px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">طالب مسجل</span>
                                                </div>
                                            </div>
                                            <div className="bg-green-50 dark:bg-green-950/30 px-2.5 py-1 rounded-lg border border-green-100/50 dark:border-green-500/20">
                                                <span className="text-[9px] font-black text-green-700 dark:text-green-400">
                                                    {course.category === 'quran' ? '8 حصص - 400 ج' :
                                                        course.category === 'foundation' ? '8 حصص - 800 ج' :
                                                            '8 حصص - 1200 ج'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Full-width WhatsApp Button */}
                                        <a
                                            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`السلام عليكم، أرغب في الاستفسار عن ${course.title}`)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center gap-2 group/btn bg-black text-white w-full py-4 hover:bg-red-600 transition-all duration-500 overflow-hidden relative"
                                        >
                                            <span className="relative z-10 text-[11px] font-black uppercase tracking-widest">احجز عن طريق الواتساب</span>
                                            <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover/btn:left-[100%] transition-all duration-1000"></div>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredCourses.length === 0 && (
                        <div className="text-center py-24 bg-white border border-dashed border-gray-200 rounded-none">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Search size={32} className="text-gray-200" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-2">عفواً، لا توجد نتائج</h3>
                            <p className="text-gray-400 font-medium">جرب البحث بكلمات مختلفة أو اختر تصنيفاً آخر.</p>
                        </div>
                    )}
                </div>
            </main>

            <PublicFooter />
        </div>
    );
};
