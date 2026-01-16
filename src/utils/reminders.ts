export interface ReminderParams {
    studentName: string;
    subject: string;
    teacherName: string;
    remainingSessions: number;
    parentPhone: string;
    isAdmin: boolean;
    adminPhone: string;
}

export const generateWhatsAppLink = ({
    studentName,
    subject,
    teacherName,
    remainingSessions,
    parentPhone,
    isAdmin,
    adminPhone
}: ReminderParams) => {
    let message = '';
    let targetPhone = '';

    if (!isAdmin) {
        // Teacher sending to Admin
        message = `الأستاذ مدير النظام تحية طيبة،\nنحيطكم علماً بأن رصيد الطالب ( ${studentName} ) في مادة ( ${subject} ) لدى المعلمة ( ${teacherName} ) قد شارف على الانتهاء.\nالمتبقي حالياً: ${remainingSessions} حصص فقط.\nيرجى التكرم بالتواصل مع ولي الأمر لتجديد الاشتراك.\nشكراً لكم.`;
        targetPhone = adminPhone;
    } else {
        // Admin sending to Parent
        message = `السلام عليكم ورحمة الله وبركاته،\nنحيطكم علماً بأن رصيد الطالب ( ${studentName} ) في مادة ( ${subject} ) قد شارف على الانتهاء.\nالمتبقي حالياً: ${remainingSessions} حصص فقط.\nيرجى التكرم بتجديد الاشتراك لضمان استمرارية الحصص.\nشكراً لكم.`;
        targetPhone = parentPhone;
    }

    let phone = targetPhone.replace(/\D/g, '');
    if (phone.startsWith('01') && phone.length === 11) phone = '2' + phone;
    else if (phone.length === 10 && !phone.startsWith('2')) phone = '20' + phone;
    else if (!phone.startsWith('2') && phone.length > 0) phone = '2' + phone;

    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
};

import type { Student, Enrollment } from '../features/students/types';

export const sendWhatsAppReminder = (student: Student, enrollment: Enrollment) => {
    const link = generateWhatsAppLink({
        studentName: student.name,
        subject: enrollment.subject,
        teacherName: enrollment.teacher,
        remainingSessions: enrollment.sessionsTotal - enrollment.sessionsUsed,
        parentPhone: student.parentPhone,
        isAdmin: true, // Assuming Admin context here for now
        adminPhone: '01000000000' // Placeholder
    });
    window.open(link, '_blank');
};
