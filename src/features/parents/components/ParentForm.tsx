import React from 'react';
import { User, Save, ShieldCheck } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface ParentFormProps {
    isEdit: boolean;
    formData: { name: string; phone: string; email: string; username?: string; password?: string };
    onChange: (data: { name: string; phone: string; email: string; username?: string; password?: string }) => void;
    onSubmit: (e: React.FormEvent) => void;
}

const InputField = ({ label, icon: Icon, ...props }: { label: string; icon: React.ComponentType<{ size?: number }>; } & Record<string, unknown>) => (
    <div className="space-y-1.5">
        <label className="text-[9px] font-medium text-slate-400 uppercase tracking-widest mr-1">{label}</label>
        <div className="relative group">
            <div className="absolute right-0 top-0 bottom-0 w-10 flex items-center justify-center bg-[#6C4BFF]/10 text-[#6C4BFF] border-l border-[#6C4BFF]/10 group-focus-within:bg-[#6C4BFF] group-focus-within:text-white transition-all rounded-r-xl">
                <Icon size={14} />
            </div>
            <input
                {...props}
                className={cn(
                    "w-full pl-4 pr-12 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none text-xs font-normal transition-all focus:border-[#6C4BFF] dark:text-white rounded-xl",
                    props.className
                )}
            />
        </div>
    </div>
);

export const ParentForm: React.FC<ParentFormProps> = ({
    isEdit,
    formData,
    onChange,
    onSubmit
}) => {
    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden rounded-2xl">
            {/* Header */}
            <div className="bg-gradient-to-l from-[#6C4BFF] to-[#8B5CF6] p-6 md:p-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center bg-white/15 backdrop-blur-sm text-white rounded-xl">
                        <ShieldCheck size={18} />
                    </div>
                    <div>
                        <h3 className="font-medium text-sm text-white uppercase tracking-widest">
                            {isEdit ? 'تحديث ملف ولي الأمر' : 'تسجيل ولي أمر جديد بالنظام'}
                        </h3>
                        <p className="text-[9px] text-white/70 font-normal uppercase tracking-widest mt-0.5">تأكد من صحة البيانات لضمان وصول الإشعارات</p>
                    </div>
                </div>
            </div>

            <div className="p-6 md:p-8">
                <form onSubmit={onSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-8">
                        <InputField label="الاسم الكامل" icon={User} required type="text" value={formData.name}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...formData, name: e.target.value })} />
                        <InputField label="رقم الجوال" icon={User} required type="tel" value={formData.phone}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...formData, phone: e.target.value })} />
                        <InputField label="البريد الإلكتروني" icon={User} type="email" value={formData.email}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...formData, email: e.target.value })} />
                        {!isEdit && <InputField label="اسم المستخدم" icon={User} type="text" value={formData.username || ''}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...formData, username: e.target.value })} />}
                        {!isEdit && <InputField label="كلمة المرور" icon={User} type="password" placeholder="إنشاء كلمة مرور"
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...formData, password: e.target.value })} />}
                    </div>

                    <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                        <button
                            type="submit"
                            className="group flex items-center gap-3 bg-gradient-to-l from-[#6C4BFF] to-[#8B5CF6] hover:from-[#5A3FE0] hover:to-[#7C4DE6] text-white px-10 py-4 font-bold text-[10px] uppercase tracking-[0.2em] transition-all shadow-sm active:scale-95 rounded-xl"
                        >
                            <Save size={14} className="group-hover:rotate-12 transition-transform" />
                            {isEdit ? 'تحديث البيانات' : 'حفظ وتسجيل الحساب'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
