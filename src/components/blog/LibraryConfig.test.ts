import { describe, it, expect } from 'vitest';
import { types, curriculums, gradesMap, subjectsMap, subjectNameMap, classroomsMap, directTypes } from './LibraryConfig';

describe('LibraryConfig', () => {
    it('types has correct entries', () => {
        expect(types).toHaveLength(4);
        expect(types.map(t => t.id)).toEqual(['foundation', 'solutions', 'notes', 'more']);
    });

    it('curriculums has correct entries', () => {
        expect(curriculums).toHaveLength(4);
        expect(curriculums.map(c => c.id)).toEqual(['kuwait', 'qatar', 'uae', 'saudi']);
    });

    it('gradesMap has entries for all curriculums', () => {
        curriculums.forEach(c => {
            expect(gradesMap[c.id]).toBeDefined();
            expect(gradesMap[c.id].length).toBeGreaterThan(0);
        });
    });

    it('subjectsMap has entries for primary, middle, secondary', () => {
        expect(subjectsMap.primary.length).toBeGreaterThan(0);
        expect(subjectsMap.middle.length).toBeGreaterThan(0);
        expect(subjectsMap.secondary.length).toBeGreaterThan(0);
    });

    it('subjectNameMap has unique names', () => {
        const uniqueIds = new Set(Object.keys(subjectNameMap));
        expect(uniqueIds.size).toBeGreaterThan(5);
        expect(subjectNameMap.math).toBe('رياضيات');
        expect(subjectNameMap.arabic).toBe('عربي');
    });

    it('classroomsMap has correct structure', () => {
        expect(classroomsMap.kuwait.primary).toEqual(['1', '2', '3', '4', '5']);
        expect(classroomsMap.saudi.secondary).toEqual(['10', '11', '12']);
    });

    it('directTypes contains foundation and more', () => {
        expect(directTypes).toContain('foundation');
        expect(directTypes).toContain('more');
        expect(directTypes).not.toContain('notes');
    });

    it('basic and preparatory alias middle', () => {
        expect(subjectsMap.basic).toBe(subjectsMap.middle);
        expect(subjectsMap.preparatory).toBe(subjectsMap.middle);
    });
});
