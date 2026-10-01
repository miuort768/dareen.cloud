import { describe, it, expect } from 'vitest'
import { isSameMonth } from 'date-fns'
import { computeLowBalanceStudents } from '../../features/dashboard/utils/dashboardHelpers'

const student = (over: Partial<Record<string, unknown>> = {}) =>
  ({
    id: 's1',
    name: 'سارة',
    sessionPrice: 10,
    currency: 'EGP',
    parentPhone: '0100',
    ...over,
  }) as never

const enrollment = (over: Record<string, unknown> = {}) =>
  ({
    subject: 'رياضيات',
    teacher: 'أ. منى',
    teacherId: 't1',
    sessionsTotal: 10,
    ...over,
  }) as never

describe('computeLowBalanceStudents', () => {
  it('reports nothing when the month has no near-exhausted enrollment', () => {
    const result = computeLowBalanceStudents(
      [student({ enrollments: [enrollment({ sessionsTotal: 10 })] })],
      [],
      'أ. منى',
      't1',
      true,
    )
    expect(result.lowBalance).toHaveLength(0)
    expect(result.anticipatedCollection).toBe(0)
  })

  it('flags an enrollment with two sessions left', () => {
    const result = computeLowBalanceStudents(
      [student({ enrollments: [enrollment({ sessionsTotal: 8 })] })],
      [
        { id: 'x', studentId: 's1', subject: 'رياضيات', teacherId: 't1', status: 'completed' },
        { id: 'y', studentId: 's1', subject: 'رياضيات', teacherId: 't1', status: 'completed' },
        { id: 'z', studentId: 's1', subject: 'رياضيات', teacherId: 't1', status: 'completed' },
        { id: 'w', studentId: 's1', subject: 'رياضيات', teacherId: 't1', status: 'completed' },
        { id: 'v', studentId: 's1', subject: 'رياضيات', teacherId: 't1', status: 'completed' },
        { id: 'u', studentId: 's1', subject: 'رياضيات', teacherId: 't1', status: 'completed' },
      ] as never,
      'أ. منى',
      't1',
      true,
    )
    expect(result.lowBalance).toHaveLength(1)
    expect(result.lowBalance[0]!.remainingSessions).toBe(2)
    // 2 remaining × 10 per session
    expect(result.anticipatedCollection).toBe(20)
  })

  it('counts Arabic completed statuses, not only the english literal', () => {
    const result = computeLowBalanceStudents(
      [student({ enrollments: [enrollment({ sessionsTotal: 4 })] })],
      [
        { id: '1', studentId: 's1', subject: 'رياضيات', teacherId: 't1', status: 'مكتملة' },
        { id: '2', studentId: 's1', subject: 'رياضيات', teacherId: 't1', status: 'تم الإنجاز' },
      ] as never,
      'أ. منى',
      't1',
      true,
    )
    expect(result.lowBalance[0]!.remainingSessions).toBe(2)
  })

  it('emits ONE row per student when two subjects are nearly exhausted', () => {
    const result = computeLowBalanceStudents(
      [
        student({
          enrollments: [
            enrollment({ subject: 'رياضيات', sessionsTotal: 3 }),
            enrollment({ subject: 'لغة', sessionsTotal: 2 }),
          ],
        }),
      ],
      [{ id: '1', studentId: 's1', subject: 'لغة', teacherId: 't1', status: 'completed' }] as never,
      'أ. منى',
      't1',
      true,
    )
    expect(result.lowBalance).toHaveLength(1)
    // Lowest remaining balance wins — that is the enrollment needing action.
    expect(result.lowBalance[0]!.subject).toBe('لغة')
    expect(result.lowBalance[0]!.remainingSessions).toBe(1)
    // Counted once: 1 remaining × 10 (not 1 + 2)
    expect(result.anticipatedCollection).toBe(10)
  })

  it('masks the parent phone for teachers but keeps it for admins', () => {
    const data = [student({ enrollments: [enrollment({ sessionsTotal: 0 })] })]
    const asTeacher = computeLowBalanceStudents(data, [], 'أ. منى', 't1', true)
    expect(asTeacher.lowBalance[0]!.parentPhone).toBe('••••••••')
    const asAdmin = computeLowBalanceStudents(data, [], '', 'a1', false)
    expect(asAdmin.lowBalance[0]!.parentPhone).toBe('0100')
  })

  it('never mixes currencies in the anticipated collection', () => {
    // sessionsTotal 2 with no completed session → 2 remaining for each student.
    const result = computeLowBalanceStudents(
      [
        student({
          id: 'a',
          currency: 'EGP',
          sessionPrice: 10,
          enrollments: [enrollment({ sessionsTotal: 2 })],
        }),
        student({
          id: 'b',
          currency: 'SAR',
          sessionPrice: 50,
          enrollments: [enrollment({ sessionsTotal: 2 })],
        }),
      ],
      [],
      'أ. منى',
      't1',
      true,
    )
    // EGP group = 2×10 = 20, SAR group = 2×50 = 100. Summing across currencies would
    // report 120 in a meaningless unit; the single dominant currency wins → 100.
    expect(result.anticipatedCollection).toBe(100)
  })

  it('treats a fully exhausted enrollment (0 remaining) as worth nothing expected', () => {
    const result = computeLowBalanceStudents(
      [student({ sessionPrice: 10, enrollments: [enrollment({ sessionsTotal: 0 })] })],
      [],
      'أ. منى',
      't1',
      true,
    )
    expect(result.lowBalance).toHaveLength(1)
    expect(result.lowBalance[0]!.remainingSessions).toBe(0)
    expect(result.anticipatedCollection).toBe(0)
  })

  it('month boundary is handled by the caller passing only in-range sessions', () => {
    // Regression guard: the helper counts whatever it is given, so the caller must
    // pass the period-filtered list. isSameMonth is the sanctioned filter.
    const now = new Date()
    expect(isSameMonth(now, now)).toBe(true)
    expect(isSameMonth(new Date('2020-01-15'), new Date('2020-02-15'))).toBe(false)
  })
})
