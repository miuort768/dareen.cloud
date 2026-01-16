import { Router } from 'express';
import { TeacherController } from '../controllers/TeacherController';

const router = Router();
const controller = new TeacherController();

router.route('/')
    .get(controller.getAllTeachers)
    .post(controller.createTeacher);

router.route('/:id')
    .get(controller.getTeacher)
    .patch(controller.updateTeacher)
    .delete(controller.deleteTeacher);

export default router;
