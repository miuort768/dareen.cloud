import { api } from '../../../lib/api';
import type { Parent, Student } from '../../../types';

export const parentsService = {
    async getParents() {
        return api.get<Parent[]>('/parents');
    },

    async getStudents() {
        return api.get<Student[]>('/students');
    },

    async addParent(parent: Omit<Parent, 'id'>) {
        return api.post<Parent>('/parents', parent);
    },

    async updateParent(id: string, parent: Partial<Parent>) {
        return api.put<Parent>(`/parents/${id}`, parent);
    },

    async deleteParent(id: string, password?: string) {
        return api.delete(`/parents/${id}`, {
            headers: password ? { 'X-Delete-Password': password } : {}
        });
    },

    async importParents(newParents: Omit<Parent, 'id'>[]) {
        let successCount = 0;
        let failCount = 0;
        const errors: string[] = [];

        for (const p of newParents) {
            try {
                await this.addParent(p);
                successCount++;
            } catch (error) {
                failCount++;
                const message = error?.response?.data?.error || error?.message || 'خطأ غير معروف';
                errors.push(message);
                console.error("Error importing parent", error);
            }
        }

        return { successCount, failCount, errors };
    }
};
