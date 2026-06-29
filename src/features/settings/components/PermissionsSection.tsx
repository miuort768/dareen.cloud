import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ExternalLink, Users, KeyRound } from 'lucide-react';
import { SectionCard, SectionTitle, FieldLabel, ToggleRow, PrimaryBtn } from './SettingsUI';
import { settingsService } from '../services/settingsService';

const AVAILABLE_PERMISSIONS = [
    { id: '*', label: 'وصول كامل' },
    { id: 'view_students', label: 'عرض الطلاب' },
    { id: 'manage_students', label: 'إدارة الطلاب' },
    { id: 'view_teachers', label: 'عرض المعلمين' },
    { id: 'manage_teachers', label: 'إدارة المعلمين' },
    { id: 'view_finance', label: 'عرض المالية' },
    { id: 'manage_finance', label: 'إدارة المالية' },
    { id: 'settings', label: 'الإعدادات' },
    { id: 'system.users', label: 'إدارة المستخدمين' },
    { id: 'system.backup', label: 'النسخ الاحتياطي' },
    { id: 'system.audit', label: 'سجل التدقيق' },
    { id: 'dashboard', label: 'لوحة التحكم' },
    { id: 'roles', label: 'إدارة الصلاحيات' },
    { id: 'reports', label: 'التقارير' },
    { id: 'evaluations', label: 'التقييمات' },
];

export const PermissionsSection = ({ showNotify }: { showNotify: (msg: string) => void }) => {
    const navigate = useNavigate();
    const [roleName, setRoleName] = useState('');
    const [selectedPerms, setSelectedPerms] = useState<string[]>([]);

    const togglePerm = (id: string) => {
        if (id === '*') {
            setSelectedPerms(selectedPerms.includes('*') ? [] : ['*']);
            return;
        }
        if (selectedPerms.includes('*')) {
            setSelectedPerms([id]);
            return;
        }
        setSelectedPerms(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
    };

    const handleCreateRole = async () => {
        if (!roleName) return;
        showNotify(`تم إنشاء الدور "${roleName}" بنجاح (محاكاة)`);
        setRoleName('');
        setSelectedPerms([]);
    };

    return (
        <div className="space-y-5">
            <SectionCard>
                <SectionTitle icon={Shield} label="الصلاحيات والأدوار" sub="إدارة صلاحيات المستخدمين" />

                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl mb-5">
                    <div className="flex items-center gap-3">
                        <ExternalLink size={16} className="text-purple-600" />
                        <div>
                            <p className="text-sm font-bold text-purple-800">إدارة الأدوار المتقدمة</p>
                            <p className="text-[10px] text-purple-600">صفحة منفصلة لإدارة الأدوار والصلاحيات بشكل متكامل</p>
                        </div>
                    </div>
                    <button onClick={() => navigate('/roles')} className="flex items-center gap-1.5 px-3 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 transition-all">
                        <Users size={14} /> فتح
                    </button>
                </div>
            </SectionCard>

            <SectionCard>
                <SectionTitle icon={KeyRound} label="إنشاء دور مخصص" sub="تحديد صلاحيات مخصصة لدور جديد" />

                <div className="mb-4">
                    <FieldLabel>اسم الدور</FieldLabel>
                    <div className="flex gap-2">
                        <input value={roleName} onChange={e => setRoleName(e.target.value)} placeholder="مثال: مشرف مالي" className="flex-1 bg-slate-50 border border-slate-200 px-3 py-2.5 text-sm font-bold rounded-xl focus:outline-none focus:border-purple-500" />
                        <PrimaryBtn onClick={handleCreateRole}>إنشاء الدور</PrimaryBtn>
                    </div>
                </div>

                <FieldLabel>الصلاحيات</FieldLabel>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 mt-1">
                    {AVAILABLE_PERMISSIONS.map(p => {
                        const isSelected = selectedPerms.includes(p.id) || selectedPerms.includes('*');
                        return (
                            <button
                                key={p.id}
                                onClick={() => togglePerm(p.id)}
                                className={`text-xs font-bold px-3 py-2 rounded-xl border transition-all text-right ${
                                    isSelected
                                        ? 'bg-purple-100 border-purple-300 text-purple-700'
                                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                                }`}
                            >
                                {p.label}
                            </button>
                        );
                    })}
                </div>
            </SectionCard>
        </div>
    );
};
