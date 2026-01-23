import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sparkles, ChevronDown, LogOut } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const PublicNavbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { isAuthenticated, currentUser, logout } = useApp();
    const location = useLocation();

    const navItems = [
        { name: 'الرئيسية', path: '/' },
        { name: 'الدورات', path: '/courses' },
        { name: 'من نحن', path: '/about' },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <header className="fixed top-4 md:top-6 left-0 right-0 z-50 mx-auto w-[92%] md:max-w-[90%] transition-all duration-500">
            <nav className="bg-white/90 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-full md:rounded-[2rem] border border-white/60 px-4 md:px-6 py-2 md:py-3 relative">
                <div className="flex justify-between items-center h-12 md:h-14">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 pr-2">
                        <div className="flex flex-col items-start">
                            <h1 className="site-title text-lg md:text-xl font-black leading-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-900">
                                معهد دارين
                            </h1>
                            <span className="text-[8px] md:text-[9px] text-gray-500 font-bold uppercase tracking-wider">
                                مدرسة افتراضية متطورة
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-2 bg-gray-50/50 backdrop-blur-md px-2 py-1.5 rounded-full border border-gray-100 shadow-sm">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`px-6 py-2 rounded-full font-bold text-sm transition-all duration-500 ${isActive(item.path)
                                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30 -translate-y-0.5'
                                    : 'text-gray-600 hover:bg-white hover:text-blue-600'
                                    }`}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>

                    {/* Desktop Auth */}
                    <div className="hidden md:flex items-center gap-4">
                        {isAuthenticated ? (
                            <div className="relative group">
                                <button className="flex items-center gap-3 text-gray-700 hover:text-primary transition-colors px-4 py-2">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold to-gold-hover text-white flex items-center justify-center font-bold shadow-md">
                                        {currentUser?.name.charAt(0)}
                                    </div>
                                    <span className="font-bold">{currentUser?.name}</span>
                                    <ChevronDown className="w-4 h-4" />
                                </button>
                                <div className="absolute left-0 mt-4 w-56 bg-white rounded-2xl shadow-xl hidden group-hover:block border border-gray-100 overflow-hidden z-50">
                                    <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                                        <p className="text-sm font-bold text-gray-900">{currentUser?.name}</p>
                                        <p className="text-xs text-gray-500">{currentUser?.username}</p>
                                    </div>
                                    <Link
                                        to="/dashboard"
                                        className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-yellow-50 hover:text-gold transition-colors"
                                    >
                                        <Sparkles className="w-5 h-5 text-gold" />
                                        لوحة التحكم
                                    </Link>
                                    <button
                                        onClick={logout}
                                        className="flex w-full items-center gap-2 text-right px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors"
                                    >
                                        تسجيل الخروج
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-2.5 rounded-full hover:shadow-lg hover:scale-105 transition-all font-bold"
                            >
                                تسجيل الدخول
                            </Link>
                        )}
                    </div>

                    {/* Mobile Toggle */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden p-2.5 text-blue-600 hover:bg-blue-50 rounded-full transition-all active:scale-90"
                    >
                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Mobile Menu - Floating Card Style */}
                <div className={`
                    absolute top-full left-0 right-0 mt-3 p-4 bg-white/95 backdrop-blur-2xl rounded-[2rem] border border-white/60 shadow-2xl
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
                                    ? 'bg-blue-600 text-white shadow-lg'
                                    : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <span className={`w-1.5 h-1.5 rounded-full ${isActive(item.path) ? 'bg-white' : 'bg-blue-600'}`}></span>
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
                                        <Sparkles className="w-5 h-5 text-gold" />
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
                                    className="flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-full font-bold shadow-lg mt-2 active:scale-[0.98] transition-transform"
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
