import { useState } from 'react';
import { PublicNavbar } from '../../components/public/PublicNavbar';
import { PublicFooter } from '../../components/public/PublicFooter';
import { Search, Users, Sparkles, ArrowLeft, LayoutGrid, GraduationCap, BookOpen, Globe, Languages, Target } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { SEO } from '../../components/SEO';

// Import course images
import foundationImg from '../../assets/courses/foundation.png';
import quranImg from '../../assets/courses/quran.png';
import kuwaitImg from '../../assets/courses/kuwait.png';
import qatarImg from '../../assets/courses/qatar.png';
import omanImg from '../../assets/courses/oman.png';
import jordanImg from '../../assets/courses/jordan.png';
import englishImg from '../../assets/courses/english.png';
import qudratImg from '../../assets/courses/qudrat.png';

const COURSES = [
    { id: 1, category: 'foundation', title: 'كورس التأسيس الشامل', desc: 'البرنامج الأقوى لتأسيس طفلك في (اللغة العربية، الإنجليزية، والرياضيات) بأساليب تفاعلية حديثة تضمن إتقان المهارات الأساسية في وقت قياسي.', students: '2.5k', icon: '💎', color: 'gold', price: 'الأكثر طلباً', image: foundationImg },
    { id: 2, category: 'quran', title: 'حفظ القرآن الكريم', desc: 'حلقات تحفيظ فردية وجماعية مع التركيز على التجويد والمراجعة المستمرة.', students: '4.2k', icon: '📿', color: 'emerald', price: 'متاح الآن', image: quranImg },
    { id: 3, category: 'kuwait', title: 'المنهج الكويتي', desc: 'تغطية شاملة لجميع مواد المنهج الكويتي للمراحل الابتدائية والمتوسطة والثانوية.', students: '2.1k', icon: '🇰🇼', color: 'blue', price: 'سنوي', image: kuwaitImg },
    { id: 4, category: 'qatar', title: 'المنهج القطري', desc: 'دروس تقوية ومتابعة يومية لطلاب المنهج القطري مع نخبة من المعلمين المختصين.', students: '1.4k', icon: '🇶🇦', color: 'maroon', price: 'فصلي', image: qatarImg },
    { id: 5, category: 'oman', title: 'منهج سلطنة عُمان', desc: 'شرح مبسط ووافٍ للمناهج العمانية، يركز على الفهم العميق والتحضير للاختبارات.', students: '1.3k', icon: '🇴🇲', color: 'green', price: 'فصلي', image: omanImg },
    { id: 6, category: 'jordan', title: 'المنهج الأردني', desc: 'تعليم عالي الجودة يواكب المعايير الأردنية، مع التركيز على المواد العلمية والأدبية.', students: '1.1k', icon: '🇯🇴', color: 'red', price: 'سنوي', image: jordanImg },
    { id: 7, category: 'english', title: 'اللغة الإنجليزية', desc: 'تطوير مهارات التحدث والكتابة باللغة الإنجليزية باستخدام مناهج عالمية تفاعلية.', students: '1.8k', icon: '🇬🇧', color: 'indigo', price: 'مستويات', image: englishImg },
    { id: 8, category: 'skills', title: 'كورس القدرات', desc: 'تجهيز الطلاب لاختبارات القدرات العامة (الكمي واللفظي) بأحدث الاستراتيجيات والأساليب العلمية.', students: '1.6k', icon: '🎯', color: 'indigo', price: 'متاح الآن', image: qudratImg },
];

const CATEGORIES = [
    { label: 'الكل', value: 'all', icon: LayoutGrid },
    { label: 'التأسيس', value: 'foundation', icon: GraduationCap },
    { label: 'القرآن الكريم', value: 'quran', icon: BookOpen },
    { label: 'مناهج الخليج', value: 'kuwait', icon: Globe },
    { label: 'اللغات', value: 'english', icon: Languages },
    { label: 'القدرات', value: 'skills', icon: Target },
];

