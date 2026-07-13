import { cn } from '../../../lib/utils';

const sizeMap = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-20 h-20 text-2xl',
};

interface AvatarProps {
    src?: string;
    alt?: string;
    name?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    indicator?: 'online' | 'offline' | 'away';
}

const indicatorMap = {
    online: 'bg-success',
    offline: 'bg-muted',
    away: 'bg-warning',
};

const indicatorSizeMap = {
    sm: 'w-2 h-2 end-0 bottom-0',
    md: 'w-2.5 h-2.5 end-0 bottom-0',
    lg: 'w-3 h-3 end-0.5 bottom-0.5',
    xl: 'w-3.5 h-3.5 end-0.5 bottom-0.5',
};

export const Avatar = ({ src, alt = '', name, size = 'md', className, indicator }: AvatarProps) => {
    const initial = name ? name.charAt(0).toUpperCase() : '?';
    const s = sizeMap[size];

    return (
        <div className={cn('relative shrink-0', className)}>
            {src ? (
                <img
                    src={src}
                    alt={alt || name || 'Avatar'}
                    className={cn(s, 'rounded-full object-cover bg-card border-2 border-border')}
                />
            ) : (
                <div className={cn(
                    s,
                    'rounded-full flex items-center justify-center font-bold bg-primary-soft text-primary border-2 border-border'
                )}>
                    {initial}
                </div>
            )}
            {indicator && (
                <span className={cn(
                    'absolute rounded-full border-2 border-card',
                    indicatorMap[indicator],
                    indicatorSizeMap[size]
                )} />
            )}
        </div>
    );
};
