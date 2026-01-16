import type { Parent, Student } from '../../types';

export interface ParentFeatureState {
    loading: boolean;
    parents: Parent[];
    students: Student[];
    searchTerm: string;
    showAddForm: boolean;
    selectedParent: Parent | null;
    showDetails: boolean;
    editId: string | null;
    showConfirmToast: boolean;
    confirmMessage: string;
    newParent: { name: string; phone: string; email: string };
}

export interface FamilyScheduleItem {
    day: string;
    hour: string;
    period: string;
    studentName: string;
    subject: string;
}
