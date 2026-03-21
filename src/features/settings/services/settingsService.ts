import { api } from '../../../lib/api';

export const settingsService = {
    async getBackup() {
        return api.get<any>('/system/backup');
    },

    async restoreBackup(data: any) {
        return api.post<any>('/system/restore', { data });
    },

    async systemReset() {
        return api.post<any>('/system/system-reset');
    },

    async getAuditLogs() {
        return api.get<any[]>('/system/audit-logs');
    },

    async createAuditLog(log: { action: string; details: string; userId: string; username: string }) {
        return api.post<any>('/system/audit-logs', log);
    },

    async getWhatsappTemplates() {
        return api.get<any[]>('/system/whatsapp-templates');
    },

    async createWhatsappTemplate(template: { name: string; body: string; type: string }) {
        return api.post<any>('/system/whatsapp-templates', template);
    },

    async updateWhatsappTemplate(id: number, template: { name: string; body: string; type: string }) {
        return api.put<any>(`/system/whatsapp-templates/${id}`, template);
    },

    async deleteWhatsappTemplate(id: number) {
        return api.delete<any>(`/system/whatsapp-templates/${id}`);
    }
};
