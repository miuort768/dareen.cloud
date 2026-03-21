
export type LeadStatus = 'new' | 'contacted' | 'interested' | 'trial' | 'converted' | 'lost';
export type LeadPriority = 'high' | 'medium' | 'low';

export interface Lead {
    id: string;
    studentName: string;
    parentName?: string;
    phone: string;
    subject: string;
    status: LeadStatus;
    priority: LeadPriority;
    notes?: string;
    createdAt: string;
    lastContact?: string;
    source?: string; // e.g. Facebook, Website, Referral
}

export interface LeadStats {
    total: number;
    new: number;
    interested: number;
    converted: number;
    conversionRate: number;
}
