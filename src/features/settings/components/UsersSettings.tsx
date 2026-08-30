import { useMemo } from 'react'
import { Users, UserPlus, Edit, Trash2, Shield, Check } from 'lucide-react'
import {
  SectionCard,
  SectionTitle,
  PrimaryBtn,
  SecondaryBtn,
  InputField,
  FieldLabel,
  AVAILABLE_PERMISSIONS,
} from './SettingsUI'
import { cn } from '../../../lib/utils'

interface UserRecord {
  id: string
  username: string
  name?: string
  password?: string
  permissions?: string[]
}
interface UserFormData {
  username: string
  password: string
  permissions: string[]
}
interface UsersSettingsProps {
  users: UserRecord[]
  user: UserRecord | null
  newUser: UserFormData
  setNewUser: (v: UserFormData) => void
  onSave?: () => void
  setShowDeleteModal: (v: boolean | UserRecord) => void
  onDeleteAll?: () => void
  onSync?: () => void
  editingUserId: string | null
  setEditingUserId: (id: string | null) => void
  handleUserAction: () => void
}

const QUICK_TEMPLATES = [
  { label: 'مدير نظام', perms: ['*'] },
  { label: 'محاسب', perms: ['finance', 'student_invoices', 'teacher_invoices', 'reports'] },
  { label: 'مشرف عام', perms: ['dashboard', 'students', 'teachers', 'parents', 'evaluations'] },
  { label: 'معلمين', perms: ['dashboard', 'attendance', 'schedule', 'evaluations', 'chat'] },
]

export const UsersSettings = ({
  users,
  user,
  newUser,
  setNewUser,
  editingUserId,
  setEditingUserId,
  setShowDeleteModal,
  handleUserAction,
}: UsersSettingsProps) => {
  const groups = useMemo(() => {
    const g: Record<string, typeof AVAILABLE_PERMISSIONS> = {}
    AVAILABLE_PERMISSIONS.forEach((p) => {
      ;(g[p.group] ||= []).push(p)
    })
    return g
  }, [])

  const permLabel = (id: string) => AVAILABLE_PERMISSIONS.find((p) => p.id === id)?.label || id

  const togglePerm = (id: string) => {
    if (id === '*') {
      setNewUser({ ...newUser, permissions: newUser.permissions.includes('*') ? [] : ['*'] })
      return
    }
    if (newUser.permissions.includes('*')) {
      setNewUser({ ...newUser, permissions: [id] })
      return
    }
    const perms = newUser.permissions.includes(id)
      ? newUser.permissions.filter((x) => x !== id)
      : [...newUser.permissions, id]
    setNewUser({ ...newUser, permissions: perms })
  }

  return (
    <div className="space-y-4">
      <SectionCard>
        <SectionTitle
          icon={editingUserId ? Edit : UserPlus}
          label={editingUserId ? 'تعديل المسؤول' : 'إضافة حساب جديد'}
          sub={editingUserId ? 'تحديث بيانات وصلاحيات المستخدم' : 'إنشاء حساب جديد بصلاحيات مخصصة'}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <FieldLabel>اسم الدخول</FieldLabel>
            <InputField
              value={newUser.username}
              onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
              placeholder="اسم المستخدم"
            />
          </div>
          <div>
            <FieldLabel>الرقم السري</FieldLabel>
            <InputField
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              placeholder={editingUserId ? 'اتركه فارغاً للإبقاء على الحالي' : '••••••••'}
            />
          </div>
        </div>

        <div className="mt-4 border-t border-divider pt-4">
          <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold text-primary">
            <Shield size={11} /> قوالب صلاحيات سريعة
          </p>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_TEMPLATES.map((role) => (
              <button
                key={role.label}
                onClick={() => setNewUser({ ...newUser, permissions: role.perms })}
                className="rounded-lg border border-divider bg-background px-3 py-1.5 text-[11px] font-bold text-muted transition-all hover:bg-primary-soft hover:text-primary"
              >
                {role.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 border-t border-divider pt-4">
          <p className="mb-3 flex items-center gap-1.5 text-[11px] font-bold text-primary">
            <Shield size={11} /> تخصيص يدوي — كل صفحات النظام
          </p>
          <div className="space-y-4">
            {Object.entries(groups).map(([groupName, perms]) => (
              <div key={groupName}>
                <p className="mb-2 text-[11px] font-bold text-muted">{groupName}</p>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
                  {perms.map((p) => {
                    const isSelected = newUser.permissions.includes(p.id)
                    return (
                      <button
                        key={p.id}
                        onClick={() => togglePerm(p.id)}
                        className={cn(
                          'flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-start text-[11px] font-bold transition-all',
                          isSelected
                            ? 'border-primary bg-primary text-on-primary shadow-sm'
                            : 'border-divider bg-card text-muted hover:border-primary/50 hover:text-main',
                        )}
                      >
                        {isSelected && <Check size={11} className="shrink-0" />}
                        {p.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-2 border-t border-divider pt-5 sm:flex-row">
          <PrimaryBtn onClick={handleUserAction} className="flex-1">
            <UserPlus size={13} /> {editingUserId ? 'تحديث الحساب' : 'إنشاء حساب'}
          </PrimaryBtn>
          {editingUserId && (
            <SecondaryBtn
              onClick={() => {
                setEditingUserId(null)
                setNewUser({ username: '', password: '', permissions: [] })
              }}
              className="sm:w-40"
            >
              إلغاء التعديل
            </SecondaryBtn>
          )}
        </div>
      </SectionCard>

      <SectionCard>
        <SectionTitle icon={Users} label="الحسابات والمسؤولون" sub="إدارة الحسابات الموجودة" />
        <div className="mb-4 flex items-center justify-between px-1">
          <span className="rounded-lg bg-primary-soft px-3 py-1.5 text-[11px] font-bold text-primary">
            {users.length} حساب
          </span>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {users.map((u) => (
            <div
              key={u.id}
              className="group rounded-xl border border-divider bg-card p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-sm"
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-sm font-bold text-primary">
                  {u.username[0]?.toUpperCase()}
                </div>
                <div className="flex gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => {
                      setEditingUserId(u.id)
                      setNewUser({
                        username: u.username,
                        password: '',
                        permissions: u.permissions || [],
                      })
                    }}
                    className="rounded-lg border border-divider bg-background p-2 text-muted transition-all hover:border-primary hover:text-primary"
                    title="تعديل"
                  >
                    <Edit size={13} />
                  </button>
                  {u.id !== user?.id && (
                    <button
                      onClick={() => setShowDeleteModal(u)}
                      className="rounded-lg border border-error-soft bg-error-soft p-2 text-error transition-all hover:bg-error"
                      title="حذف"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
              <p className="truncate text-sm font-bold text-main">{u.name || u.username}</p>
              <p className="mt-1 flex items-center gap-1 text-[11px] text-muted">
                <Shield size={10} className="text-primary" />
                {u.permissions?.includes('*')
                  ? 'Admin كامل'
                  : `${u.permissions?.length || 0} صلاحيات`}
              </p>
              <div className="mt-3 flex flex-wrap gap-1 border-t border-divider pt-3">
                {u.permissions?.slice(0, 3).map((p) => (
                  <span
                    key={p}
                    className="rounded-md border border-divider bg-background px-2 py-0.5 text-[11px] text-muted"
                  >
                    {permLabel(p)}
                  </span>
                ))}
                {(u.permissions?.length || 0) > 3 && (
                  <span className="rounded-md bg-primary-soft px-2 py-0.5 text-[11px] font-bold text-primary">
                    +{(u.permissions?.length || 0) - 3}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}
