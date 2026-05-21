import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

// Cache objects to store data between hook instances
let studentsCache: Record<string, unknown>[] | null = null;
let teachersCache: Record<string, unknown>[] | null = null;
let parentsCache: Record<string, unknown>[] | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useSharedData = () => {
    const [students, setStudents] = useState<Record<string, unknown>[]>(studentsCache || []);
    const [teachers, setTeachers] = useState<Record<string, unknown>[]>(teachersCache || []);
    const [parents, setParents] = useState<Record<string, unknown>[]>(parentsCache || []);
    const [loading, setLoading] = useState(!studentsCache);

    const fetchData = useCallback(async (force = false) => {
        const now = Date.now();
        if (!force && studentsCache && (now - lastFetchTime < CACHE_DURATION)) {
            return;
        }

        try {
            setLoading(true);
            const [stuData, teachData, parentData] = await Promise.all([
                api.get<Record<string, unknown>[]>('/students'),
                api.get<Record<string, unknown>[]>('/teachers'),
                api.get<Record<string, unknown>[]>('/parents')
            ]);

            studentsCache = (Array.isArray(stuData) ? stuData : (stuData as Record<string, unknown>).data) as Record<string, unknown>[] || [];
            teachersCache = (Array.isArray(teachData) ? teachData : (teachData as Record<string, unknown>).data) as Record<string, unknown>[] || [];
            parentsCache = (Array.isArray(parentData) ? parentData : (parentData as Record<string, unknown>).data) as Record<string, unknown>[] || [];
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
