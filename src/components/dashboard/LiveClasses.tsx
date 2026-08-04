import { useState, useEffect, useCallback } from 'react';
import { Radio, Users, Loader2, Plus, AlertCircle, RefreshCcw, ExternalLink, Copy, StopCircle, Link, Video, CheckCircle2, Pencil } from 'lucide-react';
import { api } from '../../lib/api';
import { socketService } from '../../lib/socket';
import { SOCKET_EVENTS } from '../../lib/socket-events';
import { useCurrentUser } from '../../context/AppContext';
import { startLiveSession, updateLiveSession } from '../../services/liveSessionService';
import type { LiveSession } from '../../types';

const PROVIDERS = [
  { value: 'google_meet', label: 'Google Meet' },
  { value: 'zoom', label: 'Zoom' },
  { value: 'custom', label: 'رابط آخر' },
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
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const currentUser = useCurrentUser();

  const [showDialog, setShowDialog] = useState(false);
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [meetingProvider, setMeetingProvider] = useState('google_meet');
  const [meetingUrl, setMeetingUrl] = useState('');
  const [subject, setSubject] = useState('');

  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingSession, setEditingSession] = useState<LiveSession | null>(null);
  const [editProvider, setEditProvider] = useState('google_meet');
  const [editUrl, setEditUrl] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    try {
      const data = await api.get<LiveSession[]>('/live/active');
      if (Array.isArray(data)) setSessions(data);
      setError(null);
    } catch (e) {
      console.error(e);
      setError('تعذر تحميل بيانات البث المباشر');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
    const socket = socketService.getSocket();
    if (socket) {
      socket.on(SOCKET_EVENTS.SESSION_INVITE, fetchSessions);
      socket.on(SOCKET_EVENTS.SESSION_ENDED, fetchSessions);
      socket.on(SOCKET_EVENTS.SESSION_LINK_UPDATED, fetchSessions);
    }
    return () => {
      if (socket) {
        socket.off(SOCKET_EVENTS.SESSION_INVITE, fetchSessions);
        socket.off(SOCKET_EVENTS.SESSION_ENDED, fetchSessions);
        socket.off(SOCKET_EVENTS.SESSION_LINK_UPDATED, fetchSessions);
      }
    };
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
      const res = await startLiveSession({
        title: `حصة مباشرة: ${subject || currentUser?.name}`,
        subject,
        meetingProvider: meetingProvider as 'google_meet' | 'zoom' | 'custom',
        meetingUrl: meetingUrl.trim(),
      });
      if (!res?.id) throw new Error('No session ID returned');
      setShowDialog(false);
      setMeetingUrl('');
      setSubject('');
      setMeetingProvider('google_meet');
      await fetchSessions();
    } catch (err: unknown) {
      setDialogError(err instanceof Error ? err.message : 'فشل بدء الحصة');
    } finally {
      setStarting(false);
    }
  };

  const endSession = async (sessionId: string) => {
    if (!window.confirm('هل أنت متأكد من إنهاء هذه الحصة المباشرة؟')) return;
    try {
      await api.post(`/live/end/${sessionId}`, {});
      await fetchSessions();
    } catch (e) {
      console.error(e);
      setError('فشل إنهاء الحصة');
    }
  };

  const copyLink = async (url: string, sessionId: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(sessionId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      setError('فشل نسخ الرابط');
    }
  };

  const openEditDialog = (session: LiveSession) => {
    setEditingSession(session);
    setEditProvider(session.meetingProvider);
    setEditUrl(session.meetingUrl || '');
    setEditError(null);
    setShowEditDialog(true);
  };

  const saveEditedLink = async () => {
    if (!editingSession || !editUrl.trim()) {
      setEditError('يرجى إدخال رابط الاجتماع');
      return;
    }
    setEditSaving(true);
    setEditError(null);
    try {
      await updateLiveSession({
        sessionId: editingSession.id,
        meetingProvider: editProvider as 'google_meet' | 'zoom' | 'custom',
        meetingUrl: editUrl.trim(),
      });
      setShowEditDialog(false);
      setEditingSession(null);
      setEditUrl('');
      await fetchSessions();
    } catch (err: unknown) {
      setEditError(err instanceof Error ? err.message : 'فشل تحديث الرابط');
    } finally {
      setEditSaving(false);
    }
  };

  const isTeacher = currentUser?.role === 'teacher' || currentUser?.role === 'admin';

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex items-center justify-between p-4 bg-white dark:bg-surface rounded-2xl shadow-sm border border-border/50 dark:border-border/50 transition-all duration-300 hover:shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm bg-primary-soft">
            <Radio size={18} strokeWidth={1.5} className="text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-main">الحصص المباشرة</h3>
            <p className="text-micro font-medium text-muted">روابط Google Meet أو Zoom</p>
          </div>
        </div>

        {isTeacher && (
          <button
            onClick={() => setShowDialog(true)}
            className="text-white px-5 py-2 text-micro font-bold rounded-2xl transition-all active:scale-[0.97] flex items-center gap-2 shadow-sm hover:shadow-md bg-primary hover:bg-primary-hover"
          >
            <Plus size={13} strokeWidth={1.5} /> بدء حصة جديدة
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center justify-between bg-error-light dark:bg-error/20 border border-error dark:border-error/50 p-3 text-error text-xs font-medium rounded-2xl">
          <div className="flex items-center gap-2">
            <AlertCircle size={14} strokeWidth={1.5} className="shrink-0" />
            {error}
          </div>
          <button onClick={fetchSessions} className="flex items-center gap-1 px-3 py-1.5 bg-error-light/50 dark:bg-error/30 hover:bg-error dark:hover:bg-error/50 rounded-xl text-micro font-bold transition-all">
            <RefreshCcw size={12} /> إعادة المحاولة
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="animate-spin text-primary" size={20} strokeWidth={1.5} />
        </div>
      ) : sessions.length === 0 ? (
        <div className="p-10 text-center bg-white dark:bg-surface rounded-2xl shadow-sm border border-border/50 dark:border-border/50 transition-all">
          <Video size={36} strokeWidth={1.5} className="mx-auto mb-3 text-primary" />
          <p className="font-bold text-xs text-primary">لا توجد حصص مباشرة حالياً</p>
          {isTeacher && (
            <p className="text-muted text-micro mt-2 font-medium">اضغط "بدء حصة جديدة" لبدء حصة</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sessions.map(session => (
            <div
              key={session.id}
              className="p-5 flex flex-col justify-between group bg-white dark:bg-surface rounded-2xl shadow-sm border border-border/50 dark:border-border/50 transition-all hover:shadow-md hover:border-border dark:hover:border-border"
            >
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl shadow-sm text-on-success text-micro font-bold w-fit bg-success">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                مباشر
              </div>

              <div className="mt-3">
                <h4 className="font-bold text-sm text-main mb-1 line-clamp-1">
                  {session.title}
                </h4>
                <div className="flex items-center gap-2 text-muted mb-1">
                  <Users size={12} strokeWidth={1.5} className="text-primary" />
                  <span className="text-micro font-medium">{session.teacherName}</span>
                  {session.subject && (
                    <span className="text-micro text-muted">— {session.subject}</span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-micro font-medium text-muted mt-1">
                  <span className="bg-surface px-2 py-0.5 rounded-lg">
                    {PROVIDER_LABELS[session.meetingProvider] || session.meetingProvider}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 mt-3">
                <a
                  href={session.meetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-white py-3 text-micro font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md active:scale-[0.97] bg-primary hover:bg-primary-hover"
                >
                  <ExternalLink size={14} strokeWidth={1.5} />
                  انضم للحصة
                </a>
                <button
                  onClick={() => copyLink(session.meetingUrl || '', session.id)}
                  className="px-3 py-3 text-micro font-bold rounded-2xl border border-border text-muted hover:bg-surface transition-all flex items-center justify-center"
                  title="نسخ الرابط"
                  aria-label="نسخ رابط الحصة"
                >
                  {copiedId === session.id ? <CheckCircle2 size={14} className="text-success" /> : <Copy size={14} strokeWidth={1.5} />}
                </button>
                {isTeacher && (
                  <button
                    onClick={() => openEditDialog(session)}
                    className="px-3 py-3 text-micro font-bold rounded-2xl border border-border text-muted hover:bg-surface transition-all flex items-center justify-center"
                    title="تعديل الرابط"
                    aria-label="تعديل رابط الحصة"
                  >
                    <Pencil size={14} strokeWidth={1.5} />
                  </button>
                )}
                {isTeacher && (
                  <button
                    onClick={() => endSession(session.id)}
                    className="px-3 py-3 text-micro font-bold rounded-2xl text-error border border-error dark:border-error hover:bg-error-light dark:hover:bg-error/20 transition-all flex items-center justify-center"
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40" onClick={() => setShowDialog(false)} role="dialog" aria-modal="true" aria-label="بدء حصة مباشرة" onKeyDown={e => { if (e.key === 'Escape') setShowDialog(false); }}>
          <div className="bg-white dark:bg-surface rounded-2xl shadow-2xl border border-border p-6 max-w-md w-full space-y-5" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-lg text-main text-center">بدء حصة مباشرة</h3>

            <div>
              <label className="block text-xs font-bold text-muted mb-2">المادة</label>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="الرياضيات"
                className="w-full px-4 py-3 text-sm font-medium bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-muted mb-2">نوع الاجتماع</label>
              <div className="flex gap-2">
                {PROVIDERS.map(p => (
                  <button
                    key={p.value}
                    onClick={() => setMeetingProvider(p.value)}
                    className={`flex-1 py-3 px-2 text-micro font-bold rounded-2xl border-2 transition-all ${
                      meetingProvider === p.value
                        ? 'border-primary bg-primary-soft text-primary'
                        : 'border-border text-muted hover:border-border'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-muted mb-2">رابط الاجتماع</label>
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
                  className="flex-1 px-4 py-3 text-sm font-medium bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
                {meetingProvider === 'google_meet' && (
                  <button
                    onClick={openCreateMeet}
                    className="px-3 py-3 text-micro font-bold rounded-2xl bg-success-light border border-success text-success hover:bg-success/20 transition-all whitespace-nowrap flex items-center gap-1"
                    title="إنشاء رابط Google Meet جديد"
                  >
                    <Link size={14} /> إنشاء Meet
                  </button>
                )}
              </div>
            </div>

            {dialogError && (
              <p className="text-error text-xs font-bold">{dialogError}</p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => { setShowDialog(false); setDialogError(null); }}
                className="flex-1 py-3 text-xs font-bold rounded-2xl border border-border text-muted hover:bg-surface transition-all"
              >
                إلغاء
              </button>
              <button
                onClick={startNewSession}
                disabled={starting}
                className="flex-1 py-3 text-xs font-bold rounded-2xl text-white bg-primary hover:bg-primary-hover transition-all shadow-sm disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {starting ? <><Loader2 size={14} className="animate-spin" /> جاري...</> : 'بدء الحصة'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditDialog && editingSession && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40" onClick={() => setShowEditDialog(false)} role="dialog" aria-modal="true" aria-label="تعديل رابط الحصة" onKeyDown={e => { if (e.key === 'Escape') setShowEditDialog(false); }}>
          <div className="bg-white dark:bg-surface rounded-2xl shadow-2xl border border-border p-6 max-w-md w-full space-y-5" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-lg text-main text-center">تعديل رابط الحصة</h3>

            <div>
              <label className="block text-xs font-bold text-muted mb-2">نوع الاجتماع</label>
              <div className="flex gap-2">
                {PROVIDERS.map(p => (
                  <button key={p.value} onClick={() => setEditProvider(p.value)}
                    className={`flex-1 py-3 px-2 text-micro font-bold rounded-2xl border-2 transition-all ${editProvider === p.value ? 'border-primary bg-primary-soft text-primary' : 'border-border text-muted hover:border-border'}`}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-muted mb-2">رابط الاجتماع</label>
              <div className="flex gap-2">
                <input type="url" value={editUrl} onChange={e => setEditUrl(e.target.value)}
                  placeholder={editProvider === 'google_meet' ? 'https://meet.google.com/abc-defg-hij' : editProvider === 'zoom' ? 'https://zoom.us/j/1234567890' : 'https://...'}
                  className="flex-1 px-4 py-3 text-sm font-medium bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                {editProvider === 'google_meet' && (
                  <button onClick={openCreateMeet}
                    className="px-3 py-3 text-micro font-bold rounded-2xl bg-success-light border border-success text-success hover:bg-success/20 transition-all whitespace-nowrap flex items-center gap-1" title="إنشاء رابط Google Meet جديد">
                    <Link size={14} /> إنشاء Meet
                  </button>
                )}
              </div>
            </div>

            {editError && <p className="text-error text-xs font-bold">{editError}</p>}

            <div className="flex gap-3 pt-2">
              <button onClick={() => { setShowEditDialog(false); setEditingSession(null); setEditError(null); }}
                className="flex-1 py-3 text-xs font-bold rounded-2xl border border-border text-muted hover:bg-surface transition-all">إلغاء</button>
              <button onClick={saveEditedLink} disabled={editSaving}
                className="flex-1 py-3 text-xs font-bold rounded-2xl text-white bg-primary hover:bg-primary-hover transition-all shadow-sm disabled:opacity-60 flex items-center justify-center gap-2">
                {editSaving ? <><Loader2 size={14} className="animate-spin" /> جاري...</> : 'حفظ التعديل'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
