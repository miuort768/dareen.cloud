export interface Teacher {
    id: string;
    name: string;
    phone1: string;
    phone2?: string;
    email?: string;
    subject: string;
    price: number;
    currency?: string;
    username?: string;
    password?: string;
    points?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface Session {
    id: string;
    studentId: string;
    studentName: string;
    teacherName: string;
    subject: string;
    date: string;
    time: string;
    status: 'completed' | 'cancelled' | 'scheduled';
    price?: number;
    teacherPrice?: number;
    createdAt?: string;
}

export interface TeacherActivity {
    lastSession?: {
        studentName: string;
        subject?: string;
        date: string;
        time?: string;
        createdAt?: string;
    } | null;
    lastLoginAt?: string | null;
    lastChat?: {
        withName?: string | null;
        conversationName?: string | null;
        isGroup?: boolean;
        content?: string;
        timestamp?: string;
    } | null;
}
