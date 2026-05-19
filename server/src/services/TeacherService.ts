import bcrypt from 'bcrypt';
import { TeacherRepository } from '../repositories/TeacherRepository';
import { CreateTeacherInput, UpdateTeacherInput, TeacherResponse } from '../models/Teacher';

export class TeacherService {
    constructor(private teacherRepo: TeacherRepository) { }

    async getAllTeachers(): Promise<TeacherResponse[]> {
        const teachers = await this.teacherRepo.findAll();
        return teachers.map(({ password, ...rest }) => rest);
    }

    async getTeacherById(id: string): Promise<TeacherResponse | null> {
        const teacher = await this.teacherRepo.findById(id);
        if (!teacher) return null;
        const { password, ...rest } = teacher;
        return rest;
    }

    async createTeacher(data: CreateTeacherInput): Promise<TeacherResponse> {
        const hashedPassword = data.password ? await bcrypt.hash(data.password, 10) : undefined;
        const teacher = await this.teacherRepo.create({
            ...data,
            password: hashedPassword
        });
        const { password, ...rest } = teacher;
        return rest;
    }

    async updateTeacher(id: string, data: UpdateTeacherInput): Promise<TeacherResponse> {
        if (data.password) {
            data.password = await bcrypt.hash(data.password, 10);
        }
        const teacher = await this.teacherRepo.update(id, data);
        const { password, ...rest } = teacher;
        return rest;
    }

    async deleteTeacher(id: string): Promise<void> {
        await this.teacherRepo.delete(id);
    }
}
