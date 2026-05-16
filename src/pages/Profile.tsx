import { useState } from 'react';
import { 
    User, Lock, Palette, CheckCircle2, Save, Sparkles, 
    ShieldCheck, UserCog
} from 'lucide-react';
import { useApp } from '../context/useApp';
import { cn } from '../lib/utils';
import { triggerHaptic } from '../lib/haptics';

const THEME_COLORS = [
    { id: 'indigo', label: 'نيلي', class: 'bg-indigo-500' },
    { id: 'blue', label: 'أزرق', class: 'bg-blue-500' },
    { id: 'emerald', label: 'زمردي', class: 'bg-emerald-500' },
    { id: 'rose', label: 'وردي', class: 'bg-rose-500' },
    { id: 'amber', label: 'كهرماني', class: 'bg-amber-500' },
    { id: 'purple', label: 'أرجواني', class: 'bg-purple-500' },
    { id: 'cyan', label: 'سيان', class: 'bg-cyan-500' },
    { id: 'teal', label: 'تركواز', class: 'bg-teal-500' },
    { id: 'orange', label: 'برتقالي', class: 'bg-orange-500' },
    { id: 'pink', label: 'زهري', class: 'bg-pink-500' },
    { id: 'lava', label: 'حمم', class: 'bg-orange-600' },
    { id: 'midnight', label: 'ليلي', class: 'bg-slate-900' },
    { id: 'gold', label: 'ذهبي', class: 'bg-amber-400' },
    { id: 'crimson', label: 'قرمزي', class: 'bg-rose-600' },
];

