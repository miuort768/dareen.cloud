import { useState, useEffect, useCallback } from 'react';
import { api } from '../../lib/api';
import type { Student, Teacher, Parent } from '../../types';

let studentsCache: Student[] | null = null;
let teachersCache: Teacher[] | null = null;
let parentsCache: Parent[] | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000;

export const useSharedData = () => {
    const [students, setStudents] = useState<Student[]>(studentsCache || []);
    const [teachers, setTeachers] = useState<Teacher[]>(teachersCache || []);
    const [parents, setParents] = useState<Parent[]>(parentsCache || []);
    const [loading, setLoading] = useState(!studentsCache);

    const fetchData = useCallback(async (force = false) => {
        const now = Date.now();
        if (!force && studentsCache && (now - lastFetchTime < CACHE_DURATION)) {
            return;
        }

        try {
            setLoading(true);
            const [stuData, teachData, parentData] = await Promise.all([
                api.get<Student[]>('/students'),
                api.get<Teacher[]>('/teachers'),
                api.get<Parent[]>('/parents')
            ]);

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
