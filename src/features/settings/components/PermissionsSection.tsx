import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, ExternalLink, Users, KeyRound, Check, Lock } from 'lucide-react'
import { SectionCard, SectionTitle, FieldLabel, PrimaryBtn } from './SettingsUI'
import { rolesService, type Permission } from '../../roles/services/rolesService'
import { useCurrentUser } from '../../../context/AppContext'
import { cn } from '../../../lib/utils'

const GROUP_LABELS: Record<string, string> = {
  system: 'النظام',
  dashboard: 'لوحة التحكم',
  students: 'الطلاب',
  teachers: 'المعلمين',
  finance: 'المالية',
  sessions: 'الجلسات',
  leads: 'العملاء المحتملين',
}

export const PermissionsSection = ({ showNotify }: { showNotify: (msg: string) => void }) => {
  const navigate = useNavigate()
  const currentUser = useCurrentUser()
  const [roleName, setRoleName] = useState('')
  const [selectedPerms, setSelectedPerms] = useState<string[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  const canOpenRoles =
    !!currentUser &&
    (currentUser.permissions?.includes('*') || currentUser.permissions?.includes('admin'))

  useEffect(() => {
    rolesService
      .getPermissions()
      .then(setPermissions)
      .catch((e) => console.error(e))
      .finally(() => setLoading(false))
  }, [])

  const groups = useMemo(() => {
    const g: Record<string, Permission[]> = {}
    permissions.forEach((p) => {
      ;(g[p.group] ||= []).push(p)
    })
    return g
  }, [permissions])

  const togglePerm = (key: string) => {
    if (key === '*') {
      setSelectedPerms(selectedPerms.includes('*') ? [] : ['*'])
      return
    }
    if (selectedPerms.includes('*')) {
      setSelectedPerms([key])
      return
    }
    setSelectedPerms((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key],
    )
  }

  const handleCreateRole = async () => {
    if (!roleName || !canOpenRoles) return
    setCreating(true)
    try {
      const role = await rolesService.create({
        name: `custom_${Date.now()}`,
        label: roleName,
        description: 'دور مخصص تم إنشاؤه من الإعدادات',
      })
      const selected = permissions.filter((p) => selectedPerms.includes(p.key)).map((p) => p.id)
      if (selected.length) {
        await rolesService.updatePermissions(role.id, selected)
      }
      showNotify(`تم إنشاء الدور "${roleName}" بنجاح`)
      setRoleName('')
      setSelectedPerms([])
    } catch (e) {
      showNotify('خطأ في إنشاء الدور: ' + (e instanceof Error ? e.message : 'خطأ غير متوقع'))
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="space-y-5">
      <SectionCard>
        <SectionTitle icon={Shield} label="الصلاحيات والأدوار" sub="إدارة صلاحيات المستخدمين" />

        <div className="mb-5 flex items-center justify-between rounded-xl border border-primary/10 bg-primary-soft p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-soft">
              <ExternalLink size={16} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold text-primary">إدارة الأدوار المتقدمة</p>
              <p className="text-[11px] text-primary/70">
                صفحة منفصلة لإدارة الأدوار والصلاحيات بشكل متكامل
              </p>
            </div>
          </div>
          {canOpenRoles ? (
            <button
              onClick={() => navigate('/roles')}
              className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-on-primary shadow-sm outline-none transition-all hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.97]"
            >
              <Users size={14} /> فتح
            </button>
          ) : (
            <span
              className="flex items-center gap-1.5 rounded-xl bg-hover px-4 py-2.5 text-xs font-bold text-muted"
              title="يتطلب صلاحية المدير"
            >
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
              onChange={(e) => setRoleName(e.target.value)}
              placeholder="مثال: مشرف مالي"
              className="flex-1 rounded-xl border border-divider bg-background px-4 py-3 text-sm font-bold transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
            />
            <PrimaryBtn onClick={handleCreateRole} loading={creating}>
              إنشاء الدور
            </PrimaryBtn>
          </div>
          {!canOpenRoles && (
            <p className="mt-2 text-[11px] font-bold text-muted">
              إنشاء الأدوار متاح فقط لمدير النظام.
            </p>
          )}
        </div>

        {loading ? (
          <p className="py-6 text-center text-xs text-muted">جاري تحميل الصلاحيات...</p>
        ) : (
          <div className="space-y-4">
            {Object.entries(groups).map(([group, perms]) => (
              <div key={group}>
                <p className="mb-2 text-[11px] font-bold text-muted">
                  {GROUP_LABELS[group] || group}
                </p>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
                  {perms.map((p) => {
                    const isSelected = selectedPerms.includes(p.key) || selectedPerms.includes('*')
                    return (
                      <button
                        key={p.id}
                        onClick={() => togglePerm(p.key)}
                        className={cn(
                          'flex items-center gap-2 rounded-xl border px-3 py-2.5 text-start text-[11px] font-bold transition-all',
                          isSelected
                            ? 'border-primary bg-primary text-on-primary shadow-sm'
                            : 'border-divider bg-background text-muted hover:border-primary/50 hover:text-main',
                        )}
                      >
                        {isSelected && <Check size={12} className="shrink-0" />}
                        {p.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  )
}
