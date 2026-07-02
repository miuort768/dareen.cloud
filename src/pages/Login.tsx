import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    Lock, User, Eye, EyeOff, ArrowRight, Headphones,
    Sparkles, Users, Trophy, CheckCircle, ShieldCheck, Star, GraduationCap, Crown
} from 'lucide-react';
import { triggerHaptic } from '../lib/haptics';
import { useLogin } from '../context/AppContext';
import { useSettingsStore } from '../store/settingsStore';
import { SEO } from '../components/SEO';
import { PublicNavbar } from '../components/public/PublicNavbar';

export const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const login = useLogin();
    const { adminPhone } = useSettingsStore();
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
                } else if (savedUser.role === 'parent') {
                    navigate('/parent-dashboard', { replace: true });
                } else if (savedUser.role === 'student') {
                    navigate('/student-dashboard', { replace: true });
                } else if (savedUser.role === 'teacher') {
                    navigate('/teacher-dashboard', { replace: true });
                } else {
                    navigate('/admin-dashboard', { replace: true });
                }
            } else {
                setError('اسم المستخدم أو كلمة المرور غير صحيحة');
            }
        } catch (err) {
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
        <div className="min-h-screen bg-surface flex font-sans overflow-x-hidden overflow-y-auto relative transition-colors duration-500">
            <SEO title="تسجيل الدخول | دارين السابعة - منصة تعليم عن بعد" description="تسجيل دخول الطلاب، المعلمين، وأولياء الأمور إلى منصة دارين السابعة للتعليم عن بعد. متابعة الحصص، الجدول الدراسي، والنتائج من مكان واحد." url="https://dareen.cloud/login" image="/dareen_logo_new.jpg" breadcrumbs={[{ name: 'الرئيسية', item: '/' }, { name: 'تسجيل الدخول', item: '/login' }]} />

            {/* Static Background Layer */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-surface">
            </div>

            {/* Header for desktop screens only */}
            <div className="hidden md:block absolute top-0 w-full z-50">
                <PublicNavbar />
            </div>

            {/* Main Unified Container - Centennial Layout */}
            <div className="w-full min-h-screen flex flex-col md:flex-row justify-center items-start md:items-center max-w-7xl mx-auto relative z-10 px-4 pt-24 pb-12 md:pt-32">

                {/* Visual Section - Sharp, Static, No Divider - Right Side in RTL */}
                <div className="hidden md:flex md:w-1/2 bg-transparent relative flex-col justify-center items-center">
                    
                    {/* Static Mesh Grid Background */}
                    <div className="absolute inset-0 z-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(var(--text-main) 0.5px, transparent 0.5px)', backgroundSize: '32px 32px' }}></div>
                    
                    {/* Main Content Container */}
                    <div className="relative z-10 w-full max-w-md flex flex-col items-start justify-center p-8 text-right" dir="rtl">
                        
                        {/* Header Section */}
                        <div className="mb-10 w-full">
                            <div className="inline-flex items-center gap-3 bg-main px-5 py-2.5 rounded-none border-l-4 border-gold shadow-md mb-10">
                                <CheckCircle className="text-gold" size={18} />
                                <span className="text-[13px] font-black text-inverse uppercase tracking-[0.2em]">أفضل مدرسة افتراضية</span>
                            </div>

                            <div className="flex items-center gap-3 mb-6">
                                <Sparkles className="text-gold" size={28} />
                                <span className="text-[18px] font-black uppercase text-main tracking-[0.2em]">منصة دارين السابعة</span>
                            </div>
                            
                            <h2 className="text-2xl lg:text-4xl font-black text-main mb-8 leading-tight border-r-8 border-success pr-8 min-h-[4.5rem]">
                                {typedText}
                                <span className="inline-block w-[5px] h-7 bg-success mr-2 animate-pulse align-middle"></span>
                            </h2>
                            <p className="text-primary text-base font-bold max-w-md leading-relaxed">بدايتك المثالية للنجاح الأكاديمي والمهني برؤية تعليمية عالمية</p>
                            <p className="text-muted text-sm font-bold mt-2">نحو مستقبل مشرق بالتميز والإبداع</p>
                        </div>

                        {/* Organized Stats - Sharp & Static */}
                        <div className="grid grid-cols-1 gap-5 w-full">
                            <div className="bg-white/60 dark:bg-primary-active/60 backdrop-blur-sm border border-border/60 p-6 rounded-none flex items-center gap-6 border-r-4 border-r-error">
                                <div className="w-12 h-12 bg-error-soft rounded-none flex items-center justify-center text-error border border-border">
                                    <Users size={24} />
                                </div>
                                <div className="text-right">
                                    <div className="text-[11px] font-black text-muted uppercase tracking-widest mb-1">ثقة الطلاب</div>
                                    <div className="text-xl font-black text-main">+5,000 طالب</div>
                                </div>
                            </div>

                            <div className="bg-white/60 dark:bg-primary-active/60 backdrop-blur-sm border border-border/60 p-6 rounded-none flex items-center gap-6 border-r-4 border-r-success">
                                <div className="w-12 h-12 bg-success-soft rounded-none flex items-center justify-center text-success border border-border">
                                    <Trophy size={24} />
                                </div>
                                <div className="text-right">
                                    <div className="text-[11px] font-black text-muted uppercase tracking-widest mb-1">إنجازاتنا</div>
                                    <div className="text-xl font-black text-main">نخبة الأوائل</div>
                                </div>
                            </div>
                        </div>

                        {/* Static Values - Minimalist Footer - Enlarged */}
                        <div className="mt-8 flex flex-wrap gap-8">
                            <div className="flex items-center gap-3">
                                <ShieldCheck size={20} className="text-gold" />
                                <span className="text-[11px] font-black tracking-widest uppercase text-gold">بيئة آمنة</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Star size={20} className="text-gold" />
                                <span className="text-[11px] font-black tracking-widest uppercase text-gold">جودة معيارية</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <GraduationCap size={20} className="text-gold" />
                                <span className="text-[11px] font-black tracking-widest uppercase text-gold">كادر عالمي</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Login Form Section - Centered and Integrated - Left Side in RTL */}
                <div className="w-full md:w-1/2 flex items-center justify-center p-4 sm:p-8 lg:p-12 bg-transparent">
                    <div className="w-full max-w-md relative z-10">
                        <div className="text-center mb-10">
                            {/* Interactive Logo Container */}
                            <div className="w-24 h-24 sm:w-28 sm:h-28 bg-main rounded-3xl flex items-center justify-center text-inverse mx-auto mb-8 relative shadow-xl shadow-black/10 overflow-visible">

                                {/* The Crown */}
                                <Crown className="absolute -top-7 -left-3 text-gold drop-shadow-lg transform -rotate-12 z-30" size={50} strokeWidth={2.5} fill="var(--bg-accent)" />

                                {/* The Glasses Container */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center gap-1.5 z-20 w-40 mt-1">

                                    {/* Left Lens */}
                                    <div className="relative w-14 h-14 bg-card rounded-2xl border-[5px] border-error overflow-hidden shadow-inner flex shrink-0">
                                        <div className="absolute inset-0 flex items-center justify-center bg-surface/50">
                                            <div className={`w-4 h-4 bg-main rounded-full transition-transform duration-300 ${isPasswordFocused ? 'translate-y-6 scale-90' : 'scale-100'} relative`}>
                                                <div className="absolute top-0.5 right-0.5 w-1 h-1 bg-card rounded-full opacity-90"></div>
                                            </div>
                                        </div>
                                        {/* Eyelid */}
                                        <div className={`absolute top-0 left-0 w-full bg-main transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] z-10 ${isPasswordFocused ? 'h-full' : 'h-0'}`} />
                                    </div>

                                    {/* Bridge */}
                                    <div className="w-4 h-1.5 bg-main rounded-full shrink-0 -mt-2"></div>

                                    {/* Right Lens */}
                                    <div className="relative w-14 h-14 bg-card rounded-2xl border-[5px] border-success overflow-hidden shadow-inner flex shrink-0">
                                        <div className="absolute inset-0 flex items-center justify-center bg-surface/50">
                                            <div className={`w-4 h-4 bg-main rounded-full transition-transform duration-300 ${isPasswordFocused ? 'translate-y-6 scale-90' : 'scale-100'} relative`}>
                                                <div className="absolute top-0.5 right-0.5 w-1 h-1 bg-card rounded-full opacity-90"></div>
                                            </div>
                                        </div>
                                        {/* Eyelid */}
                                        <div className={`absolute top-0 left-0 w-full bg-main transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] z-10 ${isPasswordFocused ? 'h-full' : 'h-0'}`} />
                                    </div>
                                </div>
                            </div>

                            <h1 className="text-2xl sm:text-3xl font-black text-main mb-2 font-heading tracking-tight">أهلاً بك في دارين</h1>
                            <p className="text-muted font-bold text-sm sm:text-base">يرجى تسجيل الدخول للمتابعة إلى حسابك</p>
                        </div>
                        
                        {/* Mobile Background Decoration (visible only on small screens) */}
                        <div className="md:hidden absolute top-0 right-0 w-[400px] h-[400px] bg-error/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none z-0"></div>
                        <div className="md:hidden absolute bottom-0 left-0 w-[300px] h-[300px] bg-success/5 rounded-full blur-[80px] translate-y-1/4 -translate-x-1/4 pointer-events-none z-0"></div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="bg-error-soft text-error p-4 rounded-xl text-sm font-bold text-center border border-border animate-fade-in flex items-center justify-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-error animate-pulse"></span>
                                    {error}
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-xs font-black text-muted uppercase tracking-widest block text-right">اسم المستخدم</label>
                                <div className="relative group">
                                    <User className="absolute right-4 top-1/2 -translate-y-1/2 text-dim group-focus-within:text-error transition-colors" size={20} />
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full bg-surface border border-border rounded-xl py-4 pr-12 pl-4 focus:outline-none focus:border-error focus:ring-4 focus:ring-error/10 transition-all font-bold placeholder:text-dim text-right"
                                        placeholder="أدخل اسم المستخدم..."
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-black text-muted uppercase tracking-widest block text-right">كلمة المرور</label>
                                <div className="relative group">
                                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-dim group-focus-within:text-success transition-colors" size={20} />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onFocus={() => setIsPasswordFocused(true)}
                                        onBlur={() => setIsPasswordFocused(false)}
                                        className="w-full bg-surface border border-border rounded-xl py-4 pr-12 pl-12 focus:outline-none focus:border-success focus:ring-4 focus:ring-success/10 transition-all font-bold placeholder:text-dim text-right"
                                        placeholder="أدخل كلمة المرور..."
                                        required
                                        style={{ fontFamily: showPassword ? 'inherit' : 'caption' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-dim hover:text-main transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-error text-on-error py-4 rounded-none font-black text-lg shadow-lg shadow-black/20 transform transition-all active:scale-[0.98] flex items-center justify-center gap-2 group mt-2"
                            >
                                <span>دخول للحساب</span>
                                <ArrowRight size={18} className="group-hover:translate-x-[-4px] transition-transform" />
                            </button>
                        </form>

                        <div className="flex flex-col items-center mt-2">
                            <Link 
                                to="/" 
                                className="text-success font-bold hover:text-success-dark transition-colors flex items-center justify-center gap-2 py-1"
                            >
                                <ArrowRight size={18} className="rotate-180" />
                                <span>العودة للرئيسية</span>
                            </Link>
                        </div>

                        <div className="mt-4 pt-4 border-t border-border flex flex-col gap-1.5">
                            <a
                                href={`https://wa.me/${adminPhone}?text=أحتاج مساعدة في تسجيل الدخول`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full bg-main text-inverse py-4 rounded-none font-bold flex items-center justify-center gap-3 transition-all hover:bg-main active:scale-[0.98] shadow-lg shadow-black/10"
                            >
                                <Headphones size={20} />
                                <span>تواصل مع الدعم الفني</span>
                            </a>
                            <p className="text-center text-[11px] text-muted font-bold">متاح على مدار الساعة للمساعدة</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
