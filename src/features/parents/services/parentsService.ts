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

    async deleteParent(id: string) {
        return api.delete(`/parents/${id}`);
    },

    async importParents(newParents: Omit<Parent, 'id'>[]) {
        let successCount = 0;
        let failCount = 0;

        for (const p of newParents) {
            try {
                await this.addParent(p);
                successCount++;
            } catch (error) {
                failCount++;
                console.error("Error importing parent", error);
            }
        }

        return { successCount, failCount };
    }
};
