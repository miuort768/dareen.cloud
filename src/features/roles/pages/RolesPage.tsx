import { useState, useEffect } from 'react';
import { rolesService } from '../services/rolesService';
import type { Role, Permission } from '../services/rolesService';

export const RolesPage = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [selectedPerms, setSelectedPerms] = useState<number[]>([]);
    const [newLabel, setNewLabel] = useState('');
    const [newName, setNewName] = useState('');
    const [newDesc, setNewDesc] = useState('');

    const load = async () => {
        const [r, p] = await Promise.all([rolesService.getAll(), rolesService.getPermissions()]);
        setRoles(r);
        setPermissions(p);
    };

    useEffect(() => { load(); }, []);

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
        load();
    };

    const createRole = async () => {
        if (!newName || !newLabel) return;
        await rolesService.create({ name: newName, label: newLabel, description: newDesc });
        setNewName('');
        setNewLabel('');
        setNewDesc('');
        load();
    };

    const deleteRole = async (id: number) => {
        if (!confirm('Are you sure you want to delete this role?')) return;
        await rolesService.delete(id);
        load();
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
        <div style={{ padding: '20px', direction: 'rtl' }}>
            <h2>إدارة الصلاحيات</h2>

            <div style={{ marginBottom: 24, padding: 16, background: 'var(--bg-surface)', borderRadius: 8 }}>
                <h3>إضافة دور جديد</h3>
                <input placeholder="الاسم (مثل: manager)" value={newName} onChange={e => setNewName(e.target.value)} style={{ marginLeft: 8 }} />
                <input placeholder="التسمية (مثل: مدير)" value={newLabel} onChange={e => setNewLabel(e.target.value)} style={{ marginLeft: 8 }} />
                <input placeholder="وصف" value={newDesc} onChange={e => setNewDesc(e.target.value)} style={{ marginLeft: 8 }} />
                <button onClick={createRole}>إضافة</button>
            </div>

            {roles.map(role => (
                <div key={role.id} style={{ marginBottom: 16, padding: 16, border: '1px solid #ddd', borderRadius: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong>{role.label}</strong>
                        <span style={{ color: '#888' }}>المستخدمون: {role._count?.userRoles || 0}</span>
                    </div>
                    <div style={{ marginTop: 8 }}>
                        <button onClick={() => startEdit(role)} style={{ marginLeft: 8 }}>تعديل الصلاحيات</button>
                        {!role.isSystem && <button onClick={() => deleteRole(role.id)} style={{ color: 'red' }}>حذف</button>}
                    </div>
                </div>
            ))}

            {editingRole && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.50)', display: 'flex',
                    justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div style={{ background: '#fff', padding: 24, borderRadius: 8, maxHeight: '80vh', overflow: 'auto', width: 600 }}>
                        <h3>تعديل: {editingRole.label}</h3>
                        <input value={newLabel} onChange={e => setNewLabel(e.target.value)} style={{ width: '100%', marginBottom: 8 }} />
                        <input value={newDesc} onChange={e => setNewDesc(e.target.value)} style={{ width: '100%', marginBottom: 16 }} />
                        {Object.entries(groups).map(([group, perms]) => (
                            <div key={group} style={{ marginBottom: 16 }}>
                                <h4 style={{ margin: '8px 0', color: '#555' }}>{group}</h4>
                                {perms.map(p => (
                                    <label key={p.id} style={{ display: 'block', margin: '4px 0', cursor: 'pointer' }}>
                                        <input type="checkbox" checked={selectedPerms.includes(p.id)} onChange={() => togglePerm(p.id)} />
                                        {p.label}
                                    </label>
                                ))}
                            </div>
                        ))}
                        <div style={{ marginTop: 16 }}>
                            <button onClick={saveRole} style={{ marginLeft: 8 }}>حفظ</button>
                            <button onClick={() => setEditingRole(null)}>إلغاء</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
