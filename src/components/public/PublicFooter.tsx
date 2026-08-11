import { Link, useNavigate } from 'react-router-dom';
import { Instagram, Phone, MapPin } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';
import { useAcademyName } from '../../context/AppContext';

export const PublicFooter = () => {
    const navigate = useNavigate();
    const academyName = useAcademyName();
    const adminPhone = useSettingsStore(s => s.adminPhone);

    return (
        <footer className="relative bg-surface dark:bg-card text-main overflow-hidden pt-4 pb-6 md:pt-6 md:pb-6 transition-colors duration-500 min-h-[300px] border-t border-border dark:border-primary/20">
            {/* Decorative blurs — dark: gold glow */}
            <div className="absolute inset-0 pointer-events-none opacity-10 dark:opacity-[0.04]">
                <div className="absolute -top-[50%] -right-[20%] w-[80%] h-[80%] bg-primary-soft dark:bg-primary rounded-full blur-[120px]"></div>
                <div className="absolute -bottom-[50%] -left-[20%] w-[80%] h-[80%] bg-primary-soft dark:bg-primary rounded-full blur-[120px]"></div>
                <div className="absolute top-10 end-10 w-20 h-20 border border-border/20 dark:border-primary/10 rotate-45"></div>
                <div className="absolute bottom-20 start-10 w-32 h-32 border border-border/20 dark:border-primary/10 -rotate-12"></div>
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 lg:gap-6 mb-10">
                    {/* Brand + description */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-hover dark:from-primary dark:to-primary flex items-center justify-center shadow-lg rounded-none">
                                <span className="text-2xl font-black text-on-primary dark:text-card">د</span>
                            </div>
                            <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-hover dark:from-primary dark:to-primary font-heading">
                                {academyName}
                            </span>
                        </div>
                        <p className="text-muted dark:text-main/50 text-sm lg:text-xs leading-relaxed border-s-2 border-border dark:border-primary/30 ps-4">
                            نصنع مستقبل أطفالكم من خلال تعليم متميز يجمع بين القيم الأصيلة والأساليب الحديثة. شريككم الموثوق في رحلة التعليم.
                        </p>
                    </div>

                    {/* Quick links */}
                    <div>
                        <h3 className="text-lg font-bold text-main dark:text-main mb-4 flex items-center gap-2">
                            <span className="w-8 h-0.5 bg-accent dark:bg-primary"></span>
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
                                        className="text-muted dark:text-main/60 hover:text-accent dark:hover:text-primary transition-colors flex items-center gap-2 text-sm"
                                    >
                                        <span className="text-accent dark:text-primary">›</span> {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-lg font-bold text-main dark:text-main mb-4 flex items-center gap-2">
                            <span className="w-8 h-0.5 bg-accent dark:bg-primary"></span>
                            تواصل معنا
                        </h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 text-sm text-muted dark:text-main/60">
                                <MapPin className="w-5 h-5 text-accent dark:text-primary shrink-0" />
                                <span>بني سويف - مصر</span>
                            </li>
                            <li className="flex items-center gap-3 text-sm text-muted dark:text-main/60">
                                <Phone className="w-5 h-5 text-accent dark:text-primary shrink-0" />
                                <a
                                    href={`https://wa.me/${adminPhone?.replace(/\D/g, '') || '965000000000'}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-accent dark:hover:text-primary transition-colors"
                                    dir="ltr"
                                >
                                    +{adminPhone?.replace(/\D/g, '') || '965000000000'}
                                </a>
                            </li>
                            <li className="flex items-center gap-3 text-sm text-muted dark:text-main/60">
                                <Instagram className="w-5 h-5 text-accent dark:text-primary shrink-0" />
                                <a
                                    href="https://www.instagram.com/daren_school/?hl=ar"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-accent dark:hover:text-primary transition-colors"
                                >
                                    @daren_school
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Join us */}
                    <div>
                        <h3 className="text-lg font-bold text-main dark:text-main mb-4 flex items-center gap-2">
                            <span className="w-8 h-0.5 bg-accent dark:bg-primary"></span>
                            انضم الينا الان
                        </h3>
                        <div className="space-y-3">
                            <Link
                                to="/jobs"
                                className="block w-full text-center bg-primary-soft dark:bg-white/5 border border-border dark:border-primary/20 px-4 py-3 text-sm text-primary dark:text-primary hover:bg-primary-light dark:hover:bg-primary/10 hover:border-accent dark:hover:border-primary/40 transition-all"
                            >
                                التقديم للوظائف
                            </Link>
                            <Link
                                to="/terms-of-work"
                                className="block w-full text-center bg-gradient-to-r from-accent to-accent-hover dark:from-primary dark:to-primary text-on-accent dark:text-card font-black py-3 text-sm hover:shadow-lg dark:shadow-primary/20 transition-all transform hover:-translate-y-0.5"
                            >
                                قوانين العمل
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="border-t border-border dark:border-primary/15 pt-5 md:pt-6 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
                    <div className="text-center md:text-start">
                        <p className="text-muted dark:text-main/40 text-sm">
                            &copy; {new Date().getFullYear()} <span className="text-main dark:text-main font-medium">{academyName}</span>. جميع الحقوق محفوظة.
                        </p>
                    </div>

                    <div className="text-center">
                        <div onClick={() => navigate('/a.abdullah')} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate('/a.abdullah'); } }} className="relative inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-primary-hover dark:from-primary dark:to-primary border border-primary-active dark:border-primary/30 overflow-hidden group cursor-pointer">
                            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-on-primary/10 dark:via-white/10 to-transparent animate-shine-slow z-0 pointer-events-none"></div>
                            <span className="relative z-10 w-1.5 h-1.5 bg-accent dark:bg-card animate-pulse"></span>
                            <span className="relative z-10 text-micro font-bold text-on-primary/80 dark:text-card/70 tracking-wide font-heading">تصميم وتطوير</span>
                            <span className="relative z-10 text-micro font-black text-on-primary dark:text-card font-heading">مستر احمد عبدالله</span>
                            <span className="relative z-10 w-1.5 h-1.5 bg-accent dark:bg-card animate-pulse"></span>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 justify-center md:justify-end">
                        <Link to="/privacy-policy" className="text-muted dark:text-main/40 hover:text-accent dark:hover:text-primary text-sm transition-colors">سياسة الخصوصية</Link>
                        <Link to="/refund-policy" className="text-muted dark:text-main/40 hover:text-accent dark:hover:text-primary text-sm transition-colors">سياسة الاسترجاع والإلغاء</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};
