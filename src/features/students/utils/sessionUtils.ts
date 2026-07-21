import type { ScheduleSlot } from '../types';

export const generateSessionDates = (schedule: ScheduleSlot[], total: number): { date: Date; slot: ScheduleSlot }[] => {
    const dayMap: { [key: string]: number } = {
        'الأحد': 0, 'الاثنين': 1, 'الثلاثاء': 2, 'الأربعاء': 3, 'الخميس': 4, 'الجمعة': 5, 'السبت': 6
    };

    const results: { date: Date; slot: ScheduleSlot }[] = [];
    let current = new Date();
    let count = 0;
    let loops = 0;

    if (schedule.length === 0) return results;

    // Align to the first schedule day
    const firstDayName = schedule[0].day;
    const firstDayNum = dayMap[firstDayName];
    if (firstDayNum !== undefined) {
        const currentDay = current.getDay();
        let diff = (firstDayNum - currentDay + 7) % 7;
        if (diff === 0) diff = 7; // Start next week if today matches
        current.setDate(current.getDate() + diff);
    }

    while (count < total && loops < 365) {
        const currentDayName = Object.keys(dayMap).find(key => dayMap[key] === current.getDay());
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


