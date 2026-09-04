import { useState, useEffect, useCallback } from 'react'
import { Shield, Plus, X, Save, Trash2, Settings, Users } from 'lucide-react'
import { rolesService } from '../services/rolesService'
import type { Role, Permission } from '../services/rolesService'
import { Checkbox } from '../../../components/ui/checkbox'

const loadData = async () => {
  const [roles, permissions] = await Promise.all([
    rolesService.getAll(),
    rolesService.getPermissions(),
  ])
  return { roles, permissions }
}

export const RolesPage = () => {
  useEffect(() => {
    document.title = 'الأدوار والصلاحيات | دارين السابعة للتعليم والتدريب'
  }, [])
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [selectedPerms, setSelectedPerms] = useState<number[]>([])
  const [newLabel, setNewLabel] = useState('')
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')

  useEffect(() => {
    loadData().then(({ roles: r, permissions: p }) => {
      setRoles(r)
      setPermissions(p)
    })
  }, [])

  const refresh = useCallback(async () => {
    const { roles: r, permissions: p } = await loadData()
    setRoles(r)
    setPermissions(p)
  }, [])

  const startEdit = (role: Role) => {
    setEditingRole(role)
    setNewLabel(role.label)
    setNewDesc(role.description || '')
    setSelectedPerms((role.permissions || []).map((rp) => rp.permission.id))
  }

  const saveRole = async () => {
    if (!editingRole) return
    await rolesService.update(editingRole.id, { label: newLabel, description: newDesc })
    await rolesService.updatePermissions(editingRole.id, selectedPerms)
    setEditingRole(null)
    refresh()
  }

  const createRole = async () => {
    if (!newName || !newLabel) return
    await rolesService.create({ name: newName, label: newLabel, description: newDesc })
    setNewName('')
    setNewLabel('')
    setNewDesc('')
    refresh()
  }

  const deleteRole = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا الدور؟')) return
    await rolesService.delete(id)
    refresh()
  }

  const togglePerm = (permId: number) => {
    setSelectedPerms((prev) =>
      prev.includes(permId) ? prev.filter((id) => id !== permId) : [...prev, permId],
    )
  }

  const groups = permissions.reduce<Record<string, Permission[]>>((acc, p) => {
    ;(acc[p.group] ||= []).push(p)
    return acc
  }, {})

  return (
    <div
      className="from-primary-soft/40 relative min-h-full bg-gradient-to-b via-background to-background"
      dir="rtl"
    >
      <div className="mx-auto max-w-page space-y-4 px-2 py-4">
        <div className="mb-2 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-card bg-primary-soft">
            <Shield size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="font-heading text-xl font-bold text-main">إدارة الصلاحيات</h1>
            <p className="text-sm text-muted">
              {roles.length} دور · {permissions.length} صلاحية
            </p>
          </div>
        </div>

        <div className="mb-6 rounded-card border border-border bg-surface p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-main">
            <Plus size={16} className="text-primary" /> إضافة دور جديد
          </h3>
          <div className="flex flex-col gap-3 md:flex-row md:flex-wrap">
            <input
              aria-label="الاسم التقني"
              placeholder="الاسم (مثل: manager)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full rounded-card border border-border bg-card px-3 py-2.5 text-sm text-main placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-focus md:min-w-[140px] md:flex-1 md:py-2"
            />
            <input
              aria-label="التسمية"
              placeholder="التسمية (مثل: مدير)"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              className="w-full rounded-card border border-border bg-card px-3 py-2.5 text-sm text-main placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-focus md:min-w-[140px] md:flex-1 md:py-2"
            />
            <input
              aria-label="الوصف"
              placeholder="وصف"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="w-full rounded-card border border-border bg-card px-3 py-2.5 text-sm text-main placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-focus md:min-w-[140px] md:flex-1 md:py-2"
            />
            <button
              onClick={createRole}
              className="flex h-11 items-center justify-center gap-2 rounded-card bg-primary px-5 text-sm font-bold text-on-primary transition-all hover:bg-primary-hover md:h-auto md:py-2"
            >
              <Plus size={16} /> إضافة
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {roles.map((role) => (
            <div
              key={role.id}
              className="rounded-card border border-border bg-card p-5 shadow-soft"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-card bg-primary-soft">
                    <Settings size={16} className="text-primary" />
                  </div>
                  <div>
                    <strong className="block text-sm font-bold text-main">{role.label}</strong>
                    <span className="text-xs text-muted">{role.name}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted">
                  <Users size={14} />
                  <span>{role._count?.userRoles || 0}</span>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 border-t border-border pt-3">
                <button
                  onClick={() => startEdit(role)}
                  className="rounded-card bg-primary-soft px-4 py-1.5 text-xs font-bold text-primary transition-all hover:bg-primary hover:text-on-primary"
                >
                  تعديل الصلاحيات
                </button>
                {!role.isSystem && (
                  <button
                    onClick={() => deleteRole(role.id)}
                    className="flex items-center gap-1 rounded-card bg-error-soft px-4 py-1.5 text-xs font-bold text-error transition-all hover:bg-error hover:text-on-error"
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
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm md:items-center md:p-4"
            onClick={() => setEditingRole(null)}
          >
            <div
              className="max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl border-t border-border bg-card p-5 shadow-soft md:max-h-[85vh] md:max-w-lg md:rounded-card md:border md:p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                aria-hidden="true"
                className="bg-strong mx-auto mb-4 h-1.5 w-10 shrink-0 rounded-full md:hidden"
              />
              <div className="mb-5 flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-heading text-lg font-bold text-main">
                  <Settings size={18} className="text-primary" /> تعديل: {editingRole.label}
                </h3>
                <button
                  onClick={() => setEditingRole(null)}
                  aria-label="إغلاق"
                  className="flex h-11 w-11 items-center justify-center rounded-card text-muted transition-all hover:bg-surface hover:text-main md:h-8 md:w-8"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mb-5 space-y-3">
                <input
                  aria-label="التسمية"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="w-full rounded-card border border-border bg-surface px-3 py-2 text-sm text-main focus:outline-none focus:ring-2 focus:ring-focus"
                />
                <input
                  aria-label="الوصف"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full rounded-card border border-border bg-surface px-3 py-2 text-sm text-main focus:outline-none focus:ring-2 focus:ring-focus"
                />
              </div>

              {Object.entries(groups).map(([group, perms]) => (
                <div key={group} className="mb-4">
                  <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">
                    {group}
                  </h4>
                  <div className="space-y-1">
                    {perms.map((p) => (
                      <label
                        key={p.id}
                        className="flex cursor-pointer items-center gap-2 rounded-card p-2 transition-colors hover:bg-surface"
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

              <div className="mt-6 flex items-center gap-3 border-t border-border pb-[max(0.25rem,env(safe-area-inset-bottom))] pt-4">
                <button
                  onClick={saveRole}
                  className="flex h-11 flex-1 items-center justify-center gap-2 rounded-card bg-primary px-4 text-sm font-bold text-on-primary transition-all hover:bg-primary-hover"
                >
                  <Save size={16} /> حفظ
                </button>
                <button
                  onClick={() => setEditingRole(null)}
                  className="h-11 flex-1 rounded-card bg-surface text-sm font-bold text-main transition-all hover:bg-hover md:h-auto md:flex-none md:px-4 md:py-2.5"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
