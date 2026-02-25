import { useState } from 'react';
import { PublicNavbar } from '../../components/public/PublicNavbar';
import { PublicFooter } from '../../components/public/PublicFooter';
import { Search, Users, Sparkles, ArrowLeft, LayoutGrid, GraduationCap, BookOpen, Globe, Languages, Target } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { SEO } from '../../components/SEO';

// Import course images
import foundationImg from '../../assets/courses/foundation.png';

const COURSES = [
    { id: 1, category: 'foundation', title: 'كورس التأسيس الشامل', desc: 'البرنامج الأقوى لتأسيس طفلك في (اللغة العربية، الإنجليزية، والرياضيات) بأساليب تفاعلية حديثة تضمن إتقان المهارات الأساسية في وقت قياسي.', students: '5.2k', icon: '💎', color: 'gold', price: 'متاح الآن', image: foundationImg },
    { id: 2, category: 'quran', title: 'حفظ القرآن الكريم', desc: 'حلقات تحفيظ فردية وجماعية مع التركيز على التجويد والمراجعة المستمرة.', students: '8.4k', icon: '📿', color: 'emerald', price: 'متاح الآن', image: foundationImg },
    { id: 14, category: 'quran', title: 'حفظ مقرر دراسي', desc: 'تحفيظ المنهج الدراسي للتربية الإسلامية بدقة وإتقان لجميع المراحل الدراسية.', students: '4.3k', icon: '📖', color: 'emerald', price: 'متاح الآن', image: foundationImg },
    { id: 15, category: 'quran', title: 'أحكام التجويد والتلاوة', desc: 'دراسة تطبيقية ونظرية لأحكام التجويد لتحسين جودة التلاوة وإتقان مخارج الحروف.', students: '3.6k', icon: '📢', color: 'emerald', price: 'متاح الآن', image: foundationImg },

    // Gulf & Regional Curricula (Category All Set to 'gulf')
    { id: 3, category: 'gulf', title: 'المنهج الكويتي', desc: 'تغطية شاملة لجميع مواد المنهج الكويتي للمراحل الابتدائية والمتوسطة والثانوية.', students: '4.5k', icon: '🇰🇼', color: 'blue', price: 'متاح الآن', image: foundationImg },
    { id: 9, category: 'gulf', title: 'المنهج السعودي', desc: 'شرح متكامل لجميع مواد المنهج السعودي المطور لجميع المراحل الدراسية مع نخبة من الأساتذة.', students: '4.1k', icon: '🇸🇦', color: 'green', price: 'متاح الآن', image: foundationImg },
    { id: 10, category: 'gulf', title: 'المنهج الإماراتي', desc: 'متابعة دقيقة وشرح وافٍ للمناهج الإماراتية الحديثة، مع التركيز على نواتج التعلم المتطورة.', students: '3.2k', icon: '🇦🇪', color: 'red', price: 'متاح الآن', image: foundationImg },
    { id: 4, category: 'gulf', title: 'المنهج القطري', desc: 'دروس تقوية ومتابعة يومية لطلاب المنهج القطري مع نخبة من المعلمين المختصين.', students: '3.3k', icon: '🇶🇦', color: 'maroon', price: 'متاح الآن', image: foundationImg },
    { id: 5, category: 'gulf', title: 'منهج سلطنة عُمان', desc: 'شرح مبسط ووافٍ للمناهج العمانية، يركز على الفهم العميق والتحضير للاختبارات.', students: '3.1k', icon: '🇴🇲', color: 'green', price: 'متاح الآن', image: foundationImg },
    { id: 11, category: 'gulf', title: 'المنهج المصري', desc: 'دروس تقوية لطلاب المنهج المصري المقيمين في الخارج بأسلوب مبسط يحاكي النظام التعليمي المصري.', students: '4.8k', icon: '🇪🇬', color: 'red', price: 'متاح الآن', image: foundationImg },
    { id: 6, category: 'gulf', title: 'المنهج الأردني', desc: 'تعليم عالي الجودة يواكب المعايير الأردنية، مع التركيز على المواد العلمية والأدبية.', students: '2.8k', icon: '🇯🇴', color: 'red', price: 'متاح الآن', image: foundationImg },

    { id: 7, category: 'english', title: 'اللغة الإنجليزية', desc: 'تطوير مهارات التحدث والكتابة باللغة الإنجليزية باستخدام مناهج عالمية تفاعلية.', students: '3.9k', icon: '🇬🇧', color: 'indigo', price: 'متاح الآن', image: foundationImg },
    { id: 12, category: 'english', title: 'اللغة العربية', desc: 'تحسين مهارات القراءة والكتابة والنحو العربي بأساليب مبسطة وشيقة لجميع المستويات.', students: '4.2k', icon: '🇸🇦', color: 'emerald', price: 'متاح الآن', image: foundationImg },
    { id: 13, category: 'english', title: 'اللغة الفرنسية', desc: 'تعلم أساسيات ومستويات اللغة الفرنسية مع نخبة من المتخصصين بأسلوب تفاعلي ممتع.', students: '2.9k', icon: '🇫🇷', color: 'blue', price: 'متاح الآن', image: foundationImg },
    { id: 8, category: 'skills', title: 'كورس القدرات', desc: 'تجهيز الطلاب لاختبارات القدرات العامة (الكمي واللفظي) بأحدث الاستراتيجيات والأساليب العلمية.', students: '3.5k', icon: '🎯', color: 'indigo', price: 'متاح الآن', image: foundationImg },
];

