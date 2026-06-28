import { api } from '../lib/api';

interface StartSessionResult {
  id: string;
  teacherName: string;
  meetingUrl: string;
}

export async function startLiveSession(params: {
  title?: string;
  subject?: string;
  meetingProvider: 'google_meet' | 'zoom' | 'custom';
  meetingUrl: string;
  targetStudentId?: string;
}): Promise<StartSessionResult> {
  const res = await api.post<StartSessionResult>('/live/start', {
    title: params.title || 'حصة مباشرة',
    subject: params.subject || '',
    meetingProvider: params.meetingProvider,
    meetingUrl: params.meetingUrl.trim(),
    targetStudentId: params.targetStudentId || null,
  });

  return res;
}
