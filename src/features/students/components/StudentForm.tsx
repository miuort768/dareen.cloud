import React, { useState, useEffect } from 'react'
import {
  UserPlus,
  Edit,
  Save,
  Shield,
  Key,
  Info,
  GraduationCap,
  Phone,
  User as UserIcon,
  X,
  Tag,
  DollarSign,
  FileText,
} from 'lucide-react'
import type { Student } from '../types'
import type { LucideIcon } from 'lucide-react'
import { cn } from '../../../lib/utils'
import { CURRENCY_OPTIONS } from '../../../config/constants'
import { CURRICULUM_OPTIONS, normalizeCurriculum } from '../utils/curriculumUtils'

interface StudentFormProps {
  onSubmit: (data: Omit<Student, 'id' | 'enrollments'>) => void
  initialData?: Student | null
  onCancel?: () => void
}

const GRADE_OPTIONS = [
  'الأول',
  'الثاني',
  'الثالث',
  'الرابع',
  'الخامس',
  'السادس',
  'السابع',
  'الثامن',
  'التاسع',
  'العاشر',
  'الحادي عشر',
  'الثاني عشر',
]

export const StudentForm = ({ onSubmit, initialData, onCancel }: StudentFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    grade: '',
    parentPhone: '',
    studentPhone: '',
    curriculum: '',
    notes: '',
    sessionPrice: '',
    currency: 'EGP',
    username: '',
    password: '',
  })

  // Arabic-Indic digits (١٦٠) → ASCII (160) so Number() never fails on Arabic keyboards
  const toAsciiDigits = (s: string) => s.replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        grade: initialData.grade,
        parentPhone: initialData.parentPhone,
        studentPhone: initialData.studentPhone || '',
        curriculum: normalizeCurriculum(initialData.curriculum || ''),
        notes: initialData.notes || '',
        sessionPrice: String(initialData.sessionPrice || 0),
        currency: initialData.currency || 'EGP',
        username: initialData.username || '',
        password: '',
      })
    }
  }, [initialData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      sessionPrice: Number(toAsciiDigits(formData.sessionPrice)) || 0,
    })
  }

  return (
    <div
      className="overflow-hidden border border-border bg-card shadow-elevation-2 duration-500 animate-in slide-in-from-top-4"
      dir="rtl"
    >
      {/* Header Section */}
      <div className="flex items-center justify-between gap-4 bg-primary px-4 py-6 md:gap-6 md:px-6 md:py-8">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center bg-white/15 text-on-primary shadow-sm">
            {initialData ? <Edit size={24} /> : <UserPlus size={24} />}
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight text-on-primary">
              {initialData ? 'تعديل بيانات الطالب' : 'إدراج طالب جديد'}
            </h3>
            <p className="mt-1 text-micro font-normal text-white/80">
              {initialData ? 'أرشفة وتحديث السجل' : 'فتح سجل أكاديمي جديد'}
            </p>
          </div>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex h-10 w-10 items-center justify-center text-white/90 transition-all hover:bg-white/15"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 p-4 md:space-y-10 md:p-8">
        {/* Basic Info Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-border pb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-info-soft ring-1 ring-info-soft">
              <Info size={16} className="text-primary" />
            </div>
            <h4 className="text-xs font-bold uppercase tracking-tight text-main">
              بيانات التعريف الأساسية
            </h4>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
            <FormInput
              label="الاسم الكامل"
              icon={UserIcon}
              value={formData.name}
              onChange={(val: string) => setFormData({ ...formData, name: val })}
              required
              placeholder="مثال: محمد أحمد"
            />
            <SelectField
              label="المرحلة الدراسية"
              icon={GraduationCap}
              value={formData.grade}
              onChange={(val: string) => setFormData({ ...formData, grade: val })}
              required
              options={GRADE_OPTIONS}
              placeholder="اختر المرحلة"
            />
            <SelectField
              label="المنهج الدراسي"
              icon={Tag}
              value={formData.curriculum}
              onChange={(val: string) => setFormData({ ...formData, curriculum: val })}
              options={CURRICULUM_OPTIONS}
              placeholder="اختر المنهج"
            />
            <FormInput
              label="هاتف ولي الأمر"
              icon={Phone}
              type="tel"
              value={formData.parentPhone}
              onChange={(val: string) => setFormData({ ...formData, parentPhone: val })}
              required
              placeholder="05XXXXXXXX"
              dir="ltr"
            />
            <FormInput
              label="هاتف الطالب"
              icon={Phone}
              type="tel"
              value={formData.studentPhone}
              onChange={(val: string) => setFormData({ ...formData, studentPhone: val })}
              placeholder="05XXXXXXXX"
              dir="ltr"
            />
            <FormInput
              label="سعر الحصة الافتراضي"
              icon={DollarSign}
              type="number"
              value={formData.sessionPrice}
              onChange={(val: string) => setFormData({ ...formData, sessionPrice: val })}
              required
              placeholder="0.00"
            />
            <SelectField
              label="عملة الحصة"
              icon={DollarSign}
              value={formData.currency}
              onChange={(val: string) => setFormData({ ...formData, currency: val })}
              options={CURRENCY_OPTIONS.map((c) => ({ value: c.code, label: c.label }))}
              placeholder="اختر العملة"
            />
          </div>
        </div>

        {/* Platform Access Section */}
        <div className="rounded-2xl border border-border bg-surface p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center bg-success-soft">
              <Shield size={16} className="text-success" />
            </div>
            <h4 className="text-xs font-bold uppercase tracking-tight text-main">
              إدارة الوصول للمنصة
            </h4>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="student-username"
                className="ms-1 text-micro font-normal uppercase text-muted"
              >
                اسم المستخدم
              </label>
              <div className="relative">
                <UserIcon
                  className="absolute start-3 top-1/2 -translate-y-1/2 text-muted"
                  size={14}
                />
                <input
                  id="student-username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full rounded-xl border border-border bg-surface py-2 pe-4 ps-10 font-mono text-xs font-normal text-main outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/10"
                  placeholder="اسم مستخدم فريد"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label
                htmlFor="student-password"
                className="ms-1 text-micro font-normal uppercase text-muted"
              >
                كلمة المرور
              </label>
              <div className="relative">
                <Key className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" size={14} />
                <input
                  id="student-password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full rounded-xl border border-border bg-surface py-2 pe-4 ps-10 font-mono text-xs font-normal tracking-widest text-main outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/10"
                  placeholder={initialData ? '••••••••' : 'كلمة مرور قوية'}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div className="space-y-2">
          <div className="mb-2 flex items-center gap-3">
            <FileText size={14} className="text-muted" />
            <label htmlFor="student-notes" className="text-micro font-normal uppercase text-muted">
              ملاحظات أكاديمية
            </label>
          </div>
          <textarea
            id="student-notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="min-h-[120px] w-full rounded-xl border border-border bg-surface px-6 py-4 text-xs font-normal text-main outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
            placeholder="أضف أي تفاصيل أو ملاحظات حول مستوى الطالب..."
          />
        </div>

        <div className="flex items-center justify-end border-t border-border pt-6">
          <button
            type="submit"
            className="flex items-center gap-2 rounded-xl bg-primary px-10 py-3 text-xs font-bold text-on-primary shadow-sm outline-none transition-all hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-focus active:scale-95"
          >
            <Save size={16} />
            {initialData ? 'تحديث السجل' : 'إتمام الإضافة'}
          </button>
        </div>
      </form>
    </div>
  )
}

