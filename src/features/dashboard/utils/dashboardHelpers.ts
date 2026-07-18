import type { Student, Session, Transaction, TeacherInvoice, Enrollment } from '../../../types';
import type { LowBalanceStudent, DashboardMonthData } from '../types';

export const getSafeArray = (val: unknown): unknown[] => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    if (val && typeof val === 'object' && 'data' in val && Array.isArray((val as { data: unknown[] }).data)) return (val as { data: unknown[] }).data;
    if (typeof val === 'object') {
        return (Object.values(val).find(Array.isArray) as unknown[]) || [];
    }
    return [];
};

export const isSameMonth = (dateStr: string, now: Date): boolean => {
    if (!dateStr) return false;
    try {
        const d = new Date(dateStr);
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    } catch (e) {
        console.warn(e);
        return dateStr.startsWith(now.toISOString().slice(0, 7));
    }
};

export const getSessionRev = (s: Session, students: Student[]): number => {
    if (s.price !== null && s.price !== undefined) return Number(s.price);
    const stu = students.find((st: Student) => st.id === s.studentId);
    return Number(stu?.sessionPrice) || 0;
};

export const getRevenue = (list: Session[], students: Student[]): number =>
    list.reduce((sum: number, s: Session) => sum + getSessionRev(s, students), 0);

export const getManualInc = (list: Transaction[]): number =>
    list.filter((t: Transaction) => t.type === 'income').reduce((sum: number, t: Transaction) => sum + (Number(t.amount) || 0), 0);

export const getPaidInv = (list: TeacherInvoice[]): number =>
    list.filter((inv: TeacherInvoice) =>
        ['paid', 'مدفوعة', 'تم الدفع'].includes(inv.status?.toLowerCase())
    ).reduce((sum: number, inv: TeacherInvoice) => sum + (Number(inv.amount) || 0), 0);

export const getManualExp = (list: Transaction[]): number =>
    list.filter((t: Transaction) => t.type === 'expense').reduce((sum: number, t: Transaction) => sum + (Number(t.amount) || 0), 0);

export const computeLowBalanceStudents = (
    students: Student[], sessions: Session[], teacherName: string, currentUserId: string, isTeacher: boolean
): { lowBalance: LowBalanceStudent[]; anticipatedCollection: number } => {
    const lowBalance: LowBalanceStudent[] = [];
    let anticipatedCollection = 0;

    students.forEach((s: Student) => {
        s.enrollments?.forEach((en: Enrollment) => {
            if (isTeacher && en.teacher !== teacherName && en.teacherId !== currentUserId) return;
            const total = Number(en.sessionsTotal) || 0;
            const actualUsed = sessions.filter((ss: Session) =>
                ss.studentId === s.id &&
                (ss.teacherId === en.teacherId || ss.teacherName === en.teacher) &&
                ss.subject === en.subject &&
                ['completed', 'مكتملة', 'تم الإنجاز'].includes(ss.status?.toLowerCase())
            ).length;

            const remaining = total - actualUsed;
            if (remaining <= 2 && remaining >= 0) {
                const price = Number(s.sessionPrice) || 0;
                lowBalance.push({
                    id: s.id,
                    studentName: s.name || '',
                    subject: en.subject || '',
                    remainingSessions: remaining,
                    teacherName: en.teacher,
                    parentPhone: (isTeacher ? '••••••••' : s.parentPhone) || ''
                });
                anticipatedCollection += (price * 8);
            }
        });
    });

    return { lowBalance, anticipatedCollection };
};

export const computeChartData = (
    last6Months: string[], filteredSessions: Session[], transactions: Transaction[],
    teacherInvoices: TeacherInvoice[], fixedTotal: number, isTeacher: boolean, now: Date
): DashboardMonthData[] => {
    return last6Months.map(month => {
        const [y, m] = month.split('-').map(Number);
        const isTargetMonth = (dateStr: string) => {
            if (!dateStr) return false;
            const d = new Date(dateStr);
            return d.getFullYear() === y && (d.getMonth() + 1) === m;
        };

        const mSess = filteredSessions.filter((s: Session) => isTargetMonth(s.date));
        const mComp = mSess.filter((s: Session) =>
            ['completed', 'مكتملة', 'تم الإنجاز'].includes(s.status?.toLowerCase())
        );

        const rev = mComp.reduce((sum: number, s: Session) => sum + getSessionRev(s, []), 0) +
            getManualInc(transactions.filter((t: Transaction) => isTargetMonth(t.date)));
        const expInv = getPaidInv(teacherInvoices.filter((inv: TeacherInvoice) => isTargetMonth(inv.date)));
        const expMan = getManualExp(transactions.filter((t: Transaction) => isTargetMonth(t.date)));
        const expFixed = (y === now.getFullYear() && m === (now.getMonth() + 1)) ? fixedTotal : 0;

        const exp = isTeacher ? (expInv + expMan) : (expInv + expMan + expFixed);

        return {
            month: new Date(y, m - 1).toLocaleDateString('ar-EG', { month: 'short' }),
            revenue: rev,
            expenses: exp,
            profit: rev - exp,
            sessions: mSess.length,
            completed: mComp.length
        };
    });
};
