import { useState, useEffect, useCallback } from 'react';
import { Radio, Users, Loader2, Plus, AlertCircle, RefreshCcw, ExternalLink, Copy, StopCircle, Link, Video } from 'lucide-react';
import { api } from '../../lib/api';
import { useCurrentUser } from '../../context/AppContext';
import type { LiveSession } from '../../types';

const PROVIDERS = [
  { value: 'google_meet', label: 'Google Meet', icon: 'G' },
  { value: 'zoom', label: 'Zoom', icon: 'Z' },
  { value: 'custom', label: 'رابط آخر', icon: '🔗' },
];

const PROVIDER_LABELS: Record<string, string> = {
  google_meet: 'Google Meet',
  zoom: 'Zoom',
  custom: 'رابط مخصص',
};

export const LiveClasses = () => {
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentUser = useCurrentUser();

  const [showDialog, setShowDialog] = useState(false);
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [meetingProvider, setMeetingProvider] = useState('google_meet');
  const [meetingUrl, setMeetingUrl] = useState('');
  const [subject, setSubject] = useState('');

  const fetchSessions = useCallback(async () => {
    try {
      const data = await api.get<LiveSession[]>('/live/active');
      if (Array.isArray(data)) setSessions(data);
      setError(null);
    } catch {
      setError('تعذر تحميل بيانات البث المباشر');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 15000);
    return () => clearInterval(interval);
  }, [fetchSessions]);

  const openCreateMeet = () => {
    window.open('https://meet.google.com/new', '_blank');
  };

  const startNewSession = async () => {
    if (!meetingUrl.trim()) {
      setDialogError('يرجى إدخال رابط الاجتماع');
      return;
    }
    setStarting(true);
    setDialogError(null);
    try {
      const res = await api.post<{ id: string; meetingUrl: string }>('/live/start', {
        title: `حصة مباشرة: ${subject || currentUser?.name}`,
        subject,
        meetingProvider,
        meetingUrl: meetingUrl.trim(),
      });
      if (!res?.id) throw new Error('No session ID returned');
      setShowDialog(false);
      setMeetingUrl('');
      setSubject('');
      setMeetingProvider('google_meet');
      await fetchSessions();
    } catch (err: any) {
      setDialogError(err?.message || err?.error || 'فشل بدء الحصة');
    } finally {
      setStarting(false);
    }
  };

  const endSession = async (sessionId: string) => {
    try {
      await api.post(`/live/end/${sessionId}`, {});
      await fetchSessions();
    } catch {
      setError('فشل إنهاء الحصة');
    }
  };

  const copyLink = (url: string) => {
    navigator.clipboard.writeText(url);
  };

  const isTeacher = currentUser?.role === 'teacher' || currentUser?.role === 'admin';

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100/50 dark:border-slate-800/50 transition-all duration-300 hover:shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm bg-indigo-50 dark:bg-indigo-500/10">
            <Radio size={18} strokeWidth={1.5} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-800 dark:text-white">الحصص المباشرة</h3>
            <p className="text-[9px] font-medium text-slate-500 dark:text-slate-400">روابط Google Meet أو Zoom</p>
          </div>
        </div>

        {isTeacher && (
          <button
            onClick={() => setShowDialog(true)}
            className="text-white px-5 py-2 text-[10px] font-bold rounded-2xl transition-all active:scale-[0.97] flex items-center gap-2 shadow-sm hover:shadow-md bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus size={13} strokeWidth={1.5} /> بدء حصة جديدة
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center justify-between bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/50 p-3 text-rose-700 dark:text-rose-400 text-xs font-medium rounded-2xl">
          <div className="flex items-center gap-2">
            <AlertCircle size={14} strokeWidth={1.5} className="shrink-0" />
            {error}
          </div>
          <button onClick={fetchSessions} className="flex items-center gap-1 px-3 py-1.5 bg-rose-200/50 dark:bg-rose-800/30 hover:bg-rose-200 dark:hover:bg-rose-800/50 rounded-xl text-[10px] font-bold transition-all">
            <RefreshCcw size={12} /> إعادة المحاولة
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="animate-spin text-indigo-600 dark:text-indigo-400" size={20} strokeWidth={1.5} />
        </div>
      ) : sessions.length === 0 ? (
        <div className="p-10 text-center bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100/50 dark:border-slate-800/50 transition-all">
          <Video size={36} strokeWidth={1.5} className="mx-auto mb-3 text-indigo-300 dark:text-indigo-600" />
          <p className="font-bold text-[11px] text-indigo-600 dark:text-indigo-400">لا توجد حصص مباشرة حالياً</p>
          {isTeacher && (
            <p className="text-slate-400 text-[10px] mt-2 font-medium">اضغط "بدء حصة جديدة" لبدء حصة</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sessions.map(session => (
            <div
              key={session.id}
              className="p-5 flex flex-col justify-between group bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100/50 dark:border-slate-800/50 transition-all hover:shadow-md hover:border-slate-200 dark:hover:border-slate-700"
            >
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl shadow-sm text-white text-[8px] font-bold w-fit bg-emerald-600">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                مباشر
              </div>

              <div className="mt-3">
                <h4 className="font-bold text-sm text-slate-800 dark:text-white mb-1 line-clamp-1">
                  {session.title}
                </h4>
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
                  <Users size={12} strokeWidth={1.5} className="text-indigo-600 dark:text-indigo-400" />
                  <span className="text-[10px] font-medium">{session.teacherName}</span>
                  {session.subject && (
                    <span className="text-[10px] text-slate-400">— {session.subject}</span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400 mt-1">
                  <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">
                    {PROVIDER_LABELS[session.meetingProvider] || session.meetingProvider}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 mt-3">
                <a
                  href={session.meetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-white py-3 text-[10px] font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md active:scale-[0.97] bg-indigo-600 hover:bg-indigo-700"
                >
                  <ExternalLink size={14} strokeWidth={1.5} />
                  انضم للحصة
                </a>
                <button
                  onClick={() => copyLink(session.meetingUrl || '')}
                  className="px-3 py-3 text-[10px] font-bold rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center"
                  title="نسخ الرابط"
                >
                  <Copy size={14} strokeWidth={1.5} />
                </button>
                {isTeacher && (
                  <button
                    onClick={() => endSession(session.id)}
                    className="px-3 py-3 text-[10px] font-bold rounded-2xl text-rose-600 border border-rose-200 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all flex items-center justify-center"
                    title="إنهاء الحصة"
                  >
                    <StopCircle size={14} strokeWidth={1.5} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showDialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40" onClick={() => setShowDialog(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full space-y-5" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-lg text-slate-800 dark:text-white text-center">بدء حصة مباشرة</h3>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">المادة</label>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="الرياضيات"
                className="w-full px-4 py-3 text-sm font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">نوع الاجتماع</label>
              <div className="flex gap-2">
                {PROVIDERS.map(p => (
                  <button
                    key={p.value}
                    onClick={() => setMeetingProvider(p.value)}
                    className={`flex-1 py-3 px-2 text-[10px] font-bold rounded-2xl border-2 transition-all ${
                      meetingProvider === p.value
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">رابط الاجتماع</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={meetingUrl}
                  onChange={e => setMeetingUrl(e.target.value)}
                  placeholder={
                    meetingProvider === 'google_meet' ? 'https://meet.google.com/abc-defg-hij' :
                    meetingProvider === 'zoom' ? 'https://zoom.us/j/1234567890' :
                    'https://...'
                  }
                  className="flex-1 px-4 py-3 text-sm font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                />
                {meetingProvider === 'google_meet' && (
                  <button
                    onClick={openCreateMeet}
                    className="px-3 py-3 text-[10px] font-bold rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-all whitespace-nowrap flex items-center gap-1"
                    title="إنشاء رابط Google Meet جديد"
                  >
                    <Link size={14} /> إنشاء Meet
                  </button>
                )}
              </div>
            </div>

            {dialogError && (
              <p className="text-rose-600 dark:text-rose-400 text-xs font-bold">{dialogError}</p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => { setShowDialog(false); setDialogError(null); }}
                className="flex-1 py-3 text-xs font-bold rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                إلغاء
              </button>
              <button
                onClick={startNewSession}
                disabled={starting}
                className="flex-1 py-3 text-xs font-bold rounded-2xl text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-sm disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {starting ? <><Loader2 size={14} className="animate-spin" /> جاري...</> : 'بدء الحصة'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
