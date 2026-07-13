import { useState, useRef, useEffect } from 'react';
import { cn } from '../../../lib/utils';
import { ChevronDown } from 'lucide-react';

interface DropdownItem {
    label: string;
    value: string;
    icon?: React.ReactNode;
    disabled?: boolean;
    danger?: boolean;
}

interface DropdownProps {
    trigger: React.ReactNode;
    items: DropdownItem[];
    onSelect: (value: string) => void;
    align?: 'start' | 'end';
    className?: string;
}

export const Dropdown = ({ trigger, items, onSelect, align = 'end', className }: DropdownProps) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={ref} className={cn('relative inline-block', className)}>
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-1 text-sm text-main font-medium"
                aria-expanded={open}
                aria-haspopup="true"
            >
                {trigger}
                <ChevronDown size={14} className={cn('transition-transform duration-fast', open && 'rotate-180')} />
            </button>
            {open && (
                <div
                    className={cn(
                        'absolute z-50 mt-1 min-w-[160px] bg-card border border-border rounded-card shadow-elevation-2 py-1',
                        align === 'end' ? 'end-0' : 'start-0'
                    )}
                    role="menu"
                >
                    {items.map((item) => (
                        <button
                            key={item.value}
                            onClick={() => { if (!item.disabled) { onSelect(item.value); setOpen(false); } }}
                            disabled={item.disabled}
                            role="menuitem"
                            className={cn(
                                'w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors duration-fast text-start',
                                item.disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-hover cursor-pointer',
                                item.danger ? 'text-error' : 'text-main'
                            )}
                        >
                            {item.icon && <span className="text-muted shrink-0">{item.icon}</span>}
                            {item.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