const SelectField = ({
  label,
  icon: Icon,
  placeholder,
  value,
  onChange,
  options,
}: {
  label: string
  icon?: LucideIcon
  placeholder?: string
  value: string
  onChange: (val: string) => void
  required?: boolean
  options: string[] | { value: string; label: string }[]
}) => {
  const selectId = `student-select-${label.replace(/\s+/g, '-')}`
  const normalized = options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o))
  const allOptions =
    value && !normalized.some((o) => o.value === value)
      ? [{ value, label: value }, ...normalized]
      : normalized
  return (
    <div className="space-y-2">
      <label htmlFor={selectId} className="ms-1 text-micro font-normal uppercase text-muted">
        {label}
      </label>
      <div className="group relative">
        {Icon && (
          <Icon
            className="absolute start-3 top-1/2 z-10 -translate-y-1/2 text-muted transition-colors group-focus-within:text-primary"
            size={14}
          />
        )}
        <select
          id={selectId}
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            'w-full appearance-none rounded-xl border border-border bg-surface px-4 py-2 text-xs font-normal text-main outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/10',
            Icon && 'ps-10',
            !value && 'text-muted',
          )}
        >
          <option value="" disabled>
            {placeholder || 'اختر...'}
          </option>
          {allOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
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
  icon?: LucideIcon
  placeholder?: string
  value: string
  onChange: (val: string) => void
  required?: boolean
  type?: string
  dir?: string
}) => {
  const inputId = `student-form-${label.replace(/\s+/g, '-')}`
  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className="ms-1 text-micro font-normal uppercase text-muted">
        {label}
      </label>
      <div className="group relative">
        {Icon && (
          <Icon
            className="absolute start-3 top-1/2 -translate-y-1/2 text-muted transition-colors group-focus-within:text-primary"
            size={14}
          />
        )}
        <input
          id={inputId}
          required={required}
          type={type}
          dir={dir}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            'w-full rounded-xl border border-border bg-surface px-4 py-2 text-xs font-normal text-main outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10',
            Icon && 'ps-10',
            dir === 'ltr' && 'font-mono',
          )}
          placeholder={placeholder}
        />
      </div>
    </div>
  )
}
