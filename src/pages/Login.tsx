import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User, Eye, EyeOff, ArrowRight, Headphones, ArrowLeft } from 'lucide-react';
import { triggerHaptic } from '../lib/haptics';
import { useLogin, useAcademyName } from '../context/AppContext';
import { useAuthStore } from '../store/authStore';
import { useSettingsStore } from '../store/settingsStore';
import { SEO } from '../components/SEO';
import { PublicNavbar } from '../components/public/PublicNavbar';
import { cn } from '../lib/utils';

const TYPEWRITER_PHRASES = [
    'أفضل مدرسة افتراضية عربية',
    'طموح لا يعرف الحدود',
    'تعليم بلا حدود',
    'نصنع المستقبل',
];

const BookVector = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 120 120" fill="none" className={className}>
        <rect x="20" y="25" width="80" height="70" rx="8" fill="currentColor" opacity="0.12" />
        <rect x="28" y="30" width="64" height="60" rx="4" stroke="currentColor" strokeWidth="2" opacity="0.3" />
        <path d="M60 30V90" stroke="currentColor" strokeWidth="1.5" opacity="0.2" />
        <path d="M35 45h18M35 55h14M35 65h16M67 45h18M67 55h14M67 65h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.25" />
        <circle cx="60" cy="15" r="8" fill="currentColor" opacity="0.1" />
    </svg>
);

const GraduationCapVector = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 120 120" fill="none" className={className}>
        <path d="M60 20L15 45L60 70L105 45L60 20Z" fill="currentColor" opacity="0.12" />
        <path d="M60 20L15 45L60 70L105 45L60 20Z" stroke="currentColor" strokeWidth="2" opacity="0.3" />
        <path d="M30 52V78C30 78 42 90 60 90C78 90 90 78 90 78V52" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.25" />
        <path d="M105 45V75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.2" />
        <circle cx="105" cy="78" r="3" fill="currentColor" opacity="0.2" />
    </svg>
);

