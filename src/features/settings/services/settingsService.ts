import { api } from '../../../lib/api';

export const settingsService = {
    async getBackup() {
        return api.get<unknown>('/system/backup');
    },

    async restoreBackup(data: Record<string, unknown>) {
        return api.post<{ success: boolean }>('/system/restore', { data });
    },

    async systemReset() {
        return api.post<{ success: boolean }>('/system/system-reset');
    },

    async archiveMonth() {
        return api.post<{ success: boolean }>('/system/archive-month');
    },

    async getAuditLogs() {
        return api.get<unknown[]>('/system/audit-logs');
    },

    async createAuditLog(log: { action: string; details: string; userId: string; username: string }) {
        return api.post<unknown>('/system/audit-logs', log);
    },

    async getWhatsappTemplates() {
        return api.get<unknown[]>('/system/whatsapp-templates');
    },

    async createWhatsappTemplate(template: { name: string; body: string; type: string }) {
        return api.post<unknown>('/system/whatsapp-templates', template);
    },

    async updateWhatsappTemplate(id: number, template: { name: string; body: string; type: string }) {
        return api.put<unknown>(`/system/whatsapp-templates/${id}`, template);
    },

    async deleteWhatsappTemplate(id: number) {
        return api.delete<{ success: boolean }>(`/system/whatsapp-templates/${id}`);
    }
};
