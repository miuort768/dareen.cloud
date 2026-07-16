
export type LeadPriority = 'low' | 'medium' | 'high';
export type LeadStatus = 'new' | 'contacted' | 'interested' | 'trial' | 'converted' | 'lost';
export interface Lead {
    id: string;
    studentName: string;
    parentName?: string;
    phone: string;
    subject: string;
    curriculum?: string;
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