const CATEGORIES = [
    { label: 'الكل', value: 'all', icon: LayoutGrid },
    { label: 'التأسيس', value: 'foundation', icon: GraduationCap },
    { label: 'القرآن الكريم', value: 'quran', icon: BookOpen },
    { label: 'مناهج الخليج', value: 'gulf', icon: Globe },
    { label: 'اللغات', value: 'english', icon: Languages },
    { label: 'القدرات', value: 'skills', icon: Target },
];

export const Courses = () => {
    const { adminPhone } = useSettings();
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
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800 relative flex flex-col">
            <SEO
                title="الدورات والبرامج"
                description="استكشف مجموعة واسعة من الدورات التعليمية المبتكرة في معهد دارين. كورس التأسيس الشامل، المناهج الخليجية، تحفيظ القرآن، ودورات اللغات."
            />
            <PublicNavbar />

            <main className="flex-grow pt-24 md:pt-28 pb-24 relative overflow-hidden">
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
                        <p className="text-[11px] md:text-xl text-gray-500 max-w-4xl mx-auto leading-relaxed md:leading-relaxed font-medium px-0 md:px-0">
                            <span className="md:inline block whitespace-nowrap tracking-tighter sm:tracking-normal">استكشف مسارات تعليمية مبتكرة تجمع بين الأصالة والتقنيات الحديثة</span>
                            <span className="md:inline block whitespace-nowrap tracking-tighter sm:tracking-normal">لتطوير مهارات طفلك وتفوقه الدراسي.</span>
                        </p>
                    </div>

                    {/* Search & Filters */}
                    <div className="max-w-5xl mx-auto mb-20">
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                            <div className="lg:col-span-3 relative group">
                                <input
                                    type="text"
                                    placeholder="اكتب ما تريد البحث عنه..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full px-8 py-5 rounded-none bg-white border border-gray-100 shadow-xl shadow-gray-100/50 focus:border-gold outline-none transition-all text-lg pr-14 placeholder:text-gray-400"
                                />
                                <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 w-6 h-6 group-focus-within:text-gold transition-colors" />
                            </div>
                            <div className="flex gap-2">
                                <button className="flex-1 px-8 py-5 bg-gray-900 text-white font-black text-sm uppercase tracking-widest rounded-none hover:bg-gold transition-all duration-500 shadow-lg shadow-gray-200">
                                    بحث سريع
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-wrap justify-center gap-2 md:gap-4 mt-12 px-2 md:px-4">
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
                                    <div className="absolute inset-0">
                                        <img
                                            src={course.image}
                                            alt={course.title}
                                            className="w-full h-full object-contain bg-gray-50/50 transition-transform duration-700 group-hover:scale-110"
                                        />
                                    </div>

                                    <div className="absolute top-4 left-4">
                                        <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-none text-[9px] font-black uppercase text-gray-900 tracking-tighter shadow-sm flex items-center gap-2 border border-gray-100">
                                            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse"></span>
                                            {course.price}
                                        </div>
                                    </div>
                                </div>

                                {/* Course Content */}
                                <div className="p-8 flex flex-col flex-grow relative">
                                    {/* Holographic Glow on Hover */}
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-700 pointer-events-none bg-gradient-to-br from-gold to-transparent"></div>

                                    <div className="relative mb-6">
                                        <h3 className={`text-lg font-black font-heading leading-tight min-h-[3rem] flex items-start gap-2 transition-all duration-300 ${course.id === 1 ? 'text-transparent bg-clip-text bg-gradient-to-r from-gold via-blue-600 to-gold' : 'text-gray-900 group-hover:text-gold'}`}>
                                            {course.title}
                                        </h3>
                                        <div className={`absolute -bottom-2 right-0 h-[3px] rounded-full bg-gradient-to-l from-gold to-transparent transition-all duration-700 ${course.id === 1 ? 'w-24' : 'w-0 group-hover:w-16'}`}></div>
                                    </div>

                                    <p className="text-gray-400 text-sm mb-10 leading-relaxed font-medium line-clamp-3 min-h-[4.5rem]">
                                        {course.desc}
                                    </p>

                                    <div className="mt-auto pt-6 border-t border-gray-50 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-none bg-gray-50 flex items-center justify-center">
                                                    <Users size={12} className="text-gray-400" />
                                                </div>
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">3.1k+ طالب</span>
                                            </div>
                                            <div className="text-[11px] font-black text-gold-hover border-b border-gold/30 pb-0.5">
                                                8 حصص - 1200 ج
                                            </div>
                                        </div>

                                        <a
                                            href={`https://wa.me/${adminPhone}?text=${encodeURIComponent(`السلام عليكم، أرغب في الاستفسار عن ${course.title}`)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center gap-2 group/btn bg-gray-900 text-white w-full py-3 rounded-none hover:bg-gold transition-all duration-300"
                                        >
                                            <span className="text-[11px] font-black uppercase tracking-widest">اشترك الآن</span>
                                            <ArrowLeft size={16} className="group-hover/btn:-translate-x-1 transition-transform" />
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


