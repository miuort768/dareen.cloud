import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    Lock, User, Eye, EyeOff, ArrowRight, Headphones,
    Users, Trophy, GraduationCap, Crown
} from 'lucide-react';
import { triggerHaptic } from '../lib/haptics';
import { useApp, useSettings } from '../context/AppContext';
import { SEO } from '../components/SEO';
import { PublicNavbar } from '../components/public/PublicNavbar';

export const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useApp();
    const { adminPhone } = useSettings();
    const navigate = useNavigate();

    // Typewriter effect logic
    const [typedText, setTypedText] = useState('');
    const fullText = 'طموح لا يعرف الحدود معانا';
    
    useEffect(() => {
        let i = 0;
        let isDeleting = false;
        
        const type = () => {
            const current = fullText.substring(0, i);
            setTypedText(current);
            
            if (!isDeleting && i < fullText.length) {
                i++;
                setTimeout(type, 150);
            } else if (isDeleting && i > 0) {
                i--;
                setTimeout(type, 100);
            } else {
                isDeleting = !isDeleting;
                setTimeout(type, isDeleting ? 2000 : 1000); // Pause at end/start
            }
        };
        
        const timeoutId = setTimeout(type, 1000);
        return () => clearTimeout(timeoutId);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        triggerHaptic('medium');
        setError('');
        setLoading(true);

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
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex font-sans overflow-x-hidden overflow-y-auto relative transition-colors duration-500 selection:bg-indigo-500/30 selection:text-indigo-200" dir="rtl">
            <SEO
                title="تسجيل الدخول"
                description="تسجيل الدخول إلى بوابة دارين السابعة - طموح لا يعرف الحدود."
            />

            {/* Dynamic Background Layer */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                {/* Base Grid */}
                <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'linear-gradient(#4f46e5 1px, transparent 1px), linear-gradient(90deg, #4f46e5 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
                
                {/* Animated Mesh Gradients */}
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 blur-[120px] rounded-full animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-900/30 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-amber-500/10 blur-[100px] rounded-full animate-pulse" style={{ animationDelay: '4s' }}></div>
            </div>

            {/* Header for desktop screens only */}
            <div className="hidden md:block absolute top-0 w-full z-50">
                <PublicNavbar />
            </div>

            {/* Main Unified Container */}
            <div className="w-full min-h-screen flex flex-col md:flex-row justify-center items-center max-w-[1600px] mx-auto relative z-10 px-6 pt-24 pb-12 md:pt-0">

                {/* Visual Section - Premium Sharp Aesthetic */}
                <div className="hidden md:flex md:w-1/2 bg-transparent relative flex-col justify-center items-start pr-12">
                    <div className="relative z-10 w-full max-w-xl text-right">
                        
                        {/* Status Badge */}
                        <div className="inline-flex items-center gap-4 bg-slate-900/80 backdrop-blur-md px-6 py-3 border-r-4 border-indigo-500 shadow-2xl mb-12">
                            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></div>
                            <span className="text-[11px] font-black text-white uppercase tracking-widest">Premium Educational Experience</span>
                        </div>

                        {/* Title Section */}
                        <div className="mb-12">
                            <h2 className="text-5xl lg:text-7xl font-black text-white mb-8 leading-[1.1] tracking-tighter">
                                {typedText}
                                <span className="inline-block w-2 h-16 bg-indigo-500 ml-4 animate-pulse align-middle"></span>
                            </h2>
                            <p className="text-slate-400 text-lg font-bold max-w-md leading-relaxed border-r-2 border-slate-800 pr-6">بدايتك المثالية للنجاح الأكاديمي والمهني برؤية تعليمية عالمية تجمع بين الأصالة والابتكار</p>
                        </div>

                        {/* Stats Cards - Sharp Brutalist */}
                        <div className="grid grid-cols-2 gap-6 w-full max-w-lg">
                            <div className="bg-slate-900/50 backdrop-blur-xl border-2 border-slate-800 p-8 hover:border-indigo-500 transition-all group relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-12 h-12 bg-indigo-500/10 -translate-y-6 translate-x-6 rotate-45"></div>
                                <Users size={24} className="text-indigo-500 mb-4 group-hover:scale-110 transition-transform" />
                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Students Trusted</div>
                                <div className="text-2xl font-black text-white">+5,000</div>
                            </div>

                            <div className="bg-slate-900/50 backdrop-blur-xl border-2 border-slate-800 p-8 hover:border-indigo-500 transition-all group relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-12 h-12 bg-indigo-500/10 -translate-y-6 translate-x-6 rotate-45"></div>
                                <Trophy size={24} className="text-indigo-500 mb-4 group-hover:scale-110 transition-transform" />
                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Excellence Rate</div>
                                <div className="text-2xl font-black text-white">99.8%</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Login Form Section - Premium Glassmorphism Card */}
                <div className="w-full md:w-1/2 flex items-center justify-center lg:justify-end lg:pl-20">
                    <div className="w-full max-w-md relative">
                        {/* Decorative background shadow */}
                        <div className="absolute -inset-4 bg-indigo-500/20 blur-3xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity"></div>
                        
                        <div className="relative bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-800 p-10 shadow-[12px_12px_0px_0px_rgba(79,70,229,1)] dark:shadow-[12px_12px_0px_0px_rgba(79,70,229,0.3)] group">
                            
                            <div className="text-center mb-10">
                                {/* Brand Logo / Icon */}
                                <div className="w-20 h-20 bg-slate-950 dark:bg-white rounded-none flex items-center justify-center text-white dark:text-slate-950 mx-auto mb-8 relative shadow-2xl group-hover:rotate-6 transition-transform">
                                    <Crown className="absolute -top-6 -left-4 text-amber-500 drop-shadow-xl transform -rotate-12" size={44} fill="#f59e0b" />
                                    <GraduationCap size={40} />
                                </div>

                                <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-3 tracking-tighter text-right">تسجيل الدخول</h1>
                                <p className="text-slate-500 font-bold text-sm text-right">مرحباً بك مجدداً في نظام دارين التعليمي</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {error && (
                                    <div className="bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 p-4 border-2 border-rose-600/20 text-xs font-black text-center animate-shake uppercase tracking-tight">
                                        {error}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-1 text-right">Username / ID</label>
                                    <div className="relative group/input">
                                        <div className="absolute right-0 top-0 h-full w-12 flex items-center justify-center text-slate-400 group-focus-within/input:text-indigo-500 transition-colors">
                                            <User size={20} />
                                        </div>
                                        <input
                                            type="text"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 py-4 pr-12 pl-4 focus:outline-none focus:border-indigo-500 transition-all font-black text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 text-right"
                                            placeholder="Username..."
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-1 text-right">Password</label>
                                    <div className="relative group/input">
                                        <div className="absolute right-0 top-0 h-full w-12 flex items-center justify-center text-slate-400 group-focus-within/input:text-indigo-500 transition-colors">
                                            <Lock size={20} />
                                        </div>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 py-4 pr-12 pl-12 focus:outline-none focus:border-indigo-500 transition-all font-black text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 text-right"
                                            placeholder="••••••••"
                                            required
                                            style={{ fontFamily: showPassword ? 'inherit' : 'caption' }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg uppercase tracking-widest shadow-xl shadow-indigo-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 relative overflow-hidden group/btn disabled:opacity-70"
                                >
                                    <span className="relative z-10">{loading ? 'Processing...' : 'Access Portal'}</span>
                                    <ArrowRight size={20} className="relative z-10 group-hover:translate-x-[-4px] transition-transform" />
                                    <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover/btn:translate-x-0 transition-transform duration-500"></div>
                                </button>
                            </form>

                            <div className="mt-8 pt-8 border-t-2 border-slate-100 dark:border-slate-800 flex flex-col gap-4">
                                <a
                                    href={`https://wa.me/${adminPhone}?text=أحتاج مساعدة في تسجيل الدخول`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full h-12 bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-indigo-600 dark:hover:bg-indigo-50 transition-all"
                                >
                                    <Headphones size={18} />
                                    <span>Support Center</span>
                                </a>
                                <Link 
                                    to="/" 
                                    className="text-center text-[10px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-widest transition-colors"
                                >
                                    Back to Website
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

};

export default Login;

