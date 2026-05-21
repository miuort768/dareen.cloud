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
        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mr-1">{label}</label>
        <div className="relative group">
            <div className="absolute right-0 top-0 bottom-0 w-10 flex items-center justify-center bg-slate-100 dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 text-slate-400 group-focus-within:bg-indigo-600 group-focus-within:text-white transition-all">
                <Icon size={14} />
            </div>
            <input
                {...props}
                className={cn(
                    "w-full pl-4 pr-12 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none text-xs font-bold transition-all focus:border-indigo-600 rounded-none dark:text-white",
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
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-none shadow-sm relative overflow-hidden">
            {/* Header Accent */}
            <div className="h-1 w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600" />
            
            <div className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 flex items-center justify-center bg-indigo-600 text-white rounded-none">
                        <ShieldCheck size={18} />
                    </div>
                    <div>
                        <h3 className="font-black text-sm text-slate-800 dark:text-white uppercase tracking-widest">
                            {isEdit ? 'تحديث ملف ولي الأمر' : 'تسجيل ولي أمر جديد بالنظام'}
                        </h3>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">تأكد من صحة البيانات لضمان وصول الإشعارات</p>
                    </div>
                </div>

                <form onSubmit={onSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-8">
                        {/* Name */}
                        <InputField
                            label="الاسم الكامل"
                            icon={User}
                            required
                            type="text"
                            value={formData.name}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...formData, name: e.target.value })}

                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...formData, phone: e.target.value })}

                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...formData, email: e.target.value })}

                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...formData, username: e.target.value })}

                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...formData, password: e.target.value })}
                            placeholder={isEdit ? "••••••••" : "Create password"}
                        />
                    </div>

                    <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                        <button
                            type="submit"
                            className="group flex items-center gap-3 bg-slate-950 hover:bg-indigo-600 text-white px-10 py-4 font-black text-[10px] uppercase tracking-[0.2em] transition-all rounded-none shadow-xl active:scale-95"
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
