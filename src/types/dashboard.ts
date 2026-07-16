export interface LowBalanceStudent {
    id: string;
    studentName: string;
    subject: string;
    remainingSessions: number;
    teacherName: string;
    parentPhone: string;
}

import type { Enrollment } from './index';

export interface Student {
    id: string;
    name?: string;
    parentPhone?: string;
    sessionPrice?: number;
    enrollments?: Enrollment[];
}


