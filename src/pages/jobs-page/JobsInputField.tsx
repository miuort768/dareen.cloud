import { forwardRef } from 'react'
import type { LucideIcon } from 'lucide-react'

interface InputFieldProps {
  icon: LucideIcon
  label: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder: string
  required?: boolean
  type?: string
  inputMode?: 'text' | 'numeric' | 'tel' | 'url' | 'email' | 'decimal'
  autoComplete?: string
}

export const JobsInputField = forwardRef<HTMLInputElement, InputFieldProps>(
  (
    {
      icon: Icon,
      label,
      name,
      value,
      onChange,
      placeholder,
      required,
      type = 'text',
      inputMode,
      autoComplete,
    },
    ref,
  ) => (
    <div className="space-y-1.5">
      <label className="flex items-center gap-2 text-xs text-muted">
        <Icon size={12} className="shrink-0 text-primary" />
        {label}
        {required && <span className="text-error">*</span>}
        {!required && <span className="text-xs text-muted">(ط§ط®طھظٹط§ط±ظٹ)</span>}
      </label>
      <input
        ref={ref}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        inputMode={inputMode}
        autoComplete={autoComplete}
        className="w-full touch-manipulation rounded-xl border border-border bg-card px-4 py-3 text-sm text-main transition-all placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-focus"
      />
    </div>
  ),
)
JobsInputField.displayName = 'JobsInputField'
