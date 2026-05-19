import '../types/express.d.ts'
import { Request, Response, NextFunction } from 'express';
import { TeacherService } from '../services/TeacherService';
import { TeacherRepository } from '../repositories/TeacherRepository';
import { AppError } from '../utils/AppError';

export class TeacherController {
    private getService(req: Request): TeacherService {
        const repo = new TeacherRepository(req.db);
        return new TeacherService(repo);
    }

    getAllTeachers = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const service = this.getService(req);
            const teachers = await service.getAllTeachers();
            res.status(200).json(teachers);
        } catch (err) {
            next(err);
        }
    };

    getTeacher = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const service = this.getService(req);
            const teacher = await service.getTeacherById(req.params.id);
            if (!teacher) {
                return next(new AppError('No teacher found with that ID', 404));
            }
            res.status(200).json(teacher);
        } catch (err) {
            next(err);
        }
    };

    createTeacher = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const service = this.getService(req);
            const teacher = await service.createTeacher(req.body);
            res.status(201).json(teacher);
        } catch (err) {
            next(err);
        }
    };

    updateTeacher = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const service = this.getService(req);
            const teacher = await service.updateTeacher(req.params.id, req.body);
            res.status(200).json(teacher);
        } catch (err) {
            next(err);
        }
    };

    deleteTeacher = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const service = this.getService(req);
            await service.deleteTeacher(req.params.id);
            res.status(204).json(null);
        } catch (err) {
            next(err);
        }
    };
}
