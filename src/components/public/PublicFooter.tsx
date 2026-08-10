import { Link, useNavigate } from 'react-router-dom';
import { Instagram, Phone, MapPin } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';
import { useAcademyName } from '../../context/AppContext';

export const PublicFooter = () => {
    const navigate = useNavigate();
    const academyName = useAcademyName();
    const adminPhone = useSettingsStore(s => s.adminPhone);

    return (
        <footer className="relative bg-surface dark:bg-surface text-main overflow-hidden pt-4 pb-6 md:pt-6 md:pb-6 transition-colors duration-500 min-h-[300px] border-t border-border dark:border-primary/30">
            <div className="absolute inset-0 pointer-events-none opacity-10 dark:opacity-[0.03]">
                <div className="absolute -top-[50%] -right-[20%] w-[80%] h-[80%] bg-primary-soft dark:bg-primary rounded-full blur-[120px]"></div>
                <div className="absolute -bottom-[50%] -left-[20%] w-[80%] h-[80%] bg-primary-soft dark:bg-primary rounded-full blur-[120px]"></div>

                <div className="absolute top-10 end-10 w-20 h-20 border border-border/20 dark:border-primary/20 rotate-45"></div>
                <div className="absolute bottom-20 start-10 w-32 h-32 border border-border/20 dark:border-primary/20 -rotate-12"></div>
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 lg:gap-6 mb-10">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-hover dark:from-primary dark:to-warning flex items-center justify-center shadow-lg rounded-none">
                                <span className="text-2xl font-black text-on-primary dark:text-on-primary">د</span>
                            </div>
                            <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-hover dark:from-primary dark:to-warning font-heading">
                                {academyName}
                            </span>
                        </div>
                        <p className="text-muted dark:text-muted text-sm lg:text-xs leading-relaxed border-s-2 border-border dark:border-primary/30 ps-4">
                            نصنع مستقبل أطفالكم من خلال تعليم متميز يجمع بين القيم الأصيلة والأساليب الحديثة. شريككم الموثوق في رحلة التعليم.
                        </p>
                    </div>

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
                                        className="text-muted dark:text-muted hover:text-accent dark:hover:text-[#D4AF37] transition-colors flex items-center gap-2 text-sm"
                                    >
                                        <span className="text-accent dark:text-primary">›</span> {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-main dark:text-main mb-4 flex items-center gap-2">
                            <span className="w-8 h-0.5 bg-accent dark:bg-primary"></span>
                            تواصل معنا
                        </h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 text-sm text-muted dark:text-muted">
                                <MapPin className="w-5 h-5 text-accent dark:text-primary shrink-0" />
                                <span>بني سويف - مصر</span>
                            </li>
                            <li className="flex items-center gap-3 text-sm text-muted dark:text-muted">
                                <Phone className="w-5 h-5 text-accent dark:text-primary shrink-0" />
                                <a
                                    href={`https://wa.me/${adminPhone?.replace(/\D/g, '') || '965000000000'}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-accent dark:hover:text-[#D4AF37] transition-colors"
                                    dir="ltr"
                                >
                                    +{adminPhone?.replace(/\D/g, '') || '965000000000'}
                                </a>
                            </li>
                            <li className="flex items-center gap-3 text-sm text-muted dark:text-muted">
                                <Instagram className="w-5 h-5 text-accent dark:text-primary shrink-0" />
                                <a
                                    href="https://www.instagram.com/daren_school/?hl=ar"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-accent dark:hover:text-[#D4AF37] transition-colors"
                                >
                                    @daren_school
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-main dark:text-main mb-4 flex items-center gap-2">
                            <span className="w-8 h-0.5 bg-accent dark:bg-primary"></span>
                            انضم الينا الان
                        </h3>
                        <div className="space-y-3">
                            <Link
                                to="/jobs"
                                className="block w-full text-center bg-primary-soft dark:bg-primary/10 border border-border dark:border-primary/30 px-4 py-3 text-sm text-primary dark:text-primary hover:bg-primary-light dark:hover:bg-[#D4AF37]/20 hover:border-accent dark:hover:border-[#D4AF37] transition-all"
                            >
                                التقديم للوظائف
                            </Link>
                            <Link
                                to="/terms-of-work"
                                className="block w-full text-center bg-gradient-to-r from-accent to-accent-hover dark:from-primary dark:to-warning text-on-accent dark:text-on-primary font-black py-3 text-sm hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                            >
                                قوانين العمل
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="border-t border-border dark:border-primary/20 pt-5 md:pt-6 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
                    <div className="text-center md:text-start">
                        <p className="text-muted dark:text-muted text-sm">
                            &copy; {new Date().getFullYear()} <span className="text-main dark:text-main font-medium">{academyName}</span>. جميع الحقوق محفوظة.
                        </p>
                    </div>

                    <div className="text-center">
                        <div onClick={() => navigate('/a.abdullah')} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate('/a.abdullah'); } }} className="relative inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-primary-hover dark:from-primary dark:to-warning border border-primary-active dark:border-primary overflow-hidden group cursor-pointer">
                            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-on-primary/10 dark:via-black/10 to-transparent animate-shine-slow z-0 pointer-events-none"></div>

                            <span className="relative z-10 w-1.5 h-1.5 bg-accent dark:bg-black animate-pulse"></span>
                            <span className="relative z-10 text-micro font-bold text-on-primary/80 dark:text-on-primary/80 tracking-wide font-heading">تصميم وتطوير</span>
                            <span className="relative z-10 text-micro font-black text-on-primary dark:text-on-primary font-heading">مستر احمد عبدالله</span>
                            <span className="relative z-10 w-1.5 h-1.5 bg-accent dark:bg-black animate-pulse"></span>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 justify-center md:justify-end">
                        <Link to="/privacy-policy" className="text-muted dark:text-muted hover:text-accent dark:hover:text-[#D4AF37] text-sm transition-colors">سياسة الخصوصية</Link>
                        <Link to="/refund-policy" className="text-muted dark:text-muted hover:text-accent dark:hover:text-[#D4AF37] text-sm transition-colors">سياسة الاسترجاع والإلغاء</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};