const LightbulbVector = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 120 120" fill="none" className={className}>
        <path d="M60 15C42 15 28 29 28 47C28 59 35 67 45 73V82C45 84 47 86 49 86H71C73 86 75 84 75 82V73C85 67 92 59 92 47C92 29 78 15 60 15Z" fill="currentColor" opacity="0.1" />
        <path d="M60 15C42 15 28 29 28 47C28 59 35 67 45 73V82C45 84 47 86 49 86H71C73 86 75 84 75 82V73C85 67 92 59 92 47C92 29 78 15 60 15Z" stroke="currentColor" strokeWidth="2" opacity="0.3" />
        <path d="M46 92H74" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.25" />
        <path d="M48 97H72" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.2" />
        <path d="M52 102H68" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.15" />
        <path d="M60 47V60M52 55H68" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.35" />
    </svg>
);

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

    const [typewriterText, setTypewriterText] = useState('');
    const [phraseIndex, setPhraseIndex] = useState(0);

    useEffect(() => {
        document.title = `تسجيل الدخول — ${academyName}`;
    }, [academyName]);

    useEffect(() => {
        const fullText = TYPEWRITER_PHRASES[phraseIndex];
        let i = 0;
        let isDeleting = false;
        let typingSpeed = 100;

        const type = () => {
            const currentText = isDeleting
                ? fullText.substring(0, i - 1)
                : fullText.substring(0, i + 1);
            setTypewriterText(currentText);
            i = isDeleting ? i - 1 : i + 1;

            if (!isDeleting && i === fullText.length) {
                isDeleting = true;
                typingSpeed = 2000;
            } else if (isDeleting && i === 0) {
                isDeleting = false;
                setPhraseIndex((prev) => (prev + 1) % TYPEWRITER_PHRASES.length);
                typingSpeed = 400;
            } else {
                typingSpeed = isDeleting ? 50 : 100;
            }

            timer = setTimeout(type, typingSpeed);
        };

        let timer = setTimeout(type, typingSpeed);
        return () => clearTimeout(timer);
    }, [phraseIndex]);

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
        <div className="min-h-screen bg-white dark:bg-background font-sans relative overflow-hidden">
            <SEO title="تسجيل الدخول" description="تسجيل دخول الطلاب والمعلمين وأولياء الأمور إلى منصة دارين السابعة" url="https://dareen.cloud/login" image="/dareen_logo_new.jpg" breadcrumbs={[{ name: 'الرئيسية', item: '/' }, { name: 'تسجيل الدخول', item: '/login' }]} />

            <div className="hidden md:block absolute top-0 w-full z-50">
                <PublicNavbar />
            </div>

            <div className="w-full min-h-screen flex flex-col md:flex-row items-center justify-center">

                {/* ===== Hero Section (Desktop) ===== */}
                <div className="hidden lg:flex lg:w-[45%] h-screen sticky top-0 bg-gradient-to-bl from-primary/5 via-white to-primary/10 dark:from-primary/10 dark:via-background dark:to-primary/5 relative overflow-hidden">
                    {/* Decorative floating shapes */}
                    <div className="absolute top-20 end-12 text-primary/20 animate-float" style={{ animationDuration: '6s' }}>
                        <BookVector className="w-24 h-24" />
                    </div>
                    <div className="absolute bottom-32 start-16 text-primary/15 animate-float" style={{ animationDuration: '8s', animationDelay: '1s' }}>
                        <GraduationCapVector className="w-28 h-28" />
                    </div>
                    <div className="absolute top-1/3 start-20 text-warning/15 animate-float" style={{ animationDuration: '7s', animationDelay: '0.5s' }}>
                        <LightbulbVector className="w-20 h-20" />
                    </div>

                    {/* Gradient orbs */}
                    <div className="absolute top-1/4 end-1/4 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
                    <div className="absolute bottom-1/4 start-1/3 w-48 h-48 bg-accent/10 rounded-full blur-[80px] pointer-events-none" />

                    <div className="relative z-10 flex flex-col justify-center items-center w-full p-12">
                        <h1 className="text-3xl xl:text-4xl font-black text-center leading-tight mb-4 font-heading text-main">
                            مرحباً بك في
                            <br />
                            <span className="text-primary">{academyName}</span>
                        </h1>

                        {/* Typewriter */}
                        <div className="h-10 flex items-center justify-center mb-6">
                            <span className="text-lg font-bold text-primary/80">
                                {typewriterText}
                            </span>
                            <span className="inline-block w-[2px] h-5 bg-primary ms-1 animate-pulse" />
                        </div>

                        <p className="text-muted text-sm text-center max-w-sm leading-relaxed mb-10">
                            منصة تعليمية متكاملة للطلاب والمعلمين وأولياء الأمور
                        </p>

                        {/* Feature highlights */}
                        <div className="flex items-center gap-8">
                            {[
                                { icon: '🎓', label: 'تعليم متميز' },
                                { icon: '📚', label: 'محتوى غني' },
                                { icon: '⭐', label: 'جودة عالية' },
                            ].map((item) => (
                                <div key={item.label} className="flex flex-col items-center gap-2">
                                    <div className="w-14 h-14 rounded-2xl bg-primary-soft flex items-center justify-center text-2xl shadow-sm">
                                        {item.icon}
                                    </div>
                                    <span className="text-xs font-bold text-muted">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ===== Form Section ===== */}
                <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-8 lg:px-20 py-8 lg:py-0">
                    <div className="w-full max-w-sm">
                        {/* Mobile Hero */}
                        <div className="lg:hidden text-center mb-8">
                            <h1 className="text-xl font-black text-warning-dark font-heading mb-2">أهلاً بعودتك شريك النجاح</h1>
                            <div className="h-7 flex items-center justify-center">
                                <span className="text-sm font-bold text-primary/80">{typewriterText}</span>
                                <span className="inline-block w-[2px] h-4 bg-primary ms-1 animate-pulse" />
                            </div>
                        </div>

                        <div className="mb-8">
                            <h2 className="text-2xl lg:text-3xl font-black text-main mb-2 font-heading">تسجيل الدخول</h2>
                            <p className="text-muted text-sm font-medium">أدخل بياناتك للوصول إلى حسابك</p>
                        </div>

                        {error && (
                            <div className="mb-4 p-4 bg-error-soft border border-error/20 rounded-xl">
                                <p className="text-sm font-bold text-error">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
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
                                        className="w-full h-12 bg-surface border border-border rounded-xl ps-12 pe-4 text-sm text-main placeholder:text-muted outline-none transition-all focus:border-primary focus:ring-2 focus:ring-focus"
                                    />
                                </div>
                            </div>

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
                                        className="w-full h-12 bg-surface border border-border rounded-xl ps-12 pe-12 text-sm text-main placeholder:text-muted outline-none transition-all focus:border-primary focus:ring-2 focus:ring-focus"
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

                        <div className="mt-6 flex flex-col items-center gap-3">
                            <Link
                                to="/"
                                className="text-sm text-warning-dark hover:text-warning transition-colors flex items-center gap-2 font-bold"
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
