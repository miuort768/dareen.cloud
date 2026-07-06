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
import { Card } from '../shared/components/ui/Card';
import { Input } from '../shared/components/ui/Input';
import { Button } from '../shared/components/ui/Button';
import { Alert } from '../shared/components/ui/Alert';

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
                setTimeout(type, isDeleting ? 2000 : 1000);
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
        <div className="min-h-screen bg-surface flex font-sans overflow-x-hidden overflow-y-auto relative transition-colors duration-500">
            <SEO title="تسجيل الدخول | دارين السابعة - منصة تعليم عن بعد" description="تسجيل دخول الطلاب، المعلمين، وأولياء الأمور إلى منصة دارين السابعة للتعليم عن بعد. متابعة الحصص، الجدول الدراسي، والنتائج من مكان واحد." url="https://dareen.cloud/login" image="/dareen_logo_new.jpg" breadcrumbs={[{ name: 'الرئيسية', item: '/' }, { name: 'تسجيل الدخول', item: '/login' }]} />

            <div className="hidden md:block absolute top-0 w-full z-50">
                <PublicNavbar />
            </div>

            <div className="w-full min-h-screen flex flex-col md:flex-row justify-center items-start md:items-center max-w-7xl mx-auto relative z-10 px-4 pt-24 pb-12 md:pt-32">

                {/* Visual Section */}
                <div className="hidden md:flex md:w-1/2 bg-transparent relative flex-col justify-center items-center">
                    <div className="absolute inset-0 z-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(var(--text-main) 0.5px, transparent 0.5px)', backgroundSize: '32px 32px' }}></div>
                    
                    <div className="relative z-10 w-full max-w-md flex flex-col items-start justify-center p-8 text-right" dir="rtl">
                        <div className="mb-10 w-full">
                            <div className="inline-flex items-center gap-3 bg-main px-5 py-2.5 border-l-4 border-accent shadow-md mb-10">
                                <CheckCircle className="text-accent" size={18} />
                                <span className="text-xs font-black text-inverse uppercase tracking-[0.2em]">أفضل مدرسة افتراضية</span>
                            </div>

                            <div className="flex items-center gap-3 mb-6">
                                <Sparkles className="text-accent" size={28} />
                                <span className="text-sm font-black uppercase text-main tracking-[0.2em]">منصة دارين السابعة</span>
                            </div>
                            
                            <h2 className="text-section font-bold text-main mb-8 leading-tight border-r-8 border-success pr-8 min-h-[4.5rem]">
                                {typedText}
                                <span className="inline-block w-[5px] h-7 bg-success mr-2 animate-pulse align-middle"></span>
                            </h2>
                            <p className="text-primary text-base font-bold max-w-md leading-relaxed">بدايتك المثالية للنجاح الأكاديمي والمهني برؤية تعليمية عالمية</p>
                            <p className="text-muted text-sm font-bold mt-2">نحو مستقبل مشرق بالتميز والإبداع</p>
                        </div>

                        <div className="grid grid-cols-1 gap-5 w-full">
                            <div className="bg-white/60 dark:bg-primary-active/60 backdrop-blur-sm border border-border/60 p-6 flex items-center gap-6 border-r-4 border-r-error">
                                <div className="w-12 h-12 bg-error-soft flex items-center justify-center text-error border border-border rounded-card">
                                    <Users size={24} />
                                </div>
                                <div className="text-right">
                                    <div className="text-xs font-black text-muted uppercase tracking-widest mb-1">ثقة الطلاب</div>
                                    <div className="text-card-title font-black text-main">+5,000 طالب</div>
                                </div>
                            </div>

                            <div className="bg-white/60 dark:bg-primary-active/60 backdrop-blur-sm border border-border/60 p-6 flex items-center gap-6 border-r-4 border-r-success">
                                <div className="w-12 h-12 bg-success-soft flex items-center justify-center text-success border border-border rounded-card">
                                    <Trophy size={24} />
                                </div>
                                <div className="text-right">
                                    <div className="text-xs font-black text-muted uppercase tracking-widest mb-1">إنجازاتنا</div>
                                    <div className="text-card-title font-black text-main">نخبة الأوائل</div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex flex-wrap gap-8">
                            <div className="flex items-center gap-3">
                                <ShieldCheck size={20} className="text-accent" />
                                <span className="text-xs font-black tracking-widest uppercase text-accent">بيئة آمنة</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Star size={20} className="text-accent" />
                                <span className="text-xs font-black tracking-widest uppercase text-accent">جودة معيارية</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <GraduationCap size={20} className="text-accent" />
                                <span className="text-xs font-black tracking-widest uppercase text-accent">كادر عالمي</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Login Form Section */}
                <div className="w-full md:w-1/2 flex items-center justify-center p-4 sm:p-8 lg:p-12 bg-transparent">
                    <div className="w-full max-w-md relative z-10">
                        <div className="text-center mb-8">
                            <div className="w-24 h-24 sm:w-28 sm:h-28 bg-main rounded-card flex items-center justify-center text-inverse mx-auto mb-6 relative shadow-card overflow-visible">
                                <Crown className="absolute -top-7 -left-3 text-accent drop-shadow-lg transform -rotate-12 z-30" size={50} strokeWidth={2.5} fill="var(--bg-accent)" />

                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center gap-1.5 z-20 w-40 mt-1">
                                    <div className="relative w-14 h-14 bg-card rounded-card border-[5px] border-error overflow-hidden shadow-inner flex shrink-0">
                                        <div className="absolute inset-0 flex items-center justify-center bg-surface/50">
                                            <div className={`w-4 h-4 bg-main rounded-full transition-transform duration-300 ${isPasswordFocused ? 'translate-y-6 scale-90' : 'scale-100'} relative`}>
                                                <div className="absolute top-0.5 right-0.5 w-1 h-1 bg-card rounded-full opacity-90"></div>
                                            </div>
                                        </div>
                                        <div className={`absolute top-0 left-0 w-full bg-main transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] z-10 ${isPasswordFocused ? 'h-full' : 'h-0'}`} />
                                    </div>

                                    <div className="w-4 h-1.5 bg-main rounded-full shrink-0 -mt-2"></div>

                                    <div className="relative w-14 h-14 bg-card rounded-card border-[5px] border-success overflow-hidden shadow-inner flex shrink-0">
                                        <div className="absolute inset-0 flex items-center justify-center bg-surface/50">
                                            <div className={`w-4 h-4 bg-main rounded-full transition-transform duration-300 ${isPasswordFocused ? 'translate-y-6 scale-90' : 'scale-100'} relative`}>
                                                <div className="absolute top-0.5 right-0.5 w-1 h-1 bg-card rounded-full opacity-90"></div>
                                            </div>
                                        </div>
                                        <div className={`absolute top-0 left-0 w-full bg-main transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] z-10 ${isPasswordFocused ? 'h-full' : 'h-0'}`} />
                                    </div>
                                </div>
                            </div>

                            <h1 className="text-section font-bold text-main mb-2 font-heading tracking-tight">أهلاً بك في دارين</h1>
                            <p className="text-muted font-bold text-sm sm:text-base">يرجى تسجيل الدخول للمتابعة إلى حسابك</p>
                        </div>

                        <Card variant="elevated" hoverLift={false}>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {error && (
                                    <Alert variant="error" className="text-sm font-bold">
                                        {error}
                                    </Alert>
                                )}

                                <Input
                                    label="اسم المستخدم"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="أدخل اسم المستخدم..."
                                    leftIcon={<User size={20} className="text-dim" />}
                                    required
                                />

                                <div className="relative">
                                    <Input
                                        label="كلمة المرور"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onFocus={() => setIsPasswordFocused(true)}
                                        onBlur={() => setIsPasswordFocused(false)}
                                        placeholder="أدخل كلمة المرور..."
                                        leftIcon={<Lock size={20} className="text-dim" />}
                                        required
                                        className="pl-10"
                                        style={{ fontFamily: showPassword ? 'inherit' : 'caption' } as React.CSSProperties}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute left-3 top-[38px] text-dim hover:text-main transition-colors"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>

                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="md"
                                    isLoading={loading}
                                    className="w-full"
                                >
                                    <span>دخول للحساب</span>
                                    <ArrowRight size={18} />
                                </Button>

                                <div className="flex justify-center pt-2">
                                    <Link 
                                        to="/" 
                                        className="text-sm text-success font-bold hover:text-success-dark transition-colors flex items-center gap-2"
                                    >
                                        <ArrowRight size={16} className="rotate-180" />
                                        <span>العودة للرئيسية</span>
                                    </Link>
                                </div>
                            </form>
                        </Card>

                        <div className="mt-4 pt-4 border-t border-border flex flex-col gap-1.5">
                            <a
                                href={`https://wa.me/${adminPhone}?text=أحتاج مساعدة في تسجيل الدخول`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full bg-main text-inverse py-3.5 rounded-card font-bold flex items-center justify-center gap-3 transition-all hover:opacity-90 active:scale-[0.98] shadow-card"
                            >
                                <Headphones size={20} />
                                <span>تواصل مع الدعم الفني</span>
                            </a>
                            <p className="text-center text-xs text-muted font-bold">متاح على مدار الساعة للمساعدة</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
