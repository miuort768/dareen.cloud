import React from 'react'
import { User, Save, ShieldCheck, X, Phone } from 'lucide-react'
import { cn } from '../../../lib/utils'

interface ParentFormProps {
  isEdit: boolean
  formData: { name: string; phone: string; phone2?: string; username?: string; password?: string }
  onChange: (data: {
    name: string
    phone: string
    phone2?: string
    username?: string
    password?: string
  }) => void
  onSubmit: (e: React.FormEvent) => void
  onClose?: () => void
}

const InputField = ({
  label,
  icon: Icon,
  ...props
}: { label: string; icon: React.ComponentType<{ size?: number }> } & Record<string, unknown>) => (
  <div className="space-y-1.5">
    <label className="ms-1 text-micro font-medium uppercase tracking-widest text-muted">
      {label}
    </label>
    <div className="group relative">
      <div className="absolute bottom-0 start-0 top-0 flex w-10 items-center justify-center rounded-s-xl border-e border-primary/10 bg-primary/10 text-primary transition-all group-focus-within:bg-primary group-focus-within:text-on-primary">
        <Icon size={14} />
      </div>
      <input
        {...props}
        className={cn(
          'w-full rounded-xl border border-border bg-surface py-3 pe-4 ps-12 text-xs font-normal outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10',
          props.className,
        )}
      />
    </div>
  </div>
)

export const ParentForm: React.FC<ParentFormProps> = ({
  isEdit,
  formData,
  onChange,
  onSubmit,
  onClose,
}) => {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-elevation-2">
      <div className="bg-primary p-6 md:p-8">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-on-primary backdrop-blur-sm">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-on-primary">
                {isEdit ? '����� ��� ��� �����' : '����� ��� ��� ���� �������'}
              </h3>
              <p className="text-on-primary/70 mt-0.5 text-micro font-normal uppercase tracking-widest">
                ���� �� ��� �������� ����� ���� ���������
              </p>
            </div>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="����� �������"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15 text-on-primary backdrop-blur-sm transition-all hover:bg-error hover:text-on-error active:scale-90"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="p-6 md:p-8">
        <form onSubmit={onSubmit} className="space-y-8">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-x-6 md:gap-y-8">
            <InputField
              label="����� ������"
              icon={User}
              required
              type="text"
              value={formData.name}
              onChange={(e) => onChange({ ...formData, name: e.target.value })}
            />
            <InputField
              label="��� ������ �������"
              icon={Phone}
              required
              type="tel"
              value={formData.phone}
              onChange={(e) => onChange({ ...formData, phone: e.target.value })}
            />
            <InputField
              label="��� ���� ����� (�������)"
              icon={Phone}
              type="tel"
              value={formData.phone2 || ''}
              onChange={(e) => onChange({ ...formData, phone2: e.target.value })}
            />
            <InputField
              label="��� ��������"
              icon={User}
              type="text"
              value={formData.username || ''}
              placeholder="��� �������� ������ ������"
              onChange={(e) => onChange({ ...formData, username: e.target.value })}
            />
            <InputField
              label={isEdit ? '���� ������ �������' : '���� ������ (�������)'}
              icon={User}
              type="password"
              required={!isEdit}
              placeholder={isEdit ? '������ ����� ������� ��� �������' : '����� ���� ���� ����'}
              onChange={(e) => onChange({ ...formData, password: e.target.value })}
            />
          </div>

          <div className="flex justify-end border-t border-border pt-6">
            <button
              type="submit"
              className="group flex items-center gap-3 rounded-xl bg-primary px-10 py-4 text-micro font-bold text-on-primary shadow-lg shadow-primary/20 transition-all hover:bg-primary-hover active:scale-95"
            >
              <Save size={14} className="transition-transform group-hover:rotate-12" />
              {isEdit ? '����� ��������' : '��� ������ ������'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
