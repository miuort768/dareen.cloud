import { api } from '../../../lib/api'
import type { Session, Student, ScheduleSlot } from '../types'

export const attendanceService = {
  getSessions: async (): Promise<Session[]> => {
    const data = await api.get<{ data: Session[] } | Session[]>('/sessions')
    return Array.isArray(data) ? data : data.data
  },

  getStudents: async (): Promise<Student[]> => {
    const data = await api.get<{ data: Student[] } | Student[]>('/students')
    return Array.isArray(data) ? data : data.data
  },

  createSession: async (session: Omit<Session, 'id'>): Promise<Session> => {
    return api.post<Session>('/sessions', session)
  },

  updateSchedule: async (
    studentId: string,
    enrollmentId: string | number,
    schedule: ScheduleSlot[],
  ): Promise<void> => {
    await api.patch(`/students/${studentId}/enrollments/${enrollmentId}/schedule`, { schedule })
  },

  updateEnrollmentNotes: async (
    studentId: string,
    enrollmentId: string | number,
    notes: string,
  ): Promise<void> => {
    await api.patch(`/students/${studentId}/enrollments/${enrollmentId}/notes`, { notes })
  },
}
