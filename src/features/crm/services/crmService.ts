import { api } from '../../../lib/api';
import type { Lead, LeadStats } from '../types';

const mapLead = (l: any): Lead => ({
    ...l,
    createdAt: l.created_at ?? l.createdAt,
});

export const crmService = {
    getAll: async (): Promise<Lead[]> => {
        const res = await api.get('/leads') as any;
        return (Array.isArray(res) ? res : res.data ?? res).map(mapLead);
    },

    add: async (lead: Omit<Lead, 'id' | 'createdAt'>): Promise<Lead> => {
        const res = await api.post('/leads', lead) as any;
        return mapLead(Array.isArray(res) ? res[0] : (res.data ?? res));
    },

    update: async (id: string, updates: Partial<Lead>): Promise<Lead> => {
        const res = await api.put(`/leads/${id}`, updates) as any;
        return mapLead(Array.isArray(res) ? res[0] : (res.data ?? res));
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/leads/${id}`);
    },

    getStats: async (): Promise<LeadStats> => {
        const res = await api.get('/leads/stats') as any;
        return res.data ?? res;
    },
};
