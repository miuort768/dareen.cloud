import { Database } from 'sqlite';
import { Teacher, CreateTeacherInput, UpdateTeacherInput } from '../models/Teacher';

export class TeacherRepository {
    constructor(private db: Database) { }

    async findAll(): Promise<Teacher[]> {
        return this.db.all('SELECT id, name, phone1, phone2, subject, price, email, username FROM teachers');
    }

    async findById(id: string): Promise<Teacher | undefined> {
        return this.db.get('SELECT * FROM teachers WHERE id = ?', [id]);
    }

    async findByUsername(username: string): Promise<Teacher | undefined> {
        return this.db.get('SELECT * FROM teachers WHERE username = ?', [username]);
    }

    async create(teacher: CreateTeacherInput): Promise<Teacher> {
        const id = teacher.id || `t_${Math.random().toString(36).substr(2, 7)}`;
        await this.db.run(
            `INSERT INTO teachers (id, name, phone1, phone2, subject, price, email, username, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, teacher.name, teacher.phone1, teacher.phone2, teacher.subject, teacher.price || 0, teacher.email, teacher.username, teacher.password]
        );
        return (await this.findById(id))!;
    }

    async update(id: string, updates: UpdateTeacherInput): Promise<Teacher> {
        const fields = Object.keys(updates);
        const values = Object.values(updates);
        const setClause = fields.map(f => `${f} = ?`).join(', ');

        await this.db.run(
            `UPDATE teachers SET ${setClause} WHERE id = ?`,
            [...values, id]
        );
        return (await this.findById(id))!;
    }

    async delete(id: string): Promise<void> {
        await this.db.run('DELETE FROM teachers WHERE id = ?', [id]);
    }

    async deleteAll(): Promise<void> {
        await this.db.run('DELETE FROM teachers');
    }
}
