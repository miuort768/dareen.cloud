import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../../config/api';

let studentsCache: any[] | null = null;
let teachersCache: any[] | null = null;
let parentsCache: any[] | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000;

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
            const [stuRes, teachRes, parentRes] = await Promise.all([
                fetch(`${API_BASE_URL}/students`),
                fetch(`${API_BASE_URL}/teachers`),
                fetch(`${API_BASE_URL}/parents`)
            ]);

            const stuData = await stuRes.json();
            const teachData = await teachRes.json();
            const parentData = await parentRes.json();

            studentsCache = Array.isArray(stuData) ? stuData : [];
            teachersCache = Array.isArray(teachData) ? teachData : [];
            parentsCache = Array.isArray(parentData) ? parentData : [];
            lastFetchTime = now;

            setStudents(studentsCache);
            setTeachers(teachersCache);
            setParents(parentsCache);
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
