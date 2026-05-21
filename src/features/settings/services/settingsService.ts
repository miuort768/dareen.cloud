import { api } from '../../../lib/api';

export const settingsService = {
    async getBackup() {
        return api.get<Record<string, unknown>>('/system/backup');
    },

    async restoreBackup(data: Record<string, unknown>) {
        return api.post<Record<string, unknown>>('/system/restore', { data });
    },

    async systemReset() {
        return api.post<Record<string, unknown>>('/system/system-reset');
    },

    async archiveMonth() {
        return api.post<Record<string, unknown>>('/system/archive-month');
    },

    async getAuditLogs() {
        return api.get<Record<string, unknown>[]>('/system/audit-logs');
    },

    async createAuditLog(log: { action: string; details: string; userId: string; username: string }) {
        return api.post<Record<string, unknown>>('/system/audit-logs', log);
    },

    async getWhatsappTemplates() {
        return api.get<Record<string, unknown>[]>('/system/whatsapp-templates');
    },

    async createWhatsappTemplate(template: { name: string; body: string; type: string }) {
        return api.post<Record<string, unknown>>('/system/whatsapp-templates', template);
    },

    async updateWhatsappTemplate(id: number, template: { name: string; body: string; type: string }) {
        return api.put<Record<string, unknown>>(`/system/whatsapp-templates/${id}`, template);
    },

    async deleteWhatsappTemplate(id: number) {
        return api.delete<Record<string, unknown>>(`/system/whatsapp-templates/${id}`);
    }
};
