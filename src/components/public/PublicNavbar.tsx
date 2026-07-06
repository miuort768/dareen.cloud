import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sparkles, ChevronDown, LogOut, GraduationCap, User } from 'lucide-react';
import { useIsAuthenticated, useCurrentUser, useLogout } from '../../context/AppContext';
import { confirm } from '../../lib/confirmDialog';
import { NotificationDropdown } from '../ui/NotificationDropdown';
import { cn } from '../../lib/utils';

export const PublicNavbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const isAuthenticated = useIsAuthenticated();
    const currentUser = useCurrentUser();
    const logout = useLogout();
    const location = useLocation();

    useEffect(() => {
        const handleResize = () => setIsDesktop(window.innerWidth >= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const navItems = [
        { name: 'الرئيسية', path: '/' },
        { name: 'الدورات', path: '/courses' },
        { name: 'المكتبة', path: '/books' },
        { name: 'من نحن', path: '/about' },
        { name: 'اتصل بنا', path: '/contact' },
    ];

    const isActive = (path: string) => location.pathname === path;

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDropdownOpen]);

    return (
        <header className="fixed top-2 md:top-4 left-0 right-0 z-50 mx-auto w-[92%] md:max-w-[90%] transition-all duration-500">
            <nav className="bg-white/90 dark:bg-card/90 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-full md:rounded-[2rem] border border-white/60 dark:border-border/60 px-4 md:px-6 py-2 md:py-3 relative">
                <div className="flex justify-between items-center h-12 md:h-14">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 pr-2 group">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-primary-light rounded-xl blur-md opacity-20 group-hover:opacity-40 transition-opacity"></div>
                             <div className="relative w-11 h-11 overflow-hidden bg-gradient-to-tr from-[var(--bg-primary)] via-[var(--bg-primary)] to-[var(--bg-primary)] rounded-xl flex items-center justify-center text-on-primary shadow-lg group-hover:rotate-[10deg] transition-all duration-500 border border-white/20">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent w-[150%] h-full animate-shine pointer-events-none z-0"></div>
                                <GraduationCap size={24} className="relative z-10" />
                            </div>
                            <Sparkles size={12} className="absolute -top-[2px] -right-[2px] text-warning fill-warning animate-pulse z-20 group-hover:scale-110 transition-transform" />
                        </div>
                        <div className={cn(
                            "flex-col items-center pt-0.5 text-center",
                            isAuthenticated ? "hidden md:flex" : "flex"
                        )}>
                            <p className="site-title text-[13px] md:text-[17px] font-black leading-tight bg-clip-text text-transparent bg-gradient-to-r from-[var(--bg-primary)] via-[var(--bg-primary)] to-[var(--bg-primary)]">
                                دارين السابعة
                            </p>
                            <span className="hidden md:inline-flex items-center gap-1.5 text-[11px] text-primary dark:text-primary font-bold mt-0.5 italic">
                                <svg viewBox="0 0 40 20" className="w-5 h-3.5 text-primary dark:text-primary" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M2 10 C10 2 18 2 20 10 C22 18 30 18 38 10" />
                                    <circle cx="20" cy="10" r="1.5" fill="currentColor" stroke="none" />
                                </svg>
                                أفضل مدرسة افتراضية
                                <svg viewBox="0 0 40 20" className="w-5 h-3.5 text-primary dark:text-primary" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M2 10 C10 18 18 18 20 10 C22 2 30 2 38 10" />
                                    <circle cx="20" cy="10" r="1.5" fill="currentColor" stroke="none" />
                                </svg>
                            </span>
                            <span className="md:hidden text-[9px] text-primary dark:text-primary font-bold mt-0.5 bg-primary-soft/80 dark:bg-primary/40 px-2 py-0.5 rounded-md italic">
                                أفضل مدرسة افتراضية
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-2 bg-primary-soft/50 dark:bg-primary/50 backdrop-blur-md px-2 py-1.5 rounded-full border border-primary dark:border-border shadow-sm">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`px-6 py-2 rounded-full font-bold text-sm transition-all duration-500 ${isActive(item.path)
                                    ? 'bg-gradient-to-r from-[var(--bg-primary)] to-[var(--bg-primary)] text-on-primary shadow-lg shadow-primary/30 -translate-y-0.5'
                                    : 'text-muted dark:text-on-primary/70 hover:bg-primary-soft dark:hover:bg-primary hover:text-primary'
                                    }`}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>

                    {/* Right Side: Auth & Notifications */}
                    <div className="flex items-center gap-2 md:gap-4">
                        {/* Dark Mode Toggle Removed from here */}


                        {isAuthenticated && isDesktop && (
                            <div className="border-l border-border dark:border-border pl-4 h-8 items-center flex">
                                <NotificationDropdown />
                            </div>
                        )}

                        {isAuthenticated ? (
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="flex items-center gap-3 text-main dark:text-dim hover:text-primary transition-all px-2 md:px-4 py-2 group"
                                    aria-label={isDropdownOpen ? 'إغلاق القائمة' : 'فتح قائمة المستخدم'}
                                >
                                    <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-primary dark:border-primary shadow-sm group-hover:border-primary transition-all">
                                        {currentUser?.avatar ? (
                                            <img src={currentUser.avatar} alt={currentUser.name} width="32" height="32" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-primary-soft dark:bg-primary flex items-center justify-center">
                                                <User className="w-4 h-4 text-primary dark:text-primary" />
                                            </div>
                                        )}
                                    </div>
                                    <span className="font-bold text-xs md:text-sm">{currentUser?.name.split(' ')[0]}</span>
                                    <ChevronDown className={`w-3 h-3 md:w-4 md:h-4 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>
                                <div className={`absolute left-0 mt-4 w-56 bg-white dark:bg-card rounded-2xl shadow-xl border border-border dark:border-border overflow-hidden z-50 transition-all duration-300 ${isDropdownOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`}>
                                    <div className="p-4 border-b border-border dark:border-border bg-background/50 dark:bg-background/50">
                                        <p className="text-sm font-bold text-main dark:text-on-primary">{currentUser?.name}</p>
                                        <p className="text-xs text-muted dark:text-muted">{currentUser?.username}</p>
                                    </div>
                                    <Link
                                        to="/dashboard"
                                        onClick={() => setIsDropdownOpen(false)}
                                        className="flex items-center gap-2 px-4 py-3 text-sm text-main dark:text-on-primary hover:bg-primary-soft dark:hover:bg-primary hover:text-primary transition-colors"
                                    >
                                        <Sparkles className="w-5 h-5 text-primary" />
                                        لوحة التحكم
                                    </Link>
                                    <button
                                        onClick={async () => { if (!await confirm('هل أنت متأكد من تسجيل الخروج؟')) return; logout(); setIsDropdownOpen(false); }}
                                        className="flex w-full items-center gap-2 text-right px-4 py-3 text-sm text-error hover:bg-error-light dark:hover:bg-error/30 transition-colors"
                                        aria-label="تسجيل الخروج"
                                    >
                                        <LogOut className="w-5 h-5" />
                                        تسجيل الخروج
                                    </button>
                                </div>
                            </div>
                        ) : (
                                <Link
                                    to="/login"
                                    className="hidden md:flex bg-gradient-to-r from-[var(--bg-primary)] to-[var(--bg-primary)] text-on-primary px-5 md:px-8 py-2 md:py-2.5 rounded-full hover:shadow-lg hover:scale-105 transition-all font-bold text-xs md:text-sm"
                                >
                                تسجيل الدخول
                            </Link>
                        )}

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2 text-primary hover:bg-primary-soft rounded-full transition-all active:scale-90"
                            aria-label={isMenuOpen ? 'إغلاق القائمة الجانبية' : 'فتح القائمة الجانبية'}
                        >
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu - Floating Card Style */}
                    <div className={`
                    absolute top-full left-0 right-0 mt-3 p-4 bg-white/95 dark:bg-card/95 backdrop-blur-2xl rounded-[2rem] border border-white/60 dark:border-border/60 shadow-2xl
                    transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] md:hidden
                    ${isMenuOpen ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-4 invisible pointer-events-none'}
                `}>
                    <div className="space-y-2">
                        {navItems.filter(item => !isActive(item.path)).map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsMenuOpen(false)}
                                className={`flex items-center gap-3 px-6 py-4 rounded-full font-bold transition-all ${isActive(item.path)
                                    ? 'bg-primary text-on-primary shadow-lg'
                                    : 'text-main hover:bg-surface'
                                    }`}
                            >
                                <span className={`w-1.5 h-1.5 rounded-full ${isActive(item.path) ? 'bg-white' : 'bg-primary'}`}></span>
                                {item.name}
                            </Link>
                        ))}

                        <div className="pt-2 mt-2 border-t border-border">
                            {isAuthenticated ? (
                                <>
                                    <Link
                                        to="/dashboard"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="flex items-center gap-3 px-6 py-4 rounded-full font-bold text-main hover:bg-surface"
                                    >
                                        <Sparkles className="w-5 h-5 text-primary" />
                                        لوحة التحكم
                                    </Link>
                                    <button
                                        onClick={async () => { if (!await confirm('هل أنت متأكد من تسجيل الخروج؟')) return; logout(); setIsMenuOpen(false); }}
                                        className="flex w-full items-center gap-3 px-6 py-4 rounded-full font-bold text-error hover:bg-error-light"
                                    >
                                        <LogOut size={20} className="rotate-180" />
                                        تسجيل الخروج
                                    </button>
                                </>
                            ) : (
                                <Link
                                    to="/login"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center justify-center bg-gradient-to-r from-[var(--bg-primary)] to-[var(--bg-primary)] text-on-primary py-4 rounded-full font-bold shadow-lg mt-2 active:scale-[0.98] transition-transform"
                                >
                                    تسجيل الدخول
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    );
};
