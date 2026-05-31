import { Link } from 'react-router-dom';
import { Instagram, Phone, MapPin } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';

export const PublicFooter = () => {
    const { adminPhone } = useSettingsStore();

    return (
        <footer className="relative bg-indigo-950 text-white overflow-hidden pt-8 pb-6 md:pt-10 md:pb-6 transition-colors duration-500 min-h-[300px]">
            {/* Decorative Overlays - Premium Royal Theme Shapes */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
                <div className="absolute -top-[50%] -right-[20%] w-[80%] h-[80%] bg-indigo-600 rounded-full blur-[120px]"></div>
                <div className="absolute -bottom-[50%] -left-[20%] w-[80%] h-[80%] bg-purple-600 rounded-full blur-[120px]"></div>
                
                {/* Geometric Floating Elements */}
                <div className="absolute top-10 left-10 w-20 h-20 border border-white/5 rotate-45"></div>
                <div className="absolute bottom-20 right-10 w-32 h-32 border border-white/5 -rotate-12"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.03) 10px, rgba(255,255,255,0.03) 20px)' }}></div>
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 lg:gap-6 mb-10">
                    {/* Brand */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-indigo-900 flex items-center justify-center text-white shadow-lg rounded-none">
                                <span className="text-2xl font-black">د</span>
                            </div>
                            <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300 font-heading">
                                دارين السابعة
                            </span>
                        </div>
                        <p className="text-gray-400 dark:text-gray-300 text-sm lg:text-xs leading-relaxed border-r-2 border-indigo-600/30 pr-4">
                            نصنع مستقبل أطفالكم من خلال تعليم متميز يجمع بين القيم الأصيلة والأساليب الحديثة. شريككم الموثوق في رحلة بناء أطباء ومهندسين وعباقرة المستقبل.
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <span className="w-8 h-0.5 bg-amber-500"></span>
                            روابط سريعة
                        </h3>
                        <ul className="space-y-3">
                            {[
                                { name: 'الدورات', path: '/courses' },
                                { name: 'من نحن', path: '/about' },
                                { name: 'اتصل بنا', path: '/contact' },
                            ].map((link, idx) => (
                                <li key={idx}>
                                    <Link
                                        to={link.path}
                                        className="text-gray-400 hover:text-amber-500 dark:text-gray-300 dark:hover:text-amber-400 transition-colors flex items-center gap-2 text-sm"
                                    >
                                        <span className="text-amber-500">›</span> {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>



                    {/* Contact */}
                    <div>
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <span className="w-8 h-0.5 bg-amber-500"></span>
                            تواصل معنا
                        </h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 text-sm text-gray-400 dark:text-gray-300">
                                <MapPin className="w-5 h-5 text-amber-500 shrink-0" />
                                <span>بني سويف - مصر</span>
                            </li>
                            <li className="flex items-center gap-3 text-sm text-gray-400 dark:text-gray-300">
                                <Phone className="w-5 h-5 text-amber-500 shrink-0" />
                                <a
                                    href={`https://wa.me/${adminPhone?.replace(/\D/g, '') || '965000000000'}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-amber-500 transition-colors"
                                    dir="ltr"
                                >
                                    +{adminPhone?.replace(/\D/g, '') || '965000000000'}
                                </a>
                            </li>
                            <li className="flex items-center gap-3 text-sm text-gray-400 dark:text-gray-300">
                                <Instagram className="w-5 h-5 text-amber-500 shrink-0" />
                                <a
                                    href="https://www.instagram.com/daren_school/?hl=ar"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-amber-500 transition-colors"
                                >
                                    @daren_school
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <span className="w-8 h-0.5 bg-amber-500"></span>
                            انضم الينا الان
                        </h3>
                        <div className="space-y-3">
                            <Link
                                to="/jobs"
                                className="block w-full text-center bg-white/5 border border-white/10 px-4 py-3 text-sm text-white hover:bg-white/10 hover:border-amber-500 transition-all"
                            >
                                التقديم للوظائف
                            </Link>
                            <Link
                                to="/terms-of-work"
                                className="block w-full text-center bg-gradient-to-r from-amber-500 to-amber-600 text-indigo-950 font-black py-3 text-sm hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                            >
                                قوانين العمل
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Bottom */}
                <div className="border-t border-white/10 pt-5 md:pt-6 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
                    <div className="text-center md:text-right">
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            &copy; {new Date().getFullYear()} <span className="text-white font-medium">دارين السابعة</span>. جميع الحقوق محفوظة.
                        </p>
                    </div>

                    <div className="text-center">
                        <div className="relative inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-900 to-slate-900 border border-white/10 overflow-hidden group cursor-default">
                            {/* Continuous Shine Effect */}
                            <div className="absolute top-0 -left-[100%] w-[100%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shine-slow z-0"></div>
                            
                            <span className="relative z-10 w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                            <span className="relative z-10 text-[10px] font-bold text-gray-300 dark:text-gray-400 tracking-wide">تصميم وتطوير</span>
                            <span className="relative z-10 text-[10px] font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-amber-300 dark:from-indigo-400 dark:to-amber-400 group-hover:from-indigo-200 dark:group-hover:from-indigo-300 group-hover:to-amber-200 dark:group-hover:to-amber-300 transition-colors">مستر احمد عبدالله</span>
                            <span className="relative z-10 w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 justify-center md:justify-end">
                        <Link to="/privacy-policy" className="text-gray-400 hover:text-amber-500 dark:text-gray-300 dark:hover:text-amber-400 text-sm transition-colors">سياسة الخصوصية</Link>
                        <Link to="/refund-policy" className="text-gray-400 hover:text-amber-500 dark:text-gray-300 dark:hover:text-amber-400 text-sm transition-colors">سياسة الاسترجاع والإلغاء</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};