export const Courses = () => {
    const { adminPhone } = useSettings();
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredCourses = COURSES.filter(course => {
        const matchesCategory = activeCategory === 'all' || course.category === activeCategory;
        const matchesSearch = course.title.includes(searchQuery) || course.desc.includes(searchQuery);
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800 relative flex flex-col">
            <SEO
                title="الدورات والبرامج"
                description="استكشف مجموعة واسعة من الدورات التعليمية المبتكرة في معهد دارين. كورس التأسيس الشامل، المناهج الخليجية، تحفيظ القرآن، ودورات اللغات."
            />
            <PublicNavbar />

            <main className="flex-grow pt-28 md:pt-32 pb-24 relative overflow-hidden">
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none hidden md:block"></div>
                <div className="absolute bottom-1/3 left-0 w-80 h-80 bg-blue-600/5 rounded-full blur-[100px] -translate-x-1/2 pointer-events-none hidden md:block"></div>

                <div className="container mx-auto px-4 relative z-10">

                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gray-900 text-white rounded-none mb-6 animate-fade-in group hover:border-gold transition-colors">
                            <Sparkles size={14} className="text-gold" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">هيا لنتعلم معاً</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl lg:text-6xl font-heading font-black text-gray-900 mb-2">
                            <span className="block mb-2 md:mb-3">دورات معهد دارين</span>
                            <span className="block text-2xl md:text-4xl lg:text-5xl text-gray-600 font-bold">
                                | مستقبل طفلك <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold to-gold-hover">يبدأ بدورة</span>
                            </span>
                        </h1>
                        <p className="text-base md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed font-medium">
                            استكشف مسارات تعليمية مبتكرة تجمع بين <span className="text-gray-900 font-bold">الأصالة والتقنيات الحديثة</span> لتطوير مهارات طفلك وتفوقه الدراسي.
                        </p>
                    </div>

                    {/* Search & Filters */}
                    <div className="max-w-5xl mx-auto mb-20">
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                            <div className="lg:col-span-3 relative group">
                                <input
                                    type="text"
                                    placeholder="ابحث عن دورة، منهج، أو مهارة معينة..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full px-8 py-5 rounded-none bg-white border border-gray-100 shadow-xl shadow-gray-100/50 focus:border-gold outline-none transition-all text-lg pr-14 placeholder:text-gray-300"
                                />
                                <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 w-6 h-6 group-focus-within:text-gold transition-colors" />
                            </div>
                            <div className="flex gap-2">
                                <button className="flex-1 px-8 py-5 bg-gray-900 text-white font-black text-sm uppercase tracking-widest rounded-none hover:bg-gold transition-all duration-500 shadow-lg shadow-gray-200">
                                    بحث سريع
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 md:flex md:flex-wrap justify-center gap-2 md:gap-4 mt-12 px-2 md:px-4">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat.value}
                                    onClick={() => setActiveCategory(cat.value)}
                                    className={`flex flex-col md:flex-row items-center justify-center gap-1 md:gap-3 px-2 md:px-6 py-3 md:py-3.5 rounded-none font-bold text-[10px] md:text-sm transition-all duration-500 border-2 ${activeCategory === cat.value
                                        ? 'bg-gray-900 border-gray-900 text-white shadow-xl shadow-gray-900/20 -translate-y-1'
                                        : 'bg-white text-gray-400 border-gray-50 hover:border-gold hover:text-gold hover:bg-gold/5'
                                        }`}
                                >
                                    <cat.icon size={16} className={`${activeCategory === cat.value ? 'text-gold' : 'text-gray-300'}`} />
                                    <span className="tracking-tight whitespace-nowrap">{cat.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Desktop Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-7xl mx-auto">
                        {filteredCourses.map((course) => (
                            <div
                                key={course.id}
                                className="group relative bg-white border border-gray-100 rounded-none overflow-hidden hover:border-gold transition-all duration-500 hover:-translate-y-2 flex flex-col h-full shadow-sm hover:shadow-2xl hover:shadow-gold/5"
                            >
                                {/* Course Header (Image Background) */}
                                <div className="h-40 relative overflow-hidden">
                                    {/* Image Background */}
                                    <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-110">
                                        <img
                                            src={course.image}
                                            alt={course.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    <div className="absolute top-4 left-4">
                                        <div className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-none text-[8px] font-black uppercase text-gray-900 tracking-tighter shadow-sm">
                                            {course.price}
                                        </div>
                                    </div>
                                </div>

                                {/* Course Content */}
                                <div className="p-8 flex flex-col flex-grow relative">
                                    {/* Holographic Glow on Hover */}
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-700 pointer-events-none bg-gradient-to-br from-gold to-transparent"></div>

                                    <div className="relative mb-6">
                                        <h3 className={`text-lg font-black font-heading leading-tight min-h-[2.5rem] flex items-start gap-2 transition-all duration-300 ${course.id === 1 ? 'text-transparent bg-clip-text bg-gradient-to-r from-gold via-blue-600 to-gold drop-shadow-sm whitespace-nowrap' : 'text-gray-900 group-hover:text-gold'}`}>
                                            {course.title}
                                        </h3>
                                        <div className={`absolute -bottom-2 right-0 h-[3px] rounded-full bg-gradient-to-l from-gold to-transparent transition-all duration-700 ${course.id === 1 ? 'w-24' : 'w-0 group-hover:w-16'}`}></div>
                                    </div>

                                    <p className="text-gray-400 text-sm mb-10 leading-relaxed font-medium line-clamp-3 min-h-[4.5rem]">
                                        {course.desc}
                                    </p>

                                    <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-none bg-gray-50 flex items-center justify-center">
                                                <Users size={12} className="text-gray-400" />
                                            </div>
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{course.students} طالب</span>
                                        </div>

                                        <a
                                            href={`https://wa.me/${adminPhone}?text=${encodeURIComponent(`السلام عليكم، أرغب في الاستفسار عن ${course.title}`)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 group/btn bg-gray-900 text-white px-4 py-2 rounded-none hover:bg-gold transition-all duration-300"
                                        >
                                            <span className="text-[10px] font-black uppercase tracking-widest">عرض التفاصيل</span>
                                            <ArrowLeft size={14} className="group-hover/btn:-translate-x-1 transition-transform" />
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


