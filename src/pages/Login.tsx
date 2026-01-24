import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User, Crown, Eye, EyeOff, ArrowRight, Headphones } from 'lucide-react';
import { useApp, useSettings } from '../context/AppContext';
import { SEO } from '../components/SEO';

export const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isPasswordFocused, setIsPasswordFocused] = useState(false); // State for eye animation
    const [error, setError] = useState('');
    const { login } = useApp();
    const { adminPhone } = useSettings();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const success = await login(username, password);
            if (success) {
                // Get fresh user data from localStorage since state might not have updated yet
                const savedUser = JSON.parse(localStorage.getItem('app_current_user') || '{}');
                if (savedUser.role === 'chat_user') {
                    navigate('/chat', { replace: true });
                } else {
                    navigate('/dashboard', { replace: true });
                }
            } else {
                setError('اسم المستخدم أو كلمة المرور غير صحيحة');
            }
        } catch (err: any) {
            console.error('Login error detail:', err);
            // Check if it's a network error
            if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('Network Error'))) {
                setError('تعذر الاتصال بالخادم. تأكد من اتصال الإنترنت أو إعدادات الرابط.');
            } else {
                setError(`حدث خطأ غير متوقع: ${err.message || 'غير معروف'}`);
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center p-2 sm:p-4 md:p-8 font-sans">
            <SEO
                title="تسجيل الدخول"
                description="تسجيل الدخول إلى لوحة تحكم معهد دارين - بوابة الطلاب والمعلمين والإدارة."
            />

            <div className="w-full max-w-md p-4 sm:p-6 md:p-8">
                <div className="text-center mb-6 sm:mb-8">
                    {/* Interactive Logo Container */}
                    <div className="w-24 h-24 sm:w-28 sm:h-28 bg-primary-600 rounded-none flex items-center justify-center text-white mx-auto -mt-8 sm:-mt-12 mb-4 sm:mb-6 relative shadow-xl shadow-primary-600/20 overflow-visible">

                        {/* The Crown - Moved Closer */}
                        <Crown className="absolute -top-9 -left-4 text-amber-400 drop-shadow-2xl transform -rotate-12 z-30" size={60} strokeWidth={2} fill="#fbbf24" />

                        {/* The Glasses Container */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center gap-2 z-20 w-48">

                            {/* Left Lens */}
                            <div className="relative w-16 h-16 bg-white rounded-[1.5rem] border-[6px] border-gray-900 overflow-hidden shadow-2xl ring-2 ring-black/5">
                                {/* Eye Internal */}
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-100/50">
                                    <div className={`w-5 h-5 bg-gray-900 rounded-full transition-all duration-300 ${isPasswordFocused ? 'translate-y-8 scale-90' : 'scale-100'} relative shadow-sm`}>
                                        <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-white rounded-full opacity-90"></div>
                                    </div>
                                </div>
                                {/* Eyelid */}
                                <div className={`absolute top-0 left-0 w-full bg-primary-600 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] border-b-[4px] border-gray-900 z-10 ${isPasswordFocused ? 'h-full' : 'h-0'}`} />
                            </div>

                            {/* Bridge & Nose Group */}
                            <div className="flex flex-col items-center -mt-3 relative z-0">
                                {/* Bridge */}
                                <div className="w-5 h-3 bg-gray-900 rounded-md shadow-md"></div>
                                {/* Cute Nose */}
                                <div className="w-4 h-3 bg-amber-400 rounded-b-xl shadow-sm mt-1"></div>
                            </div>

                            {/* Right Lens */}
                            <div className="relative w-16 h-16 bg-white rounded-[1.5rem] border-[6px] border-gray-900 overflow-hidden shadow-2xl ring-2 ring-black/5">
                                {/* Eye Internal */}
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-100/50">
                                    <div className={`w-5 h-5 bg-gray-900 rounded-full transition-all duration-300 ${isPasswordFocused ? 'translate-y-8 scale-90' : 'scale-100'} relative shadow-sm`}>
                                        <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-white rounded-full opacity-90"></div>
                                    </div>
                                </div>
                                {/* Eyelid */}
                                <div className={`absolute top-0 left-0 w-full bg-primary-600 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] border-b-[4px] border-gray-900 z-10 ${isPasswordFocused ? 'h-full' : 'h-0'}`} />
                            </div>

                        </div>

                        {/* The Smile - Reactive SVG */}
                        <svg className="absolute bottom-3 left-1/2 -translate-x-1/2 overflow-visible transition-all duration-300 ease-out" width="40" height="20" viewBox="0 0 40 20">
                            {isPasswordFocused ? (
                                <path
                                    d="M 10 10 L 30 10"
                                    fill="none"
                                    stroke="white"
                                    strokeWidth="5"
                                    strokeLinecap="round"
                                    className="drop-shadow-sm"
                                />
                            ) : (
                                <path
                                    d="M 5 5 Q 20 22 35 5"
                                    fill="none"
                                    stroke="white"
                                    strokeWidth="5"
                                    strokeLinecap="round"
                                    className="drop-shadow-sm"
                                />
                            )}
                        </svg>
                    </div>
                    <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-normal text-transparent bg-clip-text bg-gradient-to-r from-black via-gray-600 to-black drop-shadow-sm" style={{ fontFamily: 'Aref Ruqaa, serif' }}>دارين للتعليم والتدريب</h1>
                    <p className="mt-1 sm:mt-2 text-lg sm:text-xl md:text-2xl lg:text-3xl font-normal text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 drop-shadow-sm" style={{ fontFamily: 'Great Vibes, cursive' }}>
                        Mr. Ahmed Abdullah
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-bold text-center border border-red-100">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">اسم المستخدم</label>
                        <div className="relative">
                            <User className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-white border border-gray-200 rounded-xl py-3 pr-10 pl-4 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-sm"
                                placeholder="اسم المستخدم"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">كلمة المرور</label>
                        <div className="relative">
                            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onFocus={() => setIsPasswordFocused(true)} // Close eyes
                                onBlur={() => setIsPasswordFocused(false)} // Open eyes
                                className="w-full bg-white border border-gray-200 rounded-xl py-3 pr-10 pl-10 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-sm"
                                placeholder="كلمة المرور"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-600 transition-colors"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-primary-600 text-white font-bold py-3 rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/20"
                    >
                        تسجيل الدخول
                    </button>
                </form>

                <div className="mt-4">
                    <Link
                        to="/"
                        className="flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 font-bold transition-all group py-2"
                    >
                        <span>العودة للرئيسية</span>
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                    <a
                        href={`https://wa.me/${adminPhone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-4 w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-primary-600 transition-all group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <Headphones className="relative z-10" size={20} />
                        <span className="relative z-10">تواصل مع الدعم الفني</span>
                    </a>
                    <p className="text-center text-gray-400 text-[10px] mt-3 font-medium uppercase tracking-widest">متاح على مدار الساعة للمساعدة</p>
                </div>
            </div>
        </div>
    );
};
