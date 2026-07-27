import { useState, useEffect, useCallback } from 'react';
import { Shield, Plus, X, Save, Trash2, Settings, Users } from 'lucide-react';
import { rolesService } from '../services/rolesService';
import type { Role, Permission } from '../services/rolesService';
import { Checkbox } from '../../../components/ui/checkbox';

const loadData = async () => {
    const [roles, permissions] = await Promise.all([
        rolesService.getAll(),
        rolesService.getPermissions(),
    ]);
    return { roles, permissions };
};

export const RolesPage = () => {
    useEffect(() => { document.title = 'الأدوار والصلاحيات | دارين السابعة للتعليم والتدريب'; }, []);
    const [roles, setRoles] = useState<Role[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [selectedPerms, setSelectedPerms] = useState<number[]>([]);
    const [newLabel, setNewLabel] = useState('');
    const [newName, setNewName] = useState('');
    const [newDesc, setNewDesc] = useState('');

    useEffect(() => {
        loadData().then(({ roles: r, permissions: p }) => {
            setRoles(r);
            setPermissions(p);
        });
    }, []);

    const refresh = useCallback(async () => {
        const { roles: r, permissions: p } = await loadData();
        setRoles(r);
        setPermissions(p);
    }, []);

    const startEdit = (role: Role) => {
        setEditingRole(role);
        setNewLabel(role.label);
        setNewDesc(role.description || '');
        setSelectedPerms((role.permissions || []).map(rp => rp.permission.id));
    };

    const saveRole = async () => {
        if (!editingRole) return;
        await rolesService.update(editingRole.id, { label: newLabel, description: newDesc });
        await rolesService.updatePermissions(editingRole.id, selectedPerms);
        setEditingRole(null);
        refresh();
    };

    const createRole = async () => {
        if (!newName || !newLabel) return;
        await rolesService.create({ name: newName, label: newLabel, description: newDesc });
        setNewName('');
        setNewLabel('');
        setNewDesc('');
        refresh();
    };

    const deleteRole = async (id: number) => {
        if (!confirm('هل أنت متأكد من حذف هذا الدور؟')) return;
        await rolesService.delete(id);
        refresh();
    };

    const togglePerm = (permId: number) => {
        setSelectedPerms(prev =>
            prev.includes(permId) ? prev.filter(id => id !== permId) : [...prev, permId]
        );
    };

    const groups = permissions.reduce<Record<string, Permission[]>>((acc, p) => {
        if (!acc[p.group]) acc[p.group] = [];
        acc[p.group].push(p);
        return acc;
    }, {});

    return (
        <div className="min-h-full pb-24 relative" dir="rtl">
            <div className="max-w-page mx-auto px-2 py-4 space-y-4">
                <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-primary-soft rounded-card flex items-center justify-center">
                    <Shield size={20} className="text-primary" />
                </div>
                <div>
                    <h1 className="text-xl font-bold font-heading text-main">إدارة الصلاحيات</h1>
                    <p className="text-sm text-muted">{roles.length} دور · {permissions.length} صلاحية</p>
                </div>
            </div>

            <div className="bg-surface border border-border rounded-card p-5 mb-6">
                <h3 className="text-sm font-bold text-main flex items-center gap-2 mb-4">
                    <Plus size={16} className="text-primary" /> إضافة دور جديد
                </h3>
                <div className="flex flex-wrap gap-3">
                    <input
                        aria-label="الاسم التقني"
                        placeholder="الاسم (مثل: manager)"
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        className="flex-1 min-w-[140px] px-3 py-2 bg-card border border-border rounded-card text-sm text-main focus:outline-none focus:ring-2 focus:ring-focus placeholder:text-muted"
                    />
                    <input
                        aria-label="التسمية"
                        placeholder="التسمية (مثل: مدير)"
                        value={newLabel}
                        onChange={e => setNewLabel(e.target.value)}
                        className="flex-1 min-w-[140px] px-3 py-2 bg-card border border-border rounded-card text-sm text-main focus:outline-none focus:ring-2 focus:ring-focus placeholder:text-muted"
                    />
                    <input
                        aria-label="الوصف"
                        placeholder="وصف"
                        value={newDesc}
                        onChange={e => setNewDesc(e.target.value)}
                        className="flex-1 min-w-[140px] px-3 py-2 bg-card border border-border rounded-card text-sm text-main focus:outline-none focus:ring-2 focus:ring-focus placeholder:text-muted"
                    />
                    <button
                        onClick={createRole}
                        className="px-5 py-2 bg-primary hover:bg-primary-hover text-on-primary text-sm font-bold rounded-card transition-all flex items-center gap-2"
                    >
                        <Plus size={16} /> إضافة
                    </button>
                </div>
            </div>

            <div className="space-y-3">
                {roles.map(role => (
                    <div key={role.id} className="bg-card border border-border rounded-card p-5 shadow-soft">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-primary-soft rounded-card flex items-center justify-center">
                                    <Settings size={16} className="text-primary" />
                                </div>
                                <div>
                                    <strong className="text-sm font-bold text-main block">{role.label}</strong>
                                    <span className="text-xs text-muted">{role.name}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted">
                                <Users size={14} />
                                <span>{role._count?.userRoles || 0}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border">
                            <button
                                onClick={() => startEdit(role)}
                                className="px-4 py-1.5 bg-primary-soft text-primary text-xs font-bold rounded-card hover:bg-primary hover:text-on-primary transition-all"
                            >
                                تعديل الصلاحيات
                            </button>
                            {!role.isSystem && (
                                <button
                                    onClick={() => deleteRole(role.id)}
                                    className="px-4 py-1.5 bg-error/10 text-error text-xs font-bold rounded-card hover:bg-error hover:text-on-error transition-all flex items-center gap-1"
                                >
                                    <Trash2 size={14} /> حذف
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {editingRole && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                    onClick={() => setEditingRole(null)}
                >
                    <div
                        className="bg-card border border-border rounded-card shadow-soft w-full max-w-lg max-h-[85vh] overflow-y-auto p-6"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-bold font-heading text-main flex items-center gap-2">
                                <Settings size={18} className="text-primary" /> تعديل: {editingRole.label}
                            </h3>
                            <button
                                onClick={() => setEditingRole(null)}
                                aria-label="إغلاق"
                                className="w-8 h-8 flex items-center justify-center text-muted hover:text-main hover:bg-surface rounded-card transition-all"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="space-y-3 mb-5">
                            <input
                                aria-label="التسمية"
                                value={newLabel}
                                onChange={e => setNewLabel(e.target.value)}
                                className="w-full px-3 py-2 bg-surface border border-border rounded-card text-sm text-main focus:outline-none focus:ring-2 focus:ring-focus"
                            />
                            <input
                                aria-label="الوصف"
                                value={newDesc}
                                onChange={e => setNewDesc(e.target.value)}
                                className="w-full px-3 py-2 bg-surface border border-border rounded-card text-sm text-main focus:outline-none focus:ring-2 focus:ring-focus"
                            />
                        </div>

                        {Object.entries(groups).map(([group, perms]) => (
                            <div key={group} className="mb-4">
                                <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-2">{group}</h4>
                                <div className="space-y-1">
                                    {perms.map(p => (
                                        <label
                                            key={p.id}
                                            className="flex items-center gap-2 p-2 rounded-card cursor-pointer hover:bg-surface transition-colors"
                                        >
                                            <Checkbox
                                                checked={selectedPerms.includes(p.id)}
                                                onCheckedChange={() => togglePerm(p.id)}
                                                aria-label={p.label}
                                            />
                                            <span className="text-sm text-main">{p.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}

                        <div className="flex items-center gap-3 mt-6 pt-4 border-t border-border">
                            <button
                                onClick={saveRole}
                                className="flex-1 px-4 py-2.5 bg-primary hover:bg-primary-hover text-on-primary text-sm font-bold rounded-card transition-all flex items-center justify-center gap-2"
                            >
                                <Save size={16} /> حفظ
                            </button>
                            <button
                                onClick={() => setEditingRole(null)}
                                className="px-4 py-2.5 bg-surface hover:bg-hover text-main text-sm font-bold rounded-card transition-all"
                            >
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
};
