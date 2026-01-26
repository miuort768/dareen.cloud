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
    }
};
