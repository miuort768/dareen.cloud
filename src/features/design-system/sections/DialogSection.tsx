import { useState } from 'react';
import { Dialog, Button } from '../../../shared/components/ui';
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';

export function DialogSection() {
    const [open, setOpen] = useState<'info' | 'success' | 'warning' | 'error' | null>(null);

    return (
        <section>
            <h2 className="text-lg font-bold text-main mb-4">مربعات الحوار — Dialogs</h2>
            <div className="flex flex-wrap gap-3">
                <Button variant="primary" onClick={() => setOpen('info')}>
                    <Info size={16} /> Info
                </Button>
                <Button variant="primary" onClick={() => setOpen('success')}>
                    <CheckCircle size={16} /> Success
                </Button>
                <Button variant="primary" onClick={() => setOpen('warning')}>
                    <AlertTriangle size={16} /> Warning
                </Button>
                <Button variant="primary" onClick={() => setOpen('error')}>
                    <XCircle size={16} /> Error
                </Button>
            </div>

            <Dialog
                isOpen={open === 'info'}
                onClose={() => setOpen(null)}
                title="تأكيد العملية"
                message="هل أنت متأكد من رغبتك في متابعة هذه العملية؟"
                variant="info"
                onConfirm={() => setOpen(null)}
                onCancel={() => setOpen(null)}
                icon={<Info size={24} />}
            />
            <Dialog
                isOpen={open === 'success'}
                onClose={() => setOpen(null)}
                title="تم بنجاح"
                message="تم حفظ التغييرات بنجاح في قاعدة البيانات."
                variant="success"
                onConfirm={() => setOpen(null)}
                icon={<CheckCircle size={24} />}
                confirmLabel="حسناً"
            />
            <Dialog
                isOpen={open === 'warning'}
                onClose={() => setOpen(null)}
                title="انتباه"
                message="سيتم حذف هذا العنصر بشكل دائم. لا يمكن التراجع عن هذا الإجراء."
                variant="warning"
                onConfirm={() => setOpen(null)}
                onCancel={() => setOpen(null)}
                icon={<AlertTriangle size={24} />}
            />
            <Dialog
                isOpen={open === 'error'}
                onClose={() => setOpen(null)}
                title="خطأ"
                message="تعذر الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى."
                variant="error"
                onConfirm={() => setOpen(null)}
                icon={<XCircle size={24} />}
                confirmLabel="إعادة المحاولة"
            />
        </section>
    );
}
