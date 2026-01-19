import type { ScheduleSlot } from '../types';

export const generateSessionDates = (schedule: ScheduleSlot[], total: number): { date: Date; slot: ScheduleSlot }[] => {
    const dayMap: { [key: string]: number } = {
        'الأحد': 0, 'الاثنين': 1, 'الثلاثاء': 2, 'الأربعاء': 3, 'الخميس': 4, 'الجمعة': 5, 'السبت': 6
    };

    const results: { date: Date; slot: ScheduleSlot }[] = [];
    let current = new Date();
    let count = 0;
    let loops = 0;

    // Safety limit to avoid infinite loops
    while (count < total && loops < 365) {
        const currentDayName = Object.keys(dayMap).find(key => dayMap[key] === current.getDay());
        // Find ALL slots for this day, not just find(...) which returns only the first one if multiple exist for same day
        const daySlots = schedule.filter(s => s.day === currentDayName);

        for (const slot of daySlots) {
            if (count < total) {
                results.push({
                    date: new Date(current),
                    slot
                });
                count++;
            }
        }

        current = new Date(current.setDate(current.getDate() + 1));
        loops++;
    }
    return results;
};

export const formatTimeStr = (slot: ScheduleSlot): string => {
    return `${slot.hour} ${slot.period === 'am' ? 'صباحاً' : 'مساءً'}`;
};
