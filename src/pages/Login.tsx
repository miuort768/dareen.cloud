import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User, Crown, Eye, EyeOff, ArrowRight, Headphones } from 'lucide-react';
import { useApp, useSettings } from '../context/AppContext';
import { SEO } from '../components/SEO';
import { PublicNavbar } from '../components/public/PublicNavbar';

// Import course image for the left side
import foundationImg from '../assets/courses/foundation.png';

export const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);
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
            if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('Network Error'))) {
                setError('تعذر الاتصال بالخادم. تأكد من اتصال الإنترنت أو إعدادات الرابط.');
            } else {
                setError(`حدث خطأ غير متوقع: ${err.message || 'غير معروف'}`);
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFCF8] flex font-sans overflow-hidden relative">
            <SEO
                title="تسجيل الدخول"
                description="تسجيل الدخول إلى بوابة معهد دارين - طموح لا يعرف الحدود."
            />

            {/* Header for desktop screens only */}
            <div className="hidden md:block absolute top-0 w-full z-50">
                <PublicNavbar />
            </div>

            {/* Left Side - Image Only (Square frame with dashed border) */}
            <div className="hidden md:flex md:w-1/2 lg:w-3/5 bg-[#FDFCF8] relative flex-col justify-center items-center overflow-hidden border-l border-gray-100">
                {/* Abstract Black Angle Background */}
                <div className="absolute top-0 right-0 w-full h-full pointer-events-none z-0">
                    <div className="absolute -top-[10%] -left-[20%] w-[150%] h-[120%] bg-black transform -rotate-6 origin-bottom-left shadow-2xl"></div>
                    <div className="absolute top-0 right-0 w-1.5 h-full bg-gradient-to-b from-red-600 via-transparent to-green-600 opacity-50"></div>
                </div>

                {/* Content Container (Image Only) */}
                <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-8 lg:p-16">
                    {/* Elegant Framed Image */}
                    <div className="relative w-full max-w-sm aspect-[4/5] group flex-shrink-0 z-20">
                        {/* Decorative Frame Lines */}
                        <div className="absolute -inset-6 border-2 border-dashed border-gray-600 rounded-none transform rotate-3 group-hover:rotate-0 group-hover:border-red-500/50 transition-all duration-700"></div>
                        
                        {/* Solid Color Shadow */}
                        <div className="absolute inset-0 bg-green-600 translate-x-4 translate-y-4 group-hover:translate-x-6 group-hover:translate-y-6 transition-transform duration-700 ease-out z-0"></div>
                        
                        {/* Image Wrapper */}
                        <div className="relative w-full h-full bg-gray-100 overflow-hidden shadow-2xl z-10 border-r-8 border-b-8 border-red-600 group-hover:border-black transition-colors duration-700">
                            <img 
                                src={foundationImg} 
                                alt="معهد دارين" 
                                className="w-full h-full object-cover transform scale-110 group-hover:scale-100 transition-transform duration-[1.5s] ease-[cubic-bezier(0.25,1,0.5,1)]" 
                            />
                            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full md:w-1/2 lg:w-2/5 flex items-center justify-center p-4 sm:p-8 relative z-10 bg-white shadow-[-20px_0_40px_-20px_rgba(0,0,0,0.1)]">
                
                {/* Mobile Background Decoration (visible only on small screens) */}
                <div className="md:hidden absolute top-0 right-0 w-[400px] h-[400px] bg-red-600/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none z-0"></div>
                <div className="md:hidden absolute bottom-0 left-0 w-[300px] h-[300px] bg-green-600/5 rounded-full blur-[80px] translate-y-1/4 -translate-x-1/4 pointer-events-none z-0"></div>

                <div className="w-full max-w-md relative z-10 mt-12 md:mt-20">
                    <div className="text-center mb-8">
                        {/* Interactive Logo Container */}
                        <div className="w-24 h-24 sm:w-28 sm:h-28 bg-black rounded-3xl flex items-center justify-center text-white mx-auto mb-6 relative shadow-xl shadow-black/10 overflow-visible">

                            {/* The Crown */}
                            <Crown className="absolute -top-7 -left-3 text-gold drop-shadow-lg transform -rotate-12 z-30" size={50} strokeWidth={2.5} fill="#D4AF37" />

                            {/* The Glasses Container */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center gap-1.5 z-20 w-40 mt-1">

                                {/* Left Lens */}
                                <div className="relative w-14 h-14 bg-white rounded-2xl border-[5px] border-red-600 overflow-hidden shadow-inner flex shrink-0">
                                    <div className="absolute inset-0 flex items-center justify-center bg-gray-50/50">
                                        <div className={`w-4 h-4 bg-black rounded-full transition-transform duration-300 ${isPasswordFocused ? 'translate-y-6 scale-90' : 'scale-100'} relative`}>
                                            <div className="absolute top-0.5 right-0.5 w-1 h-1 bg-white rounded-full opacity-90"></div>
                                        </div>
                                    </div>
                                    {/* Eyelid */}
                                    <div className={`absolute top-0 left-0 w-full bg-black transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] z-10 ${isPasswordFocused ? 'h-full' : 'h-0'}`} />
                                </div>

                                {/* Bridge */}
                                <div className="w-4 h-1.5 bg-black rounded-full shrink-0 -mt-2"></div>

                                {/* Right Lens */}
                                <div className="relative w-14 h-14 bg-white rounded-2xl border-[5px] border-green-600 overflow-hidden shadow-inner flex shrink-0">
                                    <div className="absolute inset-0 flex items-center justify-center bg-gray-50/50">
                                        <div className={`w-4 h-4 bg-black rounded-full transition-transform duration-300 ${isPasswordFocused ? 'translate-y-6 scale-90' : 'scale-100'} relative`}>
                                            <div className="absolute top-0.5 right-0.5 w-1 h-1 bg-white rounded-full opacity-90"></div>
                                        </div>
                                    </div>
                                    {/* Eyelid */}
                                    <div className={`absolute top-0 left-0 w-full bg-black transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] z-10 ${isPasswordFocused ? 'h-full' : 'h-0'}`} />
                                </div>
                            </div>
                        </div>

                        <h1 className="text-2xl sm:text-3xl font-black text-black mb-2 font-heading tracking-tight">أهلاً بك في دارين</h1>
                        <p className="text-gray-500 font-bold text-sm sm:text-base">يرجى تسجيل الدخول للمتابعة إلى حسابك</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold text-center border border-red-100 animate-fade-in flex items-center justify-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest block">اسم المستخدم</label>
                            <div className="relative group">
                                <User className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-red-500 transition-colors" size={20} />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl py-4 pr-12 pl-4 focus:outline-none focus:border-red-400 focus:ring-4 focus:ring-red-500/10 transition-all font-bold placeholder:text-gray-300"
                                    placeholder="أدخل اسم المستخدم..."
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest block">كلمة المرور</label>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-green-500 transition-colors" size={20} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onFocus={() => setIsPasswordFocused(true)}
                                    onBlur={() => setIsPasswordFocused(false)}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl py-4 pr-12 pl-12 focus:outline-none focus:border-green-400 focus:ring-4 focus:ring-green-500/10 transition-all font-bold placeholder:text-gray-300"
                                    placeholder="أدخل كلمة المرور..."
                                    required
                                    style={{ fontFamily: showPassword ? 'inherit' : 'caption' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-black text-white font-black text-sm uppercase tracking-[0.2em] py-5 rounded-xl hover:bg-red-600 transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-3 overflow-hidden group mt-8"
                        >
                            <span>دخول للحساب</span>
                            <ArrowRight size={18} className="group-hover:translate-x-[-4px] transition-transform" />
                        </button>
                    </form>

                    <div className="mt-4 text-center">
                        <Link
                            to="/"
                            className="inline-flex items-center justify-center gap-2 text-gray-500 hover:text-red-600 font-bold transition-all group py-2 text-sm"
                        >
                            <span>العودة للرئيسية</span>
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <a
                            href={`https://wa.me/${adminPhone}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-4 w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-black transition-all group relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-black opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <Headphones className="relative z-10" size={20} />
                            <span className="relative z-10 text-sm">تواصل مع الدعم الفني</span>
                        </a>
                        <p className="text-center text-gray-400 text-[10px] mt-3 font-medium uppercase tracking-widest">متاح على مدار الساعة للمساعدة</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
