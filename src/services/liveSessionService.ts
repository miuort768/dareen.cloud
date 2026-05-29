import { api } from '../lib/api';
import { socketService } from '../lib/socket';

interface StartSessionResult {
  id: string;          // sessionId
  teacherName: string;
}

// الوظيفة الوحيدة لبدء البث — تستخدمها كل المكونات
export async function startLiveSession(params: {
  title?: string;
  subject?: string;
  targetStudentId?: string;     // اختياري — إذا موجود، يرسل إشعار للطالب
}): Promise<StartSessionResult> {
  // 1. إنشاء الجلسة في قاعدة البيانات
  const res = await api.post<StartSessionResult>('/live/start', {
    title: params.title || 'بث مباشر',
    subject: params.subject || '',
    targetStudentId: params.targetStudentId || null,
  });

  // 2. إذا كان هناك طالب معين، أرسل له إشعار عبر Socket
  if (params.targetStudentId && res.id) {
    const socket = socketService.getSocket();
    if (socket.connected) {
      socket.emit('call_student', {
        studentId: params.targetStudentId,
        subject: params.subject,
        sessionId: res.id,
        teacherName: res.teacherName,
      });
    }
  }

  return res;
}
