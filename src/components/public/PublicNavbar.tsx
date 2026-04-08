import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sparkles, ChevronDown, LogOut, GraduationCap, Moon, Sun } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useDarkMode } from '../../hooks/useDarkMode';
import { NotificationDropdown } from '../ui/NotificationDropdown';

export const PublicNavbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { isAuthenticated, currentUser, logout } = useApp();
    const [theme, setTheme] = useDarkMode();
    const location = useLocation();

    const navItems = [
        { name: 'الرئيسية', path: '/' },
        { name: 'الدورات', path: '/courses' },
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
            <nav className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-full md:rounded-[2rem] border border-white/60 dark:border-slate-800/60 px-4 md:px-6 py-2 md:py-3 relative">
                <div className="flex justify-between items-center h-12 md:h-14">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 pr-2 group">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-red-300 rounded-xl blur-md opacity-20 group-hover:opacity-40 transition-opacity"></div>
                            <div className="relative w-11 h-11 overflow-hidden bg-gradient-to-tr from-red-600 via-red-500 to-red-900 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:rotate-[10deg] transition-all duration-500 border border-white/20">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent w-[150%] h-full animate-shine pointer-events-none z-0"></div>
                                <GraduationCap size={22} strokeWidth={2.5} className="relative z-10" />
                            </div>
                            <Sparkles size={12} className="absolute -top-[2px] -right-[2px] text-green-600 fill-green-600 animate-pulse z-20 group-hover:scale-110 transition-transform" />
                        </div>
                        <div className="flex flex-col items-center pt-0.5 text-center">
                            <h1 className="site-title text-[15px] md:text-xl font-black leading-tight bg-clip-text text-transparent bg-gradient-to-r from-red-800 via-red-600 to-red-900 tracking-tighter">
                                معهد دارين
                            </h1>
                            <span className="text-[10px] md:text-[12px] text-red-500/90 dark:text-red-400 font-bold mt-1.5 bg-red-50/80 dark:bg-red-950/40 px-2 py-0.5 rounded-md" style={{ fontFamily: '"Aref Ruqaa", serif' }}>
                                أفضل مدرسة افتراضية
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-2 bg-green-100/50 dark:bg-slate-800/50 backdrop-blur-md px-2 py-1.5 rounded-full border border-green-200 dark:border-slate-700 shadow-sm">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`px-6 py-2 rounded-full font-bold text-sm transition-all duration-500 ${isActive(item.path)
                                    ? 'bg-gradient-to-r from-red-500 to-red-400 text-white shadow-lg shadow-red-400/30 -translate-y-0.5'
                                    : 'text-gray-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:text-red-500'
                                    }`}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>

                    {/* Right Side: Auth & Notifications */}
                    <div className="flex items-center gap-2 md:gap-4">
                        {/* Dark Mode Toggle */}
                        <button
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            className="p-2.5 rounded-full bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all border border-gray-100 dark:border-slate-700 shadow-sm"
                            title={theme === 'dark' ? 'الوضع النهاري' : 'الوضع الليلي'}
                        >
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        {isAuthenticated && (
                            <div className="hidden md:block border-l border-gray-100 dark:border-slate-800 pl-4 h-8 flex items-center">
                                <NotificationDropdown />
                            </div>
                        )}

                        {isAuthenticated ? (
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="flex items-center gap-3 text-gray-700 dark:text-slate-200 hover:text-primary transition-colors px-2 md:px-4 py-2"
                                >
                                    <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-green-600 to-green-600-hover text-white flex items-center justify-center font-bold shadow-md">
                                        {currentUser?.name.charAt(0)}
                                    </div>
                                    <span className="font-bold hidden sm:block">{currentUser?.name}</span>
                                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>
                                <div className={`absolute left-0 mt-4 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 overflow-hidden z-50 transition-all duration-300 ${isDropdownOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`}>
                                    <div className="p-4 border-b border-gray-50 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-950/50">
                                        <p className="text-sm font-bold text-gray-900 dark:text-slate-100">{currentUser?.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-slate-400">{currentUser?.username}</p>
                                    </div>
                                    <Link
                                        to="/dashboard"
                                        onClick={() => setIsDropdownOpen(false)}
                                        className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 dark:text-slate-200 hover:bg-yellow-50 dark:hover:bg-slate-800 hover:text-green-600 transition-colors"
                                    >
                                        <Sparkles className="w-5 h-5 text-green-600" />
                                        لوحة التحكم
                                    </Link>
                                    <button
                                        onClick={() => { logout(); setIsDropdownOpen(false); }}
                                        className="flex w-full items-center gap-2 text-right px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                                    >
                                        <LogOut className="w-5 h-5" />
                                        تسجيل الخروج
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                className="hidden md:flex bg-gradient-to-r from-red-500 to-red-500 text-white px-5 md:px-8 py-2 md:py-2.5 rounded-full hover:shadow-lg hover:scale-105 transition-all font-bold text-xs md:text-sm"
                            >
                                تسجيل الدخول
                            </Link>
                        )}

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2 text-red-500 hover:bg-red-50 rounded-full transition-all active:scale-90"
                        >
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu - Floating Card Style */}
                <div className={`
                    absolute top-full left-0 right-0 mt-3 p-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-[2rem] border border-white/60 dark:border-slate-800/60 shadow-2xl
                    transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] md:hidden
                    ${isMenuOpen ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-4 invisible pointer-events-none'}
                `}>
                    <div className="space-y-2">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsMenuOpen(false)}
                                className={`flex items-center gap-3 px-6 py-4 rounded-full font-bold transition-all ${isActive(item.path)
                                    ? 'bg-red-500 text-white shadow-lg'
                                    : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <span className={`w-1.5 h-1.5 rounded-full ${isActive(item.path) ? 'bg-white' : 'bg-red-500'}`}></span>
                                {item.name}
                            </Link>
                        ))}

                        <div className="pt-2 mt-2 border-t border-gray-100">
                            {isAuthenticated ? (
                                <>
                                    <Link
                                        to="/dashboard"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="flex items-center gap-3 px-6 py-4 rounded-full font-bold text-gray-700 hover:bg-gray-50"
                                    >
                                        <Sparkles className="w-5 h-5 text-green-600" />
                                        لوحة التحكم
                                    </Link>
                                    <button
                                        onClick={() => { logout(); setIsMenuOpen(false); }}
                                        className="flex w-full items-center gap-3 px-6 py-4 rounded-full font-bold text-red-500 hover:bg-red-50"
                                    >
                                        <LogOut size={20} className="rotate-180" />
                                        تسجيل الخروج
                                    </button>
                                </>
                            ) : (
                                <Link
                                    to="/login"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center justify-center bg-gradient-to-r from-red-500 to-red-500 text-white py-4 rounded-full font-bold shadow-lg mt-2 active:scale-[0.98] transition-transform"
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
