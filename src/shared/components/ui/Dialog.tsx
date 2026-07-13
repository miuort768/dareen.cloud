import { Modal } from './Modal';
import { Button } from './Button';
import { cn } from '../../../lib/utils';

interface DialogProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'info' | 'success' | 'warning' | 'error';
    onConfirm?: () => void;
    onCancel?: () => void;
    isLoading?: boolean;
    icon?: React.ReactNode;
}

const variantIcons: Record<string, string> = {
    info: 'text-primary',
    success: 'text-success',
    warning: 'text-warning',
    error: 'text-error',
};

export const Dialog = ({
    isOpen,
    onClose,
    title,
    message,
    confirmLabel = 'تأكيد',
    cancelLabel = 'إلغاء',
    variant = 'info',
    onConfirm,
    onCancel,
    isLoading,
    icon,
}: DialogProps) => (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
        <div className="flex flex-col items-center text-center py-4">
            {icon && (
                <div className={cn('mb-4', variantIcons[variant])}>{icon}</div>
            )}
            <p className="text-sm text-main mb-6 leading-relaxed">{message}</p>
            <div className="flex items-center gap-3 w-full">
                {onCancel && (
                    <Button variant="secondary" onClick={onCancel || onClose} className="flex-1" size="md">
                        {cancelLabel}
                    </Button>
                )}
                {onConfirm && (
                    <Button
                        variant="primary"
                        onClick={onConfirm}
                        isLoading={isLoading}
                        className="flex-1"
                        size="md"
                    >
                        {confirmLabel}
                    </Button>
                )}
            </div>
        </div>
    </Modal>
);
