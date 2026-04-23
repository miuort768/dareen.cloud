import { api } from '../../../lib/api';
import type { Lead, LeadStats } from '../types';

export const crmService = {
    getAll: async (): Promise<Lead[]> => {
        const res = await api.get('/leads');
        return res.data.map((l: any) => ({
            ...l,
            createdAt: l.created_at ?? l.createdAt,
        }));
    },

    add: async (lead: Omit<Lead, 'id' | 'createdAt'>): Promise<Lead> => {
        const res = await api.post('/leads', lead);
        return { ...res.data, createdAt: res.data.created_at ?? res.data.createdAt };
    },

    update: async (id: string, updates: Partial<Lead>): Promise<Lead> => {
        const res = await api.put(`/leads/${id}`, updates);
        return { ...res.data, createdAt: res.data.created_at ?? res.data.createdAt };
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/leads/${id}`);
    },

    getStats: async (): Promise<LeadStats> => {
        const res = await api.get('/leads/stats');
        return res.data;
    },
};
