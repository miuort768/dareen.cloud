import { ConfirmModal } from '../../../../shared/components/ConfirmModal';
import { SecureAttendanceModal } from '../../../../shared/components/SecureAttendanceModal';
import { SendNotificationModal } from '../../../../shared/components/SendNotificationModal';
import { SuccessModal } from '../../../../shared/components/SuccessModal';
import type { Student, Enrollment } from '../../../../types';

interface TeachersPageModalsProps {
    deletingTeacherId: string | null;
    onConfirmDelete: () => void;
    onCancelDelete: () => void;
    secureModalData: { student: Student; enrollment: Enrollment } | null;
    onSecureClose: () => void;
    onSecureConfirm: (status: 'completed' | 'cancelled', topics?: string, homework?: string, needsCompensation?: boolean) => Promise<boolean | void>;
    secureStudentName: string;
    logDate: string;
    notifyingTeacher: { id: string; name: string } | null;
    onNotifyClose: () => void;
    onNotifySend: (message: string) => void;
    notifyName: string;
    successData: { isOpen: boolean; title: string; message: string };
    onSuccessClose: () => void;
}

export const TeachersPageModals = ({
    deletingTeacherId, onConfirmDelete, onCancelDelete,
    secureModalData, onSecureClose, onSecureConfirm, secureStudentName, logDate,
    notifyingTeacher, onNotifyClose, onNotifySend, notifyName,
    successData, onSuccessClose
}: TeachersPageModalsProps) => (
    <>
        <ConfirmModal isOpen={!!deletingTeacherId} title="حذف معلمة"
            message="سيتم حذف كافة البيانات المتعلقة بهذه المعلمة. هل أنت متأكد؟"
            onConfirm={onConfirmDelete} onClose={onCancelDelete} />
        <SecureAttendanceModal isOpen={!!secureModalData} onClose={onSecureClose}
            onConfirm={onSecureConfirm} studentName={secureStudentName} date={logDate} />
        <SendNotificationModal isOpen={!!notifyingTeacher} onClose={onNotifyClose}
            onSend={onNotifySend} recipientName={notifyName} />
        <SuccessModal isOpen={successData.isOpen} title={successData.title}
            message={successData.message} onClose={onSuccessClose} />
    </>
);
