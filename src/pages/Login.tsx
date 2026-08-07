import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User, Eye, EyeOff, ArrowRight, Headphones, ArrowLeft } from 'lucide-react';
import { triggerHaptic } from '../lib/haptics';
import { useLogin, useAcademyName } from '../context/AppContext';
import { useAuthStore } from '../store/authStore';
import { useSettingsStore } from '../store/settingsStore';
import { SEO } from '../components/SEO';
import { MobileHeader } from '../components/public/MobileHeader';
import { PublicNavbar } from '../components/public/PublicNavbar';
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
                const savedUser = useAuthStore.getState().currentUser;
                if (savedUser?.role === 'chat_user') {
                    navigate('/chat', { replace: true });
                } else if (savedUser?.role === 'parent') {
                    navigate('/parent-dashboard', { replace: true });
                } else if (savedUser?.role === 'student') {
                    navigate('/student-dashboard', { replace: true });
                } else if (savedUser?.role === 'teacher') {
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
        <div className="min-h-screen font-sans relative">
            <SEO title="تسجيل الدخول" description="تسجيل دخول الطلاب والمعلمين وأولياء الأمور إلى منصة دارين السابعة" url="https://dareen.cloud/login" image="/dareen_logo_new.jpg" breadcrumbs={[{ name: 'الرئيسية', item: '/' }, { name: 'تسجيل الدخول', item: '/login' }]} />

            {/* Mobile Header */}
            <div className="lg:hidden relative z-20">
                <MobileHeader />
            </div>

            {/* Desktop Navbar */}
            <div className="hidden lg:block relative z-20">
                <PublicNavbar />
            </div>

            {/* Desktop: Full Background Image */}
            <div className="hidden lg:block fixed inset-0">
                <img
                    src="/login1.png"
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-l from-white/80 via-white/50 to-transparent dark:from-background/80 dark:via-background/50 dark:to-transparent" />
            </div>

            {/* Form — Centered on both */}
            <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-60px)] lg:min-h-screen px-4 py-8 lg:pt-24">
                <div className="w-full max-w-sm lg:max-w-md">
                    <div className="mb-8 lg:mb-10 text-center">
                        <p className="text-primary font-bold text-sm lg:text-base mb-1">منصة دارين السابعة</p>
                        <h1 className="text-2xl lg:text-3xl font-black text-main mb-2 font-heading">تسجيل الدخول</h1>
                        <p className="text-muted text-sm lg:text-base font-medium">أدخل بياناتك للوصول إلى حسابك</p>
                        <p className="text-muted/50 text-[10px] lg:text-xs mt-2 tracking-widest font-light italic">AHMED ABDULLAH</p>
                    </div>

                    {error && (
                        <div className="mb-4 p-4 bg-error-soft border border-error/20 rounded-xl">
                            <p className="text-sm font-bold text-error">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-5">
                        <div>
                            <label htmlFor="login-username" className="text-xs lg:text-sm font-bold text-muted mb-1.5 block">اسم المستخدم</label>
                            <div className="relative">
                                <User size={18} className="absolute start-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                                <input
                                    id="login-username"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="أدخل اسم المستخدم"
                                    required
                                    className="w-full h-12 lg:h-14 bg-surface border border-border rounded-xl ps-12 pe-4 text-sm lg:text-base text-main placeholder:text-muted outline-none transition-all focus:border-primary focus:ring-2 focus:ring-focus"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="login-password" className="text-xs lg:text-sm font-bold text-muted mb-1.5 block">كلمة المرور</label>
                            <div className="relative">
                                <Lock size={18} className="absolute start-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                                <input
                                    id="login-password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="أدخل كلمة المرور"
                                    required
                                    className="w-full h-12 lg:h-14 bg-surface border border-border rounded-xl ps-12 pe-12 text-sm lg:text-base text-main placeholder:text-muted outline-none transition-all focus:border-primary focus:ring-2 focus:ring-focus"
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

                        <button
                            type="submit"
                            disabled={loading}
                            className={cn(
                                "w-full h-12 lg:h-14 rounded-xl font-bold text-sm lg:text-base flex items-center justify-center gap-2 transition-all duration-300",
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

                    <div className="mt-6 lg:mt-8 flex flex-col items-center gap-3">
                        <Link
                            to="/"
                            className="text-sm lg:text-base text-warning-dark hover:text-warning transition-colors flex items-center gap-2 font-bold"
                        >
                            <ArrowRight size={16} />
                            <span>العودة للرئيسية</span>
                        </Link>

                        <div className="pt-4 border-t border-border w-full">
                            <a
                                href={`https://wa.me/${adminPhone}?text=أحتاج مساعدة في تسجيل الدخول`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full h-12 lg:h-14 bg-success text-on-success rounded-xl font-bold flex items-center justify-center gap-2 transition-all hover:bg-success/90 active:scale-[0.98] text-sm lg:text-base"
                            >
                                <Headphones size={18} />
                                <span>الدعم الفني</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
