import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sparkles, ChevronDown } from 'lucide-react';
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
        <header className="fixed top-6 left-0 right-0 z-50 mx-4 md:mx-auto max-w-[90%] transition-all duration-300">
            <nav className="bg-white/80 backdrop-blur-xl shadow-glass rounded-[2rem] border border-white/60 px-6 py-3">
                <div className="flex justify-between items-center h-14">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <Sparkles className="w-8 h-8 text-gold drop-shadow-md animate-pulse" />
                        <div className="flex flex-col items-start">
                            <h1 className="site-title text-xl font-black leading-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-900">
                                معهد دارين
                            </h1>
                            <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">
                                أفضل مدرسة افتراضية
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-2 bg-white/50 backdrop-blur-md px-2 py-1.5 rounded-full border border-white/60 shadow-sm">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`px-6 py-2 rounded-full font-bold text-sm transition-all duration-300 ${isActive(item.path)
                                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30 -translate-y-0.5'
                                    : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                                    }`}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>

                    {/* Auth Actions */}
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
                        className="md:hidden p-2 text-gray-600 hover:bg-gray-50 rounded-xl transition-all"
                    >
                        {isMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden pt-4 border-t border-gray-100 mt-4 space-y-2 pb-4">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsMenuOpen(false)}
                                className={`block px-4 py-3 rounded-xl font-bold ${isActive(item.path)
                                    ? 'bg-blue-50 text-blue-600'
                                    : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                {item.name}
                            </Link>
                        ))}
                        {!isAuthenticated && (
                            <div className="pt-4 border-t border-gray-100">
                                <Link
                                    to="/login"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="block text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-full font-bold shadow-md"
                                >
                                    تسجيل الدخول
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </nav>
        </header>
    );
};
