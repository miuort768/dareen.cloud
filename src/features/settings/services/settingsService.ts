import { api } from '../../../lib/api';

export interface Currency {
    code: string;
    name: string;
    symbol: string;
    isActive: number;
    sortOrder: number;
}

export interface ExchangeRate {
    id: number;
    fromCurrency: string;
    toCurrency: string;
    buyRate: number;
    sellRate: number;
    effectiveDate: string;
    notes: string | null;
    createdAt: string;
    createdBy: string | null;
}

export interface SettingsBatch {
    system: Record<string, string>;
    financial: Record<string, string>;
}

export const settingsService = {
    async getSettingsBatch() {
        return api.get<SettingsBatch>('/system/settings-batch');
    },

    async saveSettingsBatch(settings: { key: string; value: string }[]) {
        return api.post<{ success: boolean }>('/system/settings-batch', { settings });
    },

    async getFinancialSettings() {
        return api.get<Record<string, string>>('/system/financial-settings');
    },

    async saveFinancialSetting(key: string, value: string) {
        return api.post<{ success: boolean }>('/system/financial-settings', { key, value });
    },

    // Currencies
    async getCurrencies() {
        return api.get<Currency[]>('/currencies');
    },

    async createCurrency(data: { code: string; name: string; symbol: string; sortOrder?: number }) {
        return api.post<Currency>('/currencies', data);
    },

    async updateCurrency(code: string, data: { name: string; symbol: string; isActive: number; sortOrder: number }) {
        return api.put<Currency>(`/currencies/${code}`, data);
    },

    async deleteCurrency(code: string) {
        return api.delete<{ success: boolean }>(`/currencies/${code}`);
    },

    // Exchange Rates
    async getExchangeRates() {
        return api.get<ExchangeRate[]>('/currencies/exchange-rates');
    },

    async createExchangeRate(data: { fromCurrency: string; toCurrency: string; buyRate: number; sellRate: number; effectiveDate?: string; notes?: string }) {
        return api.post<ExchangeRate>('/currencies/exchange-rates', data);
    },

    async deleteExchangeRate(id: number) {
        return api.delete<{ success: boolean }>(`/currencies/exchange-rates/${id}`);
    },
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
    },

    // Monitoring
    async getMonitoring() {
        return api.get<{ uptime: number; memory: Record<string, number>; database: string; counts: Record<string, number>; timestamp: string; total: number; errors: number; slow: unknown[] }>('/system/monitoring');
    },

    // Backup
    async createBackup() {
        return api.post<{ id: number; type: string; status: string; size: number; createdAt: string }>('/system/backup');
    },

    async getBackupHistory(page = 1, limit = 20) {
        return api.get<{ data: unknown[]; total: number; page: number; limit: number; totalPages: number }>(`/system/backup-history?page=${page}&limit=${limit}`);
    },

    async verifyPassword(password: string) {
        return api.post<{ valid: boolean }>('/system/verify-password', { password });
    },
};
