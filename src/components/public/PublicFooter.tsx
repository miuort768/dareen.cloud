import { Link } from 'react-router-dom';
import { Instagram, Phone, MapPin } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

export const PublicFooter = () => {
    const { adminPhone } = useSettings();

    return (
        <footer className="relative bg-gray-900 text-white overflow-hidden pt-8 pb-6 md:pt-16 md:pb-10">
            {/* Decorative Overlays */}
            <div className="absolute inset-0 pointer-events-none opacity-10">
                <div className="absolute -top-[50%] -right-[20%] w-[80%] h-[80%] bg-gold rounded-full blur-[100px]"></div>
                <div className="absolute -bottom-[50%] -left-[20%] w-[80%] h-[80%] bg-gold-hover rounded-full blur-[100px]"></div>
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
                    {/* Brand */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-gold to-gold-hover flex items-center justify-center text-white shadow-lg">
                                <span className="text-2xl font-bold">د</span>
                            </div>
                            <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300 font-heading">
                                معهد دارين
                            </span>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed border-r-2 border-gold/30 pr-4">
                            نصنع مستقبل أطفالكم من خلال تعليم متميز يجمع بين القيم الأصيلة والأساليب الحديثة. شريككم الموثوق في رحلة التعلم.
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <span className="w-8 h-0.5 bg-gold"></span>
                            روابط سريعة
                        </h3>
                        <ul className="space-y-3">
                            {[
                                { name: 'الرئيسية', path: '/' },
                                { name: 'من نحن', path: '/about' },
                                { name: 'الدورات', path: '/courses' },
                                { name: 'اتصل بنا', path: '/contact' },
                            ].map((link, idx) => (
                                <li key={idx}>
                                    <Link
                                        to={link.path}
                                        className="text-gray-400 hover:text-gold hover:translate-x-[-5px] transition-all flex items-center gap-2 text-sm"
                                    >
                                        <span className="text-gold">›</span> {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <span className="w-8 h-0.5 bg-gold"></span>
                            تواصل معنا
                        </h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 text-sm text-gray-400">
                                <MapPin className="w-5 h-5 text-gold shrink-0" />
                                <span>بني سويف - مصر</span>
                            </li>
                            <li className="flex items-center gap-3 text-sm text-gray-400">
                                <Phone className="w-5 h-5 text-gold shrink-0" />
                                <a
                                    href={`https://wa.me/2${adminPhone}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-gold transition-colors"
                                    dir="ltr"
                                >
                                    +{adminPhone}
                                </a>
                            </li>
                            <li className="flex items-center gap-3 text-sm text-gray-400">
                                <Instagram className="w-5 h-5 text-gold shrink-0" />
                                <a
                                    href="https://www.instagram.com/daren_school/?hl=ar"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-gold transition-colors"
                                >
                                    @daren_school
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <span className="w-8 h-0.5 bg-gold"></span>
                            عروض المنصة
                        </h3>
                        <div className="space-y-3">
                            <a
                                href={`https://wa.me/${adminPhone}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full text-center bg-white/5 border border-white/10 px-4 py-3 text-sm text-white hover:bg-white/10 hover:border-gold transition-all"
                            >
                                تواصل معنا
                            </a>
                            <a
                                href={`https://wa.me/${adminPhone}?text=${encodeURIComponent('السلام عليكم، أرغب في الاشتراك في منصة دارين لتعليم و التدريب')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full text-center bg-gradient-to-r from-gold to-gold-hover text-white font-bold py-3 text-sm hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                            >
                                اشترك الآن
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom */}
                <div className="border-t border-white/10 pt-6 md:pt-8 flex flex-col md:flex-row items-center justify-between gap-2 md:gap-6">
                    <div className="text-center md:text-right">
                        <p className="text-gray-500 text-sm">
                            &copy; {new Date().getFullYear()} <span className="text-white font-medium">معهد دارين</span>. جميع الحقوق محفوظة.
                        </p>
                    </div>

                    <div className="text-center">
                        <p className="text-gray-500 text-xs font-medium tracking-wide">
                            تصميم وتطوير <span className="text-gold">مستر احمد عبدالله</span>
                        </p>
                    </div>

                    <div className="flex items-center gap-6 justify-center md:justify-end">
                        <Link to="/privacy-policy" className="text-gray-500 hover:text-gold text-sm transition-colors">سياسة الخصوصية</Link>
                        <Link to="/terms-of-service" className="text-gray-500 hover:text-gold text-sm transition-colors">الشروط والأحكام</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};
