import type { ScheduleSlot } from '../types';

export const generateSessionDates = (schedule: ScheduleSlot[], total: number): Date[] => {
    const dayMap: { [key: string]: number } = {
        'الأحد': 0, 'الاثنين': 1, 'الثلاثاء': 2, 'الأربعاء': 3, 'الخميس': 4, 'الجمعة': 5, 'السبت': 6
    };

    const dates: Date[] = [];
    let current = new Date();
    let count = 0;
    let loops = 0;

    while (count < total && loops < 365) {
        const currentDayName = Object.keys(dayMap).find(key => dayMap[key] === current.getDay());
        const scheduleMatch = schedule.find(s => s.day === currentDayName);

        if (scheduleMatch) {
            dates.push(new Date(current));
            count++;
        }
        current = new Date(current.setDate(current.getDate() + 1));
        loops++;
    }
    return dates;
};

export const formatTimeStr = (slot: ScheduleSlot): string => {
    return `${slot.hour} ${slot.period === 'am' ? 'صباحاً' : 'مساءً'}`;
};
