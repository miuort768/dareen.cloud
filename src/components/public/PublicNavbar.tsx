import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sparkles, ChevronDown, LogOut, GraduationCap, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NotificationDropdown } from '../ui/NotificationDropdown';
import { cn } from '../../lib/utils';

export const PublicNavbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { isAuthenticated, currentUser, logout } = useApp();
    const location = useLocation();

    const navItems = [
        { name: 'الرئيسية', path: '/' },
        { name: 'الدورات', path: '/courses' },
        { name: 'المدونة', path: '/books' },
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
                            <div className="absolute inset-0 bg-indigo-300 rounded-xl blur-md opacity-20 group-hover:opacity-40 transition-opacity"></div>
                             <div className="relative w-11 h-11 overflow-hidden bg-gradient-to-tr from-indigo-600 via-indigo-500 to-indigo-900 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:rotate-[10deg] transition-all duration-500 border border-white/20">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent w-[150%] h-full animate-shine pointer-events-none z-0"></div>
                                <GraduationCap size={24} className="relative z-10" />
                            </div>
                            <Sparkles size={12} className="absolute -top-[2px] -right-[2px] text-amber-500 fill-amber-500 animate-pulse z-20 group-hover:scale-110 transition-transform" />
                        </div>
                        <div className={cn(
                            "flex-col items-center pt-0.5 text-center",
                            isAuthenticated ? "hidden md:flex" : "flex"
                        )}>
                            <h1 className="site-title text-[13px] md:text-[17px] font-black leading-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-800 via-indigo-600 to-indigo-900">
                                دارين السابعة
                            </h1>
                            <span className="text-[9px] md:text-[11px] text-indigo-600 dark:text-indigo-400 font-bold mt-0.5 bg-indigo-50/80 dark:bg-indigo-950/40 px-2 py-0.5 rounded-md" style={{ fontFamily: '"Aref Ruqaa", serif' }}>
                                أفضل مدرسة افتراضية
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-2 bg-indigo-50/50 dark:bg-slate-800/50 backdrop-blur-md px-2 py-1.5 rounded-full border border-indigo-200 dark:border-slate-700 shadow-sm">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`px-6 py-2 rounded-full font-bold text-sm transition-all duration-500 ${isActive(item.path)
                                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-400 text-white shadow-lg shadow-indigo-400/30 -translate-y-0.5'
                                    : 'text-gray-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:text-indigo-600'
                                    }`}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>

                    {/* Right Side: Auth & Notifications */}
                    <div className="flex items-center gap-2 md:gap-4">
                        {/* Dark Mode Toggle Removed from here */}


                        {isAuthenticated && (
                            <div className="hidden md:flex border-l border-gray-100 dark:border-slate-800 pl-4 h-8 items-center">
                                <NotificationDropdown />
                            </div>
                        )}

                        {isAuthenticated ? (
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="flex items-center gap-3 text-gray-700 dark:text-slate-200 hover:text-indigo-600 transition-all px-2 md:px-4 py-2 group"
                                >
                                    <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-indigo-100 dark:border-indigo-900 shadow-sm group-hover:border-indigo-500 transition-all">
                                        {currentUser?.avatar ? (
                                            <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center">
                                                <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                            </div>
                                        )}
                                    </div>
                                    <span className="font-bold text-xs md:text-sm">{currentUser?.name.split(' ')[0]}</span>
                                    <ChevronDown className={`w-3 h-3 md:w-4 md:h-4 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>
                                <div className={`absolute left-0 mt-4 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 overflow-hidden z-50 transition-all duration-300 ${isDropdownOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`}>
                                    <div className="p-4 border-b border-gray-50 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-950/50">
                                        <p className="text-sm font-bold text-gray-900 dark:text-slate-100">{currentUser?.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-slate-400">{currentUser?.username}</p>
                                    </div>
                                    <Link
                                        to="/dashboard"
                                        onClick={() => setIsDropdownOpen(false)}
                                        className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-slate-800 hover:text-indigo-600 transition-colors"
                                    >
                                        <Sparkles className="w-5 h-5 text-indigo-600" />
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
                                className="hidden md:flex bg-gradient-to-r from-indigo-600 to-indigo-500 text-white px-5 md:px-8 py-2 md:py-2.5 rounded-full hover:shadow-lg hover:scale-105 transition-all font-bold text-xs md:text-sm"
                            >
                                تسجيل الدخول
                            </Link>
                        )}

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition-all active:scale-90"
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
                        {navItems.filter(item => !isActive(item.path)).map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsMenuOpen(false)}
                                className={`flex items-center gap-3 px-6 py-4 rounded-full font-bold transition-all ${isActive(item.path)
                                    ? 'bg-indigo-600 text-white shadow-lg'
                                    : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <span className={`w-1.5 h-1.5 rounded-full ${isActive(item.path) ? 'bg-white' : 'bg-indigo-600'}`}></span>
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
                                        <Sparkles className="w-5 h-5 text-indigo-600" />
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
                                    className="flex items-center justify-center bg-gradient-to-r from-indigo-600 to-indigo-500 text-white py-4 rounded-full font-bold shadow-lg mt-2 active:scale-[0.98] transition-transform"
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