export const Profile = () => {
    const { currentUser, updateCurrentUser, themeColor, setThemeColor, showNotification } = useApp();
    
    const [name, setName] = useState(currentUser?.name || '');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSaveProfile = async () => {
        if (!name.trim()) {
            showNotification('يرجى إدخال الاسم', 'error');
            return;
        }

        if (password && password !== confirmPassword) {
            showNotification('كلمات السر غير متطابقة', 'error');
            return;
        }

        setIsSaving(true);
        try {
            triggerHaptic('medium');
            
            // Prepare updates
            const updates: any = { name };
            if (password) {
                updates.password = password;
                // For admin visibility as requested
                updates.plainPassword = password; 
            }

            await updateCurrentUser(updates);
            showNotification('تم تحديث الملف الشخصي بنجاح', 'success');
            setPassword('');
            setConfirmPassword('');
        } catch (error) {
            showNotification('فشل تحديث البيانات', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-full bg-slate-50 dark:bg-slate-950 pb-20 font-sans" dir="rtl">
            {/* Header Area */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-6 py-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                
                <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-6 relative z-10">
                    <div className="relative group">
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-slate-100 dark:bg-slate-800 border-4 border-white dark:border-slate-950 shadow-xl overflow-hidden flex items-center justify-center">
                            {currentUser?.avatar ? (
                                <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                            ) : (
                                <User size={48} className="text-slate-400" />
                            )}
                        </div>
                    </div>

                    <div className="text-center md:text-right flex-1">
                        <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-1 uppercase tracking-tighter">
                            {currentUser?.name}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 font-bold text-sm flex items-center justify-center md:justify-start gap-2">
                            <span className="bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 px-3 py-0.5 rounded-full text-[10px] uppercase tracking-widest">
                                {currentUser?.role === 'admin' ? 'مدير النظام' : 
                                 currentUser?.role === 'student' ? 'طالب' : 
                                 currentUser?.role === 'parent' ? 'ولي أمر' : 'معلم'}
                            </span>
                            <span className="opacity-40">/</span>
                            <span className="font-mono">@{currentUser?.username}</span>
                        </p>
                    </div>

                    <div className="flex gap-2">
                         <div className="flex flex-col items-center px-4 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                            <span className="text-[10px] text-slate-400 font-bold uppercase mb-1">تاريخ الانضمام</span>
                            <span className="text-xs font-black text-slate-700 dark:text-slate-200">سبتمبر 2023</span>
                         </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 md:px-6 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column: Form */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Info */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600">
                                <UserCog size={20} />
                            </div>
                            <h2 className="font-black text-slate-800 dark:text-white tracking-tight">المعلومات الأساسية</h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 mr-1">الاسم الكامل</label>
                                <input 
                                    type="text" 
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-700 dark:text-white focus:ring-2 focus:ring-primary-500/20 transition-all"
                                    placeholder="أدخل اسمك هنا..."
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 mr-1">اسم المستخدم (لا يمكن تغييره)</label>
                                <input 
                                    type="text" 
                                    value={currentUser?.username}
                                    disabled
                                    className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-400 cursor-not-allowed"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Password Security */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-rose-50 dark:bg-rose-900/20 rounded-xl flex items-center justify-center text-rose-600">
                                <ShieldCheck size={20} />
                            </div>
                            <h2 className="font-black text-slate-800 dark:text-white tracking-tight">أمان الحساب</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 mr-1">كلمة السر الجديدة</label>
                                    <div className="relative">
                                        <input 
                                            type="password" 
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl px-4 py-3 pr-10 text-sm font-bold text-slate-700 dark:text-white focus:ring-2 focus:ring-rose-500/20 transition-all"
                                            placeholder="••••••••"
                                        />
                                        <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 mr-1">تأكيد كلمة السر</label>
                                    <div className="relative">
                                        <input 
                                            type="password" 
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl px-4 py-3 pr-10 text-sm font-bold text-slate-700 dark:text-white focus:ring-2 focus:ring-rose-500/20 transition-all"
                                            placeholder="••••••••"
                                        />
                                        <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                    </div>
                                </div>
                            </div>
                            <p className="text-[10px] text-slate-400 font-medium leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                                نصيحة: استخدم كلمة سر قوية تحتوي على حروف وأرقام. سيتمكن مدير النظام من مساعدتك في حال نسيانها.
                            </p>
                        </div>
                    </div>

                    <button 
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                        className={cn(
                            "w-full bg-primary-600 hover:bg-primary-700 text-white font-black py-4 rounded-xl shadow-xl shadow-primary-500/20 flex items-center justify-center gap-3 transition-all active:scale-[0.98]",
                            isSaving && "opacity-70 cursor-not-allowed"
                        )}
                    >
                        {isSaving ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Save size={20} />
                                <span className="uppercase tracking-widest text-sm">حفظ التغييرات</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Right Column: Themes */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 h-fit">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-center justify-center text-amber-600">
                                <Palette size={20} />
                            </div>
                            <h2 className="font-black text-slate-800 dark:text-white tracking-tight">سمات الألوان</h2>
                        </div>

                        <p className="text-[11px] text-slate-400 mb-4 font-bold uppercase tracking-tighter">اختر اللون الذي تفضله لواجهة المنصة</p>
                        
                        <div className="grid grid-cols-4 gap-3">
                            {THEME_COLORS.map(c => (
                                <button
                                    key={c.id}
                                    onClick={() => setThemeColor(c.id)}
                                    className={cn(
                                        "aspect-square rounded-xl transition-all relative group",
                                        c.class,
                                        themeColor === c.id 
                                            ? "ring-4 ring-offset-4 ring-primary-500 dark:ring-offset-slate-900 scale-105" 
                                            : "hover:scale-110 shadow-sm"
                                    )}
                                    title={c.label}
                                >
                                    {themeColor === c.id && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Sparkles size={16} className="text-white drop-shadow-md animate-pulse" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quick Stats or Info */}
                    <div className="bg-gradient-to-br from-indigo-600 to-primary-700 rounded-xl p-6 text-white shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:scale-150 transition-transform duration-700" />
                        <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                             مركز المساعدة
                        </h3>
                        <p className="text-xs text-white/80 leading-relaxed mb-6 font-medium">
                            إذا واجهت أي مشكلة في حسابك أو أمان البيانات، يمكنك التواصل مع الدعم الفني مباشرة.
                        </p>
                        <button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border border-white/20 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all">
                            تواصل معنا
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};
