import { Link } from 'react-router-dom';
import { Instagram, Phone, MapPin } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

export const PublicFooter = () => {
    const { adminPhone } = useSettings();

    return (
        <footer className="relative bg-indigo-950 text-white overflow-hidden pt-8 pb-6 md:pt-16 md:pb-10 transition-colors duration-500">
            {/* Decorative Overlays - Premium Royal Theme Shapes */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
                <div className="absolute -top-[50%] -right-[20%] w-[80%] h-[80%] bg-indigo-600 rounded-full blur-[120px]"></div>
                <div className="absolute -bottom-[50%] -left-[20%] w-[80%] h-[80%] bg-purple-600 rounded-full blur-[120px]"></div>
                
                {/* Geometric Floating Elements */}
                <div className="absolute top-10 left-10 w-20 h-20 border border-white/5 rotate-45"></div>
                <div className="absolute bottom-20 right-10 w-32 h-32 border border-white/5 -rotate-12"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/simple-dashed.png')] opacity-20"></div>
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
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
                        <p className="text-gray-400 text-sm leading-relaxed border-r-2 border-indigo-600/30 pr-4">
                            نصنع مستقبل أطفالكم من خلال تعليم متميز يجمع بين القيم الأصيلة والأساليب الحديثة. شريككم الموثوق في رحلة التعلم.
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <span className="w-8 h-0.5 bg-amber-500"></span>
                            روابط سريعة
                        </h3>
                        <ul className="space-y-3">
                            {[
                                { name: 'من نحن', path: '/about' },
                                { name: 'الدورات', path: '/courses' },
                                { name: 'اتصل بنا', path: '/contact' },
                            ].map((link, idx) => (
                                <li key={idx}>
                                    <Link
                                        to={link.path}
                                        className="text-gray-400 hover:text-amber-500 transition-colors flex items-center gap-2 text-sm"
                                    >
                                        <span className="text-amber-500">›</span> {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <span className="w-8 h-0.5 bg-amber-500"></span>
                            تواصل معنا
                        </h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 text-sm text-gray-400">
                                <MapPin className="w-5 h-5 text-amber-500 shrink-0" />
                                <span>بني سويف - مصر</span>
                            </li>
                            <li className="flex items-center gap-3 text-sm text-gray-400">
                                <Phone className="w-5 h-5 text-amber-500 shrink-0" />
                                <a
                                    href={`https://wa.me/${adminPhone.replace(/\D/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-amber-500 transition-colors"
                                    dir="ltr"
                                >
                                    +{adminPhone.replace(/\D/g, '')}
                                </a>
                            </li>
                            <li className="flex items-center gap-3 text-sm text-gray-400">
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

                    {/* App Download */}
                    <div>
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <span className="w-8 h-0.5 bg-amber-500"></span>
                            تحميل التطبيق
                        </h3>
                        <div className="flex flex-col gap-2 items-start">
                            <a
                                href="#"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block hover:opacity-90"
                            >
                                <img 
                                    src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" 
                                    alt="Get it on Google Play" 
                                    className="h-[52px] w-auto object-contain -mr-1"
                                    onError={(e) => { (e.target as HTMLImageElement).src = '/images/google-play.png' }}
                                />
                            </a>
                            <a
                                href="#"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block hover:opacity-90"
                            >
                                <img 
                                    src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" 
                                    alt="Download on the App Store" 
                                    className="h-[40px] w-auto object-contain"
                                    onError={(e) => { (e.target as HTMLImageElement).src = '/images/app-store.png' }}
                                />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom */}
                <div className="border-t border-white/10 pt-6 md:pt-8 flex flex-col md:flex-row items-center justify-between gap-2 md:gap-6">
                    <div className="text-center md:text-right">
                        <p className="text-gray-500 text-sm">
                            &copy; {new Date().getFullYear()} <span className="text-white font-medium">دارين السابعة</span>. جميع الحقوق محفوظة.
                        </p>
                    </div>

                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-900 to-slate-900 border border-white/10 shadow-lg shadow-black/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            <span className="text-[10px] font-bold text-gray-400 tracking-wide">تصميم وتطوير</span>
                            <span className="text-[10px] font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-amber-400">مستر احمد عبدالله</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 justify-center md:justify-end">
                        <Link to="/privacy-policy" className="text-gray-400 hover:text-amber-500 text-sm transition-colors">سياسة الخصوصية</Link>
                        <Link to="/refund-policy" className="text-gray-400 hover:text-amber-500 text-sm transition-colors">سياسة الاسترجاع والإلغاء</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};
