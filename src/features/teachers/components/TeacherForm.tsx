import { useState, useEffect } from 'react'
import { Plus, Edit3, Save, Key, Info, User, Phone, Tag, DollarSign, X, Award } from 'lucide-react'
import { cn } from '../../../lib/utils'
import { CURRENCY_OPTIONS } from '../../../config/constants'
import type { Teacher } from '../types'

const SUBJECT_OPTIONS = [
  'اللغة العربية',
  'اللغة الانجليزية',
  'اللغة الفرنسية',
  'اللغة الاسبانية',
  'الرياضيات',
  'العلوم وفروعها',
  'القران الكريم',
  'المواد الشرعية',
  'الاجتماعيات',
  'اخري',
]

interface TeacherFormProps {
  onSubmit: (data: Omit<Teacher, 'id'>) => void
  initialData?: Teacher | null
  onCancel: () => void
  editId?: string | null
}

export const TeacherForm = ({ onSubmit, initialData, onCancel, editId }: TeacherFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    phone1: '',
    phone2: '',
    subject: '',
    price: '',
    currency: 'EGP',
    username: '',
    password: '',
    points: '',
  })
  const [enableLogin, setEnableLogin] = useState(false)

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        phone1: initialData.phone1,
        phone2: initialData.phone2 || '',
        subject: initialData.subject,
        price: String(initialData.price),
        username: initialData.username || '',
        password: initialData.password || '',
        currency: initialData.currency || 'SAR',
        points: String(initialData.points ?? 0),
      })
      setEnableLogin(!!initialData.username)
    }
  }, [initialData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      price: Number(formData.price),
      currency: formData.currency || 'SAR',
      username: enableLogin ? formData.username : '',
      password: enableLogin ? formData.password : '',
      points: Number(formData.points),
    })
  }

  const generatePassword = () => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz'
    let pass = ''
    for (let i = 0; i < 8; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length))
    setFormData((prev) => ({ ...prev, password: pass }))
  }

  const generateUsername = () => {
    const rand = Math.floor(Math.random() * 10000)
    if (!formData.name) {
      setFormData((prev) => ({ ...prev, username: `teacher_${rand}` }))
      return
    }
    const cleaned = formData.name
      .trim()
      .split(' ')[0]
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
    const base = cleaned.length >= 2 ? cleaned : 'teacher'
    setFormData((prev) => ({
      ...prev,
      username: `${base}_${rand}`,
    }))
  }

  return (
    <div
      className="overflow-hidden rounded-2xl border border-border bg-card shadow-elevation-2"
      dir="rtl"
    >
      <div className="flex items-center justify-between bg-primary px-5 py-5 md:px-7">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
            {editId ? (
              <Edit3 size={18} className="text-on-primary" />
            ) : (
              <Plus size={18} className="text-on-primary" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-bold text-on-primary">
              {editId ? 'تعديل بيانات المعلمة' : 'إضافة معلمة جديدة'}
            </h3>
            <p className="text-on-primary/70 mt-0.5 text-xs">
              {editId ? 'تحديث المعلومات' : 'إدخال بيانات المعلمة'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/15 text-on-primary transition-all hover:bg-white/25"
          aria-label="إغلاق"
        >
          <X size={18} />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6 p-6">
        {/* Basic Info Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 border-b border-border pb-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-info-soft">
              <Info size={12} className="text-info" />
            </div>
            <h4 className="text-xs text-muted">بيانات التعريف الأساسية</h4>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <FormInput
              label="الاسم الكامل"
              icon={User}
              value={formData.name}
              onChange={(val: string) => setFormData({ ...formData, name: val })}
              required
              placeholder="سارة محمد"
            />
            <FormInput
              label="رقم الهاتف (1)"
              icon={Phone}
              type="tel"
              value={formData.phone1}
              onChange={(val: string) => setFormData({ ...formData, phone1: val })}
              required
              placeholder="05XXXXXXXX"
              dir="ltr"
            />
            <FormInput
              label="رقم الهاتف (2)"
              icon={Phone}
              type="tel"
              value={formData.phone2}
              onChange={(val: string) => setFormData({ ...formData, phone2: val })}
              placeholder="اختياري"
              dir="ltr"
            />
            <div className="space-y-1.5">
              <label htmlFor="teacher-form-subject" className="ms-1 text-xs text-muted">
                التخصص
              </label>
              <div className="relative">
                <Tag className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" size={12} />
                <select
                  id="teacher-form-subject"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full cursor-pointer appearance-none border border-border bg-surface px-4 py-2.5 ps-10 text-xs text-main transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                >
                  <option value="" disabled>
                    اختر التخصص...
                  </option>
                  {formData.subject && !SUBJECT_OPTIONS.includes(formData.subject) && (
                    <option value={formData.subject}>{formData.subject}</option>
                  )}
                  {SUBJECT_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <FormInput
              label="السعر الافتراضي للحصة"
              icon={DollarSign}
              type="number"
              value={formData.price}
              onChange={(val: string) => setFormData({ ...formData, price: val })}
              placeholder="0.00"
            />
            <FormInput
              label="النقاط"
              icon={Award}
              type="number"
              value={formData.points}
              onChange={(val: string) => setFormData({ ...formData, points: val })}
              placeholder="0"
            />
          </div>
        </div>

        {/* Currency Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 border-b border-border pb-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-success-soft">
              <DollarSign size={12} className="text-success" />
            </div>
            <h4 className="text-xs text-muted">عملة السعر</h4>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="teacher-currency" className="ms-1 text-xs text-muted">
                العملة
              </label>
              <div className="relative">
                <DollarSign
                  className="absolute start-3 top-1/2 -translate-y-1/2 text-muted"
                  size={12}
                />
                <select
                  id="teacher-currency"
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full appearance-none rounded-xl border border-border bg-surface px-4 py-2.5 ps-10 text-xs text-main transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                >
                  {CURRENCY_OPTIONS.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Platform Access Section */}
        <div className="rounded-2xl border border-border bg-surface p-5">
          <label
            onClick={() => setEnableLogin(!enableLogin)}
            className="mb-6 flex cursor-pointer items-center gap-3"
          >
            <div
              className={cn(
                'flex h-4 w-4 items-center justify-center rounded border transition-all',
                enableLogin ? 'border-primary bg-primary' : 'border-border bg-surface',
              )}
            >
              {enableLogin && <div className="h-1.5 w-1.5 rounded-sm bg-white" />}
            </div>
            <span className="text-xs text-muted">تفعيل حساب المعلمة على المنصة</span>
          </label>

          {enableLogin && (
            <div className="grid grid-cols-1 gap-4 duration-300 animate-in fade-in slide-in-from-top-2 md:grid-cols-2">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between px-1">
                  <label htmlFor="teacher-username" className="text-xs text-muted">
                    اسم المستخدم
                  </label>
                  <button
                    type="button"
                    onClick={generateUsername}
                    className="text-xs text-primary hover:underline"
                  >
                    توليد تلقائي
                  </button>
                </div>
                <div className="relative">
                  <User
                    className="absolute start-3 top-1/2 -translate-y-1/2 text-muted"
                    size={12}
                  />
                  <input
                    id="teacher-username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full rounded-xl border border-border bg-surface py-2.5 pe-4 ps-10 font-mono text-xs text-main transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                    placeholder="اسم المستخدم"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between px-1">
                  <label htmlFor="teacher-password" className="text-xs text-muted">
                    كلمة المرور
                  </label>
                  <button
                    type="button"
                    onClick={generatePassword}
                    className="text-xs text-primary hover:underline"
                  >
                    توليد تلقائي
                  </button>
                </div>
                <div className="relative">
                  <Key className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" size={12} />
                  <input
                    id="teacher-password"
                    type="text"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full rounded-xl border border-border bg-surface py-2.5 pe-4 ps-10 font-mono text-xs tracking-widest text-main transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                    placeholder="كلمة المرور"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end border-t border-border pt-4">
          <button
            type="submit"
            className="flex items-center gap-2 rounded-xl bg-primary px-8 py-3 text-xs font-bold text-on-primary transition-all hover:bg-primary-hover active:scale-95"
          >
            <Save size={14} />
            {initialData ? 'تحديث البيانات' : 'إتمام الإضافة'}
          </button>
        </div>
      </form>
    </div>
  )
}

const FormInput = ({
  label,
  icon: Icon,
  placeholder,
  value,
  onChange,
  required,
  type = 'text',
  dir = 'rtl',
}: {
  label: string
  icon: React.ComponentType<{ size?: number }>
  placeholder?: string
  value: string
  onChange: (val: string) => void
  required?: boolean
  type?: string
  dir?: string
}) => {
  const inputId = `teacher-form-${label.replace(/\s+/g, '-')}`
  return (
    <div className="space-y-1.5">
      <label htmlFor={inputId} className="ms-1 text-xs text-muted">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" size={12} />
        )}
        <input
          id={inputId}
          required={required}
          type={type}
          dir={dir}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            'w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-xs text-main transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10',
            Icon && 'ps-10',
            dir === 'ltr' && 'font-mono',
          )}
          placeholder={placeholder}
        />
      </div>
    </div>
  )
}
