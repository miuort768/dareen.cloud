import type { LucideIcon } from 'lucide-react';
import { Sparkles } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface SectionHeaderProps {
    icon?: LucideIcon;
    iconClassName?: string;
    title: string;
    subtitle?: string;
    action?: React.ReactNode;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

export const SectionHeader = ({
    icon: Icon = Sparkles,
    iconClassName = 'text-primary',
    title,
    subtitle,
    action,
    className,
    size = 'md',
}: SectionHeaderProps) => (
    <div className={cn('flex items-center gap-3', className)}>
        <div
            className={cn(
                'flex items-center justify-center shrink-0 rounded-xl bg-primary-soft',
                size === 'sm' && 'w-7 h-7',
                size === 'md' && 'w-8 h-8 md:w-9 md:h-9',
                size === 'lg' && 'w-10 h-10 md:w-11 md:h-11'
            )}
        >
            <Icon
                size={size === 'sm' ? 13 : size === 'md' ? 16 : 18}
                className={cn('text-primary', iconClassName)}
            />
        </div>
        <div className="flex-1 min-w-0">
            <h3
                className={cn(
                    'font-semibold text-main leading-tight',
                    size === 'sm' && 'text-xs',
                    size === 'md' && 'text-sm',
                    size === 'lg' && 'text-base md:text-lg'
                )}
            >
                {title}
            </h3>
            {subtitle && (
                <p
                    className={cn(
                        'text-muted mt-0.5',
                        size === 'sm' ? 'text-micro' : 'text-xs'
                    )}
                >
                    {subtitle}
                </p>
            )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
    </div>
);
