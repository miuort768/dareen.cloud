export const normalizePeriod = (period?: string | null): 'am' | 'pm' => {
    const p = (period || '').trim().toLowerCase();
    const amForms = ['am', 'صباحاً', 'صباحا', 'ص', 'am.', 'a.m', 'a.m.'];
    return amForms.includes(p) || p.startsWith('صباح') ? 'am' : 'pm';
};

export const periodLabel = (period?: string | null, long = false): string => {
    const am = normalizePeriod(period) === 'am';
    return am ? (long ? 'صباحاً' : 'ص') : (long ? 'مساءً' : 'م');
};

export const to24Minutes = (hour: string | number, period?: string | null): number => {
    const h = parseInt(String(hour), 10);
    if (Number.isNaN(h)) return 0;
    const isPM = normalizePeriod(period) === 'pm';
    return ((h % 12) + (isPM ? 12 : 0)) * 60;
};

export const normalizeSlot = (slot: { day?: string; hour?: string; period?: string }): { day: string; hour: string; period: 'am' | 'pm' } => ({
    day: (slot.day || '').trim(),
    hour: String(parseInt(String(slot.hour || '').trim(), 10) || 0),
    period: normalizePeriod(slot.period),
});
