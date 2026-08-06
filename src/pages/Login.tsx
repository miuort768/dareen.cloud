import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User, Eye, EyeOff, ArrowRight, Headphones, GraduationCap, ArrowLeft } from 'lucide-react';
import { triggerHaptic } from '../lib/haptics';
import { useLogin, useAcademyName } from '../context/AppContext';
import { useSettingsStore } from '../store/settingsStore';
import { SEO } from '../components/SEO';
import { PublicNavbar } from '../components/public/PublicNavbar';
import { Image } from '../shared/components/ui';
import { cn } from '../lib/utils';

export const Login = () => {
    const academyName = useAcademyName();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const login = useLogin();
    const adminPhone = useSettingsStore(s => s.adminPhone);
    const navigate = useNavigate();

    useEffect(() => {
        document.title = `تسجيل الدخول — ${academyName}`;
    }, [academyName]);

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
        } catch (err: unknown) {
            if (err instanceof Error && (err.message.includes('Failed to fetch') || err.message.includes('Network Error'))) {
                setError('تعذر الاتصال بالخادم. تأكد من اتصال الإنترنت.');
            } else {
                setError(`حدث خطأ: ${err.message || 'غير معروف'}`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background font-sans relative overflow-hidden">
            <SEO title="تسجيل الدخول" description="تسجيل دخول الطلاب والمعلمين وأولياء الأمور إلى منصة دارين السابعة" url="https://dareen.cloud/login" image="/dareen_logo_new.jpg" breadcrumbs={[{ name: 'الرئيسية', item: '/' }, { name: 'تسجيل الدخول', item: '/login' }]} />

            {/* Navbar */}
            <div className="hidden md:block absolute top-0 w-full z-50">
                <PublicNavbar />
            </div>

            <div className="w-full min-h-screen flex flex-col md:flex-row">

                {/* ===== Hero Section (Desktop) ===== */}
                <div className="hidden lg:flex lg:w-[45%] bg-primary relative overflow-hidden">
                    {/* Background patterns */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-20 end-20 w-64 h-64 bg-white/20 rounded-full blur-3xl" />
                        <div className="absolute bottom-20 start-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
                    </div>

                    <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-on-primary">
                        {/* Logo */}
                        <div className="relative mb-10">
                            <div className="w-28 h-28 bg-white/15 backdrop-blur-sm rounded-3xl flex items-center justify-center border border-white/20 shadow-xl">
                                <GraduationCap size={52} className="text-on-primary" />
                            </div>
                        </div>

                        {/* Heading */}
                        <h1 className="text-3xl xl:text-4xl font-black text-center leading-tight mb-4 font-heading">
                            مرحباً بك في
                            <br />
                            <span className="text-on-primary/90">{academyName}</span>
                        </h1>
                        <p className="text-on-primary/70 text-sm text-center max-w-sm leading-relaxed mb-12">
                            منصة تعليمية متكاملة للطلاب والمعلمين وأولياء الأمور
                        </p>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 text-center border border-white/10">
                                <span className="text-3xl font-black block mb-1">5k+</span>
                                <span className="text-xs text-on-primary/70 font-bold">طالب مسجل</span>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 text-center border border-white/10">
                                <span className="text-3xl font-black block mb-1">10+</span>
                                <span className="text-xs text-on-primary/70 font-bold">سنوات خبرة</span>
                            </div>
                        </div>

                        {/* Support */}
                        <a
                            href={`https://wa.me/${adminPhone}?text=أحتاج مساعدة في تسجيل الدخول`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-10 flex items-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl px-5 py-3 transition-all border border-white/10"
                        >
                            <Headphones size={18} />
                            <span className="text-sm font-bold">الدعم الفني متاح 24/7</span>
                        </a>
                    </div>
                </div>

                {/* ===== Form Section ===== */}
                <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-8 lg:px-16 py-8 lg:py-0">
                    <div className="w-full max-w-md">
                        {/* Mobile Logo */}
                        <div className="lg:hidden text-center mb-8">
                            <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center text-on-primary mx-auto mb-4 shadow-lg shadow-primary/20">
                                <GraduationCap size={40} />
                            </div>
                            <h1 className="text-xl font-black text-main font-heading">{academyName}</h1>
                        </div>

                        {/* Welcome text */}
                        <div className="mb-8">
                            <h2 className="text-2xl lg:text-3xl font-black text-main mb-2 font-heading">تسجيل الدخول</h2>
                            <p className="text-muted text-sm font-medium">أدخل بياناتك للوصول إلى حسابك</p>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="mb-4 p-4 bg-error-soft border border-error/20 rounded-xl">
                                <p className="text-sm font-bold text-error">{error}</p>
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Username */}
                            <div>
                                <label htmlFor="login-username" className="text-xs font-bold text-muted mb-1.5 block">اسم المستخدم</label>
                                <div className="relative">
                                    <User size={18} className="absolute start-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                                    <input
                                        id="login-username"
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="أدخل اسم المستخدم"
                                        required
                                        className="w-full h-12 bg-card border border-border rounded-xl ps-12 pe-4 text-sm text-main placeholder:text-muted outline-none transition-all focus:border-primary focus:ring-2 focus:ring-focus"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label htmlFor="login-password" className="text-xs font-bold text-muted mb-1.5 block">كلمة المرور</label>
                                <div className="relative">
                                    <Lock size={18} className="absolute start-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                                    <input
                                        id="login-password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="أدخل كلمة المرور"
                                        required
                                        className="w-full h-12 bg-card border border-border rounded-xl ps-12 pe-12 text-sm text-main placeholder:text-muted outline-none transition-all focus:border-primary focus:ring-2 focus:ring-focus"
                                        style={{ fontVariantNumeric: showPassword ? 'normal' : 'tabular-nums' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute end-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-muted hover:text-main transition-colors rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                                        aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className={cn(
                                    "w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300",
                                    "bg-primary text-on-primary hover:bg-primary-hover active:scale-[0.98]",
                                    "disabled:opacity-50 disabled:cursor-not-allowed",
                                    "shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30"
                                )}
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <span>تسجيل الدخول</span>
                                        <ArrowLeft size={18} />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Footer links */}
                        <div className="mt-6 flex flex-col items-center gap-3">
                            <Link
                                to="/"
                                className="text-sm text-muted hover:text-primary transition-colors flex items-center gap-2 font-bold"
                            >
                                <ArrowRight size={16} />
                                <span>العودة للرئيسية</span>
                            </Link>

                            <div className="pt-4 border-t border-border w-full">
                                <a
                                    href={`https://wa.me/${adminPhone}?text=أحتاج مساعدة في تسجيل الدخول`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full h-12 bg-success text-on-success rounded-xl font-bold flex items-center justify-center gap-2 transition-all hover:bg-success/90 active:scale-[0.98]"
                                >
                                    <Headphones size={18} />
                                    <span>الدعم الفني</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
