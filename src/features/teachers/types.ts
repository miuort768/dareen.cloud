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
}
