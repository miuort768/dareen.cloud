export interface Teacher {
    id: string;
    name: string;
    phone1?: string;
    phone2?: string;
    subject?: string;
    price?: number;
    email?: string;
    username?: string;
    password?: string;
}

export type CreateTeacherInput = Omit<Teacher, 'id'> & { id?: string };
export type UpdateTeacherInput = Partial<Omit<Teacher, 'id'>>;
export type TeacherResponse = Omit<Teacher, 'password'>;
