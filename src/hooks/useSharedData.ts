import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

// Cache objects to store data between hook instances
let studentsCache: any[] | null = null;
let teachersCache: any[] | null = null;
let parentsCache: any[] | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useSharedData = () => {
    const [students, setStudents] = useState<any[]>(studentsCache || []);
    const [teachers, setTeachers] = useState<any[]>(teachersCache || []);
    const [parents, setParents] = useState<any[]>(parentsCache || []);
    const [loading, setLoading] = useState(!studentsCache);

    const fetchData = useCallback(async (force = false) => {
        const now = Date.now();
        if (!force && studentsCache && (now - lastFetchTime < CACHE_DURATION)) {
            return;
        }

        try {
            setLoading(true);
            const [stuData, teachData, parentData] = await Promise.all([
                api.get<any>('/students'),
                api.get<any[]>('/teachers'),
                api.get<any[]>('/parents')
            ]);

            studentsCache = (Array.isArray(stuData) ? stuData : stuData.data) || [];
            teachersCache = (Array.isArray(teachData) ? teachData : (teachData as any).data) || [];
            parentsCache = (Array.isArray(parentData) ? parentData : (parentData as any).data) || [];
            lastFetchTime = now;

            setStudents(studentsCache || []);
            setTeachers(teachersCache || []);
            setParents(parentsCache || []);
        } catch (error) {
            console.error("Shared data fetch failed", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const refreshData = () => fetchData(true);

    return { students, teachers, parents, loading, refreshData };
};
