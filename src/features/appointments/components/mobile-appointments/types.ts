export interface Student {
    id: string;
    name: string;
    grade: string;
    enrollments: Enrollment[];
}

export interface Enrollment {
    teacher: string;
    subject: string;
    curr: string;
    teacherId?: string | number;
    schedule: ScheduleSlot[];
}

export interface ScheduleSlot {
    day: string;
    hour: string;
    period: string;
}

export interface AppointmentEvent {
    id: string;
    studentName: string;
    studentGrade: string;
    teacherName: string;
    subject: string;
    curriculum: string;
    day: string;
    hour: string;
    period: string;
    time: string;
    isPM: boolean;
}

export const DAYS_OF_WEEK = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
