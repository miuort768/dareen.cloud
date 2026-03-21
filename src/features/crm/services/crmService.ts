
import type { Lead, LeadStats } from '../types';

const STORAGE_KEY = 'dareen_crm_leads';

const getLeads = (): Lead[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
};

const saveLeads = (leads: Lead[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
};

export const crmService = {
    getAll: async (): Promise<Lead[]> => {
        // Mocking API delay
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(getLeads());
            }, 500);
        });
    },

    add: async (lead: Omit<Lead, 'id' | 'createdAt'>): Promise<Lead> => {
        const leads = getLeads();
        const newLead: Lead = {
            ...lead,
            id: Math.random().toString(36).substr(2, 9),
            createdAt: new Date().toISOString()
        };
        leads.unshift(newLead);
        saveLeads(leads);
        return newLead;
    },

    update: async (id: string, updates: Partial<Lead>): Promise<Lead> => {
        const leads = getLeads();
        const idx = leads.findIndex(l => l.id === id);
        if (idx === -1) throw new Error('Lead not found');
        
        leads[idx] = { ...leads[idx], ...updates };
        saveLeads(leads);
        return leads[idx];
    },

    delete: async (id: string): Promise<void> => {
        const leads = getLeads();
        const filtered = leads.filter(l => l.id !== id);
        saveLeads(filtered);
    },

    getStats: async (): Promise<LeadStats> => {
        const leads = getLeads();
        const total = leads.length;
        const newCount = leads.filter(l => l.status === 'new').length;
        const interestedCount = leads.filter(l => l.status === 'interested').length;
        const convertedCount = leads.filter(l => l.status === 'converted').length;
        
        return {
            total,
            new: newCount,
            interested: interestedCount,
            converted: convertedCount,
            conversionRate: total > 0 ? (convertedCount / total) * 100 : 0
        };
    }
};
