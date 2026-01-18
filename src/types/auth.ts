export interface User {
    id: string;
    name: string;
    username: string;
    password?: string;
    avatar?: string;
    role?: 'admin' | 'teacher' | 'chat_user';
    teacherName?: string;
    permissions?: string[];
}
