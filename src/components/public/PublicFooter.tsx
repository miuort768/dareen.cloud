import { Link, useNavigate } from 'react-router-dom';
import { Instagram, Phone, MapPin } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';

export const PublicFooter = () => {
    const navigate = useNavigate();
    const { adminPhone } = useSettingsStore();

    return (
        <footer className="relative bg-surface dark:bg-card text-main overflow-hidden pt-8 pb-6 md:pt-10 md:pb-6 transition-colors duration-500 min-h-[300px] border-t border-border">
            <div className="absolute inset-0 pointer-events-none opacity-10">
                <div className="absolute -top-[50%] -right-[20%] w-[80%] h-[80%] bg-primary-soft rounded-full blur-[120px]"></div>
                <div className="absolute -bottom-[50%] -left-[20%] w-[80%] h-[80%] bg-primary-soft rounded-full blur-[120px]"></div>

                <div className="absolute top-10 left-10 w-20 h-20 border border-border/20 rotate-45"></div>
                <div className="absolute bottom-20 right-10 w-32 h-32 border border-border/20 -rotate-12"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(99,102,241,0.06) 10px, rgba(99,102,241,0.06) 20px)' }}></div>
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 lg:gap-6 mb-10">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center shadow-lg rounded-none">
                                <span className="text-2xl font-black text-on-primary">د</span>
                            </div>
                            <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-hover font-heading">
                                دارين السابعة
                            </span>
                        </div>
                        <p className="text-muted text-sm lg:text-xs leading-relaxed border-e-2 border-border pr-4">
                            نصنع مستقبل أطفالكم من خلال تعليم متميز يجمع بين القيم الأصيلة والأساليب الحديثة. شريككم الموثوق في رحلة التعليم.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-main mb-4 flex items-center gap-2">
                            <span className="w-8 h-0.5 bg-accent"></span>
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
                                        className="text-muted hover:text-accent transition-colors flex items-center gap-2 text-sm"
                                    >
                                        <span className="text-accent">›</span> {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-main mb-4 flex items-center gap-2">
                            <span className="w-8 h-0.5 bg-accent"></span>
                            تواصل معنا
                        </h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 text-sm text-muted">
                                <MapPin className="w-5 h-5 text-accent shrink-0" />
                                <span>بني سويف - مصر</span>
                            </li>
                            <li className="flex items-center gap-3 text-sm text-muted">
                                <Phone className="w-5 h-5 text-accent shrink-0" />
                                <a
                                    href={`https://wa.me/${adminPhone?.replace(/\D/g, '') || '965000000000'}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-accent transition-colors"
                                    dir="ltr"
                                >
                                    +{adminPhone?.replace(/\D/g, '') || '965000000000'}
                                </a>
                            </li>
                            <li className="flex items-center gap-3 text-sm text-muted">
                                <Instagram className="w-5 h-5 text-accent shrink-0" />
                                <a
                                    href="https://www.instagram.com/daren_school/?hl=ar"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-accent transition-colors"
                                >
                                    @daren_school
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-main mb-4 flex items-center gap-2">
                            <span className="w-8 h-0.5 bg-accent"></span>
                            انضم الينا الان
                        </h3>
                        <div className="space-y-3">
                            <Link
                                to="/jobs"
                                className="block w-full text-center bg-primary-soft dark:bg-primary/30 border border-border px-4 py-3 text-sm text-primary hover:bg-primary-light dark:hover:bg-primary/50 hover:border-accent transition-all"
                            >
                                التقديم للوظائف
                            </Link>
                            <Link
                                to="/terms-of-work"
                                className="block w-full text-center bg-gradient-to-r from-accent to-accent-hover text-on-accent font-black py-3 text-sm hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                            >
                                قوانين العمل
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="border-t border-border pt-5 md:pt-6 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
                    <div className="text-center md:text-right">
                        <p className="text-muted text-sm">
                            &copy; {new Date().getFullYear()} <span className="text-main font-medium">دارين السابعة</span>. جميع الحقوق محفوظة.
                        </p>
                    </div>

                    <div className="text-center">
                        <div onClick={() => navigate('/developer')} className="relative inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-primary-hover dark:from-primary dark:to-primary-hover border border-primary-active overflow-hidden group cursor-pointer rounded-xl">
                            <div className="absolute top-0 -left-[100%] w-[100%] h-full bg-gradient-to-r from-transparent via-on-primary/10 to-transparent animate-shine-slow z-0"></div>

                            <span className="relative z-10 w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span>
                            <span className="relative z-10 text-micro font-bold text-on-primary/80 tracking-wide font-heading">تصميم وتطوير</span>
                            <span className="relative z-10 text-micro font-black text-on-primary font-heading">مستر احمد عبدالله</span>
                            <span className="relative z-10 w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 justify-center md:justify-end">
                        <Link to="/privacy-policy" className="text-muted hover:text-accent text-sm transition-colors">سياسة الخصوصية</Link>
                        <Link to="/refund-policy" className="text-muted hover:text-accent text-sm transition-colors">سياسة الاسترجاع والإلغاء</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};
