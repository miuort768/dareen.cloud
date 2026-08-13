import { api } from '../../../lib/api';
import type { Lead, LeadStats } from '../types';

const mapLead = (l: Record<string, unknown>): Lead => ({
    ...l as unknown as Lead,
    createdAt: (l as { created_at?: string; createdAt?: string }).created_at ?? (l as { createdAt?: string }).createdAt ?? '',
});

export const crmService = {
    getAll: async (): Promise<Lead[]> => {
        const res = await api.get<Lead[] | { data: Lead[] }>('/leads');
        const list = Array.isArray(res) ? res : (res as { data: Lead[] }).data ?? res;
        return (Array.isArray(list) ? list : []).map(mapLead);
    },

    add: async (lead: Omit<Lead, 'id' | 'createdAt'>): Promise<Lead> => {
        const res = await api.post<Lead[] | { data: Lead[] }>('/leads', lead);
        const item = Array.isArray(res) ? res[0] : ((res as { data: Lead[] }).data ?? res);
        return mapLead(item as unknown as Record<string, unknown>);
    },

    update: async (id: string, updates: Partial<Lead>): Promise<Lead> => {
        const res = await api.put<Lead[] | { data: Lead[] }>(`/leads/${id}`, updates);
        const item = Array.isArray(res) ? res[0] : ((res as { data: Lead[] }).data ?? res);
        return mapLead(item as unknown as Record<string, unknown>);
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/leads/${id}`);
    },

    deleteAll: async (): Promise<{ success: boolean; deleted?: number }> => {
        const res = await api.delete<{ success: boolean; deleted?: number }>('/leads/all');
        return res;
    },

    getStats: async (): Promise<LeadStats> => {
        const res = await api.get<LeadStats | { data: LeadStats }>('/leads/stats');
        return (res as { data: LeadStats }).data ?? (res as LeadStats);
    },
};
