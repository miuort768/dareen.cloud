import type { Enrollment } from './index';

export interface Student {
    id: string;
    name?: string;
    parentPhone?: string;
    sessionPrice?: number;
    enrollments?: Enrollment[];
}


