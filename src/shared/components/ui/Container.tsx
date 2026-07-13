import { cn } from '../../../lib/utils';

interface ContainerProps {
    children: React.ReactNode;
    className?: string;
    as?: 'div' | 'section' | 'main';
}

export const Container = ({ children, className, as: Tag = 'div' }: ContainerProps) => (
    <Tag className={cn('w-full mx-auto max-w-page px-6', className)}>
        {children}
    </Tag>
);
