import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ExternalLink, Users, KeyRound, Check, Lock } from 'lucide-react';
import { SectionCard, SectionTitle, FieldLabel, PrimaryBtn } from './SettingsUI';
import { rolesService, type Permission } from '../../roles/services/rolesService';
import { useCurrentUser } from '../../../context/AppContext';
import { cn } from '../../../lib/utils';

const GROUP_LABELS: Record<string, string> = {
    system: 'النظام',
    dashboard: 'لوحة التحكم',
    students: 'الطلاب',
    teachers: 'المعلمين',
    finance: 'المالية',
    sessions: 'الجلسات',
    leads: 'العملاء المحتملين',
};

export const PermissionsSection = ({ showNotify }: { showNotify: (msg: string) => void }) => {
    const navigate = useNavigate();
    const currentUser = useCurrentUser();
    const [roleName, setRoleName] = useState('');
    const [selectedPerms, setSelectedPerms] = useState<string[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);

    const canOpenRoles = !!currentUser && (currentUser.permissions?.includes('*') || currentUser.permissions?.includes('admin'));

    useEffect(() => {
        rolesService.getPermissions()
            .then(setPermissions)
            .catch(e => console.error(e))
            .finally(() => setLoading(false));
    }, []);

    const groups = useMemo(() => {
        const g: Record<string, Permission[]> = {};
        permissions.forEach(p => { (g[p.group] ||= []).push(p); });
        return g;
    }, [permissions]);

    const togglePerm = (key: string) => {
        if (key === '*') {
            setSelectedPerms(selectedPerms.includes('*') ? [] : ['*']);
            return;
        }
        if (selectedPerms.includes('*')) {
            setSelectedPerms([key]);
            return;
        }
        setSelectedPerms(prev => prev.includes(key) ? prev.filter(p => p !== key) : [...prev, key]);
    };

    const handleCreateRole = async () => {
        if (!roleName || !canOpenRoles) return;
        setCreating(true);
        try {
            const role = await rolesService.create({ name: `custom_${Date.now()}`, label: roleName, description: 'دور مخصص تم إنشاؤه من الإعدادات' });
            const selected = permissions.filter(p => selectedPerms.includes(p.key)).map(p => p.id);
            if (selected.length) {
                await rolesService.updatePermissions(role.id, selected);
            }
            showNotify(`تم إنشاء الدور "${roleName}" بنجاح`);
            setRoleName('');
            setSelectedPerms([]);
        } catch (e) {
            showNotify('خطأ في إنشاء الدور: ' + (e instanceof Error ? e.message : 'خطأ غير متوقع'));
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="space-y-5">
            <SectionCard>
                <SectionTitle icon={Shield} label="الصلاحيات والأدوار" sub="إدارة صلاحيات المستخدمين" />

                <div className="flex items-center justify-between p-4 bg-primary-soft rounded-xl border border-primary/10 mb-5">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary-soft flex items-center justify-center shrink-0">
                            <ExternalLink size={16} className="text-primary" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-primary">إدارة الأدوار المتقدمة</p>
                            <p className="text-[11px] text-primary/70">صفحة منفصلة لإدارة الأدوار والصلاحيات بشكل متكامل</p>
                        </div>
                    </div>
                    {canOpenRoles ? (
                        <button
                            onClick={() => navigate('/roles')}
                            className="flex items-center gap-1.5 px-4 py-2.5 bg-primary text-on-primary rounded-xl text-xs font-bold hover:bg-primary-hover active:scale-[0.97] transition-all shadow-sm"
                        >
                            <Users size={14} /> فتح
                        </button>
                    ) : (
                        <span className="flex items-center gap-1.5 px-4 py-2.5 bg-hover text-muted rounded-xl text-xs font-bold" title="يتطلب صلاحية المدير">
                            <Lock size={14} /> يتطلب صلاحية المدير
                        </span>
                    )}
                </div>
            </SectionCard>

            <SectionCard>
                <SectionTitle icon={KeyRound} label="إنشاء دور مخصص" sub="تحديد صلاحيات مخصصة لدور جديد" />

                <div className="mb-5">
                    <FieldLabel>اسم الدور</FieldLabel>
                    <div className="flex gap-2">
                        <input
                            value={roleName}
                            onChange={e => setRoleName(e.target.value)}
                            placeholder="مثال: مشرف مالي"
                            className="flex-1 bg-background border border-border/30 px-4 py-3 text-sm font-bold rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                        />
                        <PrimaryBtn onClick={handleCreateRole} loading={creating}>
                            إنشاء الدور
                        </PrimaryBtn>
                    </div>
                    {!canOpenRoles && (
                        <p className="text-[11px] font-bold text-muted mt-2">إنشاء الأدوار متاح فقط لمدير النظام.</p>
                    )}
                </div>

                {loading ? (
                    <p className="text-xs text-muted py-6 text-center">جاري تحميل الصلاحيات...</p>
                ) : (
                    <div className="space-y-4">
                        {Object.entries(groups).map(([group, perms]) => (
                            <div key={group}>
                                <p className="text-[11px] font-bold text-muted mb-2">{GROUP_LABELS[group] || group}</p>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                    {perms.map(p => {
                                        const isSelected = selectedPerms.includes(p.key) || selectedPerms.includes('*');
                                        return (
                                            <button
                                                key={p.id}
                                                onClick={() => togglePerm(p.key)}
                                                className={cn(
                                                    'text-[11px] font-bold px-3 py-2.5 rounded-xl border transition-all text-start flex items-center gap-2',
                                                    isSelected
                                                        ? 'bg-primary text-on-primary border-primary shadow-sm'
                                                        : 'bg-background border-border/20 text-muted hover:border-primary/50 hover:text-main'
                                                )}
                                            >
                                                {isSelected && <Check size={12} className="shrink-0" />}
                                                {p.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </SectionCard>
        </div>
    );
};
