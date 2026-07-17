import { forwardRef, type ComponentType } from 'react';

interface InputFieldProps {
    icon: ComponentType<{ size?: number; className?: string }>;
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder: string;
    required?: boolean;
    type?: string;
    inputMode?: 'text' | 'numeric' | 'tel' | 'url' | 'email' | 'decimal';
    autoComplete?: string;
}

export const JobsInputField = forwardRef<HTMLInputElement, InputFieldProps>(({ icon: Icon, label, name, value, onChange, placeholder, required, type = 'text', inputMode, autoComplete }, ref) => (
    <div className="space-y-1.5">
        <label className="flex items-center gap-2 text-xs text-muted">
            <Icon size={12} className="text-primary shrink-0" />
            {label}
            {required && <span className="text-error">*</span>}
            {!required && <span className="text-xs text-muted">(اختياري)</span>}
        </label>
        <input ref={ref} type={type} name={name} value={value} onChange={onChange}
            placeholder={placeholder} required={required} inputMode={inputMode}
            autoComplete={autoComplete}
            className="w-full bg-card border border-border/60 rounded-xl py-3 px-4 text-sm text-main focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-muted touch-manipulation" />
    </div>
));
JobsInputField.displayName = 'JobsInputField';
