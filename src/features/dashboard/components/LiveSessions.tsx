import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Radio, Users, Loader2, Plus, AlertCircle, RefreshCcw, ExternalLink, Copy, StopCircle, LinkIcon, Video, CheckCircle2, Pencil } from 'lucide-react';
import { api } from '../../../lib/api';
import { socketService } from '../../../lib/socket';
import { SOCKET_EVENTS } from '../../../lib/socket-events';
import { useCurrentUser } from '../../../context/AppContext';
import { startLiveSession, updateLiveSession } from '../../../services/liveSessionService';
import { cn } from '@/lib/utils';
import { confirm } from '../../../lib/confirmDialog';
import { Button } from '@/components/ui/button';
import type { LiveSession } from '../../../types';

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

export const LiveSessions = () => {
    const queryClient = useQueryClient();
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
    const [editError, setEditError] = useState<string | null>(null);

    const { data: sessions = [], isLoading: loading, error: queryError, refetch } = useQuery({
        queryKey: ['live-sessions'],
        queryFn: () => api.get<LiveSession[]>('/live/active'),
        select: (data) => Array.isArray(data) ? data : [],
    });

    useEffect(() => {
        const socket = socketService.getSocket();
        if (!socket) return;
        const invalidate = () => queryClient.invalidateQueries({ queryKey: ['live-sessions'] });
        socket.on(SOCKET_EVENTS.SESSION_INVITE, invalidate);
        socket.on(SOCKET_EVENTS.SESSION_ENDED, invalidate);
        socket.on(SOCKET_EVENTS.SESSION_LINK_UPDATED, invalidate);
        return () => {
            socket.off(SOCKET_EVENTS.SESSION_INVITE, invalidate);
            socket.off(SOCKET_EVENTS.SESSION_ENDED, invalidate);
            socket.off(SOCKET_EVENTS.SESSION_LINK_UPDATED, invalidate);
        };
    }, [queryClient]);

    const startMutation = useMutation({
        mutationFn: startLiveSession,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['live-sessions'] });
            setShowDialog(false);
            setMeetingUrl('');
            setSubject('');
            setMeetingProvider('google_meet');
        },
        onError: (err: unknown) => {
            setDialogError(err instanceof Error ? err.message : 'فشل بدء الحصة');
        },
    });

    const endMutation = useMutation({
        mutationFn: (id: string) => api.post(`/live/end/${id}`, {}),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['live-sessions'] }),
        onError: () => setError('فشل إنهاء الحصة'),
    });

    const editMutation = useMutation({
        mutationFn: updateLiveSession,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['live-sessions'] });
            setShowEditDialog(false);
            setEditingSession(null);
            setEditUrl('');
        },
        onError: (err: unknown) => {
            setEditError(err instanceof Error ? err.message : 'فشل تحديث الرابط');
        },
    });

    const startNewSession = () => {
        if (!meetingUrl.trim()) {
            setDialogError('يرجى إدخال رابط الاجتماع');
            return;
        }
        setDialogError(null);
        startMutation.mutate({
            title: `حصة مباشرة: ${subject || currentUser?.name}`,
            subject,
            meetingProvider: meetingProvider as 'google_meet' | 'zoom' | 'custom',
            meetingUrl: meetingUrl.trim(),
        });
    };

    const endSession = async (sessionId: string) => {
        if (!(await confirm({ title: 'إنهاء الحصة المباشرة', description: 'هل أنت متأكد من إنهاء هذه الحصة المباشرة؟', confirmText: 'إنهاء', cancelText: 'إلغاء' }))) return;
        endMutation.mutate(sessionId);
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

    const saveEditedLink = () => {
        if (!editingSession || !editUrl.trim()) {
            setEditError('يرجى إدخال رابط الاجتماع');
            return;
        }
        setEditError(null);
        editMutation.mutate({
            sessionId: editingSession.id,
            meetingProvider: editProvider as 'google_meet' | 'zoom' | 'custom',
            meetingUrl: editUrl.trim(),
        });
    };

    const isTeacher = currentUser?.role === 'teacher' || currentUser?.role === 'admin';
    const displayError = error || (queryError instanceof Error ? queryError.message : null);

    return (
        <div className="rounded-2xl bg-card border border-border p-5 font-dash" dir="rtl">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-success-soft flex items-center justify-center">
                        <Radio size={16} className="text-success" />
                    </div>
                    <div>
                        <h3 className="text-[13px] font-bold text-main">الحصص المباشرة</h3>
                        <p className="text-[11px] text-muted">روابط البث المباشر</p>
                    </div>
                </div>
                {isTeacher && (
                    <Button
                        onClick={() => setShowDialog(true)}
                        size="sm"
                        className="h-9 px-3.5 rounded-xl text-[11px] font-bold gap-1.5 bg-primary text-on-primary"
                    >
                        <Plus size={13} />
                        بدء حصة
                    </Button>
                )}
            </div>

            {/* Error */}
            {displayError && (
                <div className="flex items-center justify-between p-3 bg-error/10 border border-error/20 rounded-xl mb-3">
                    <div className="flex items-center gap-2">
                        <AlertCircle size={14} className="text-error shrink-0" />
                        <span className="text-xs font-medium text-error">{displayError}</span>
                    </div>
                    <button onClick={() => refetch()} className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-error hover:bg-error/20 rounded-lg transition-colors">
                        <RefreshCcw size={11} /> إعادة
                    </button>
                </div>
            )}

            {/* Content */}
            {loading ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="animate-spin text-primary" size={20} />
                </div>
            ) : sessions.length === 0 ? (
                <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-primary-soft flex items-center justify-center">
                        <Video size={28} className="text-primary/30" />
                    </div>
                    <p className="text-[13px] font-bold text-muted">لا توجد حصص مباشرة حالياً</p>
                    <p className="text-[11px] text-muted/60 mt-1">ابدأ حصتك بضغطة واحدة</p>
                    {isTeacher && (
                        <Button onClick={() => setShowDialog(true)} size="sm" className="mt-3 h-9 px-5 rounded-xl text-[11px] font-bold gap-1.5 bg-primary text-on-primary">
                            <Plus size={13} /> بدء حصة
                        </Button>
                    )}
                </div>
            ) : (
                <div className="space-y-2">
                    {sessions.map((session) => (
                        <div
                            key={session.id}
                            className="p-4 flex items-center justify-between bg-surface border border-border rounded-xl hover:bg-hover transition-colors"
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="relative shrink-0">
                                    <div className="w-10 h-10 rounded-xl bg-success-soft flex items-center justify-center">
                                        <Radio size={14} className="text-success" />
                                    </div>
                                    <span className="absolute -top-0.5 -left-0.5 w-2.5 h-2.5 bg-success rounded-full border-2 border-surface animate-pulse" />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="text-xs font-bold text-main truncate">{session.title}</h4>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <Users size={10} className="text-muted shrink-0" />
                                        <span className="text-[10px] font-medium text-muted truncate">{session.teacherName}</span>
                                        {session.subject && (
                                            <>
                                                <span className="text-[10px] text-muted/40">·</span>
                                                <span className="text-[10px] text-muted truncate">{session.subject}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                                <span className="text-[10px] font-bold text-muted px-2 py-0.5 rounded-lg bg-surface">
                                    {PROVIDER_LABELS[session.meetingProvider] || session.meetingProvider}
                                </span>
                                <a
                                    href={session.meetingUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="h-8 px-3 rounded-xl bg-primary text-on-primary text-[11px] font-bold flex items-center gap-1.5 hover:bg-primary-hover transition-colors"
                                >
                                    <ExternalLink size={11} />
                                    انضم
                                </a>
                                <button
                                    onClick={() => copyLink(session.meetingUrl || '', session.id)}
                                    className="h-8 w-8 rounded-xl border border-border text-muted hover:bg-surface transition-colors flex items-center justify-center"
                                    title="نسخ الرابط"
                                    aria-label="نسخ رابط الحصة"
                                >
                                    {copiedId === session.id ? <CheckCircle2 size={13} className="text-success" /> : <Copy size={13} />}
                                </button>
                                {isTeacher && (
                                    <button
                                        onClick={() => openEditDialog(session)}
                                        className="h-8 w-8 rounded-xl border border-border text-muted hover:bg-surface transition-colors flex items-center justify-center"
                                        title="تعديل الرابط"
                                        aria-label="تعديل رابط الحصة"
                                    >
                                        <Pencil size={13} />
                                    </button>
                                )}
                                {isTeacher && (
                                    <button
                                        onClick={() => endSession(session.id)}
                                        className="h-8 w-8 rounded-xl text-error hover:bg-error/10 transition-colors flex items-center justify-center"
                                        title="إنهاء الحصة"
                                        aria-label="إنهاء الحصة"
                                    >
                                        <StopCircle size={13} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Dialog */}
            {showDialog && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40"
                    onClick={() => setShowDialog(false)}
                    role="dialog"
                    aria-modal="true"
                    aria-label="بدء حصة مباشرة"
                    onKeyDown={(e) => { if (e.key === 'Escape') setShowDialog(false); }}
                >
                    <div
                        className="bg-card rounded-2xl shadow-2xl border border-border p-6 max-w-md w-full space-y-5"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="font-bold text-lg text-main text-center">بدء حصة مباشرة</h3>

                        <div>
                            <label htmlFor="live-subject" className="block text-xs font-bold text-muted mb-2">المادة</label>
                            <input
                                id="live-subject"
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="الرياضيات"
                                className="w-full px-4 py-3 text-sm font-medium bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-focus"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-muted mb-2">نوع الاجتماع</label>
                            <div className="flex gap-2">
                                {PROVIDERS.map((p) => (
                                    <button
                                        key={p.value}
                                        onClick={() => setMeetingProvider(p.value)}
                                        className={cn(
                                            "flex-1 py-3 px-2 text-[11px] font-bold rounded-xl border-2 transition-all",
                                            meetingProvider === p.value
                                                ? "border-primary bg-primary-soft text-primary"
                                                : "border-border text-muted hover:border-border"
                                        )}
                                    >
                                        {p.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="live-meeting-url" className="block text-xs font-bold text-muted mb-2">رابط الاجتماع</label>
                            <div className="flex gap-2">
                                <input
                                    id="live-meeting-url"
                                    type="url"
                                    value={meetingUrl}
                                    onChange={(e) => setMeetingUrl(e.target.value)}
                                    placeholder={
                                        meetingProvider === 'google_meet' ? 'https://meet.google.com/abc-defg-hij' :
                                        meetingProvider === 'zoom' ? 'https://zoom.us/j/1234567890' :
                                        'https://...'
                                    }
                                    className="flex-1 px-4 py-3 text-sm font-medium bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-focus"
                                />
                                {meetingProvider === 'google_meet' && (
                                    <a
                                        href="https://meet.google.com/new"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-3 py-3 text-[11px] font-bold rounded-xl bg-success/10 border border-success/20 text-success hover:bg-success/20 transition-colors whitespace-nowrap flex items-center gap-1"
                                        title="إنشاء رابط Google Meet جديد"
                                    >
                                        <LinkIcon size={14} /> إنشاء
                                    </a>
                                )}
                            </div>
                        </div>

                        {dialogError && (
                            <p className="text-error text-xs font-bold">{dialogError}</p>
                        )}

                        <div className="flex gap-3 pt-2">
                            <Button
                                variant="outline"
                                onClick={() => { setShowDialog(false); setDialogError(null); }}
                                className="flex-1 h-11 rounded-xl text-xs font-bold"
                            >
                                إلغاء
                            </Button>
                            <Button
                                onClick={startNewSession}
                                disabled={startMutation.isPending}
                                className="flex-1 h-11 rounded-xl text-xs font-bold bg-primary text-on-primary gap-2"
                            >
                                {startMutation.isPending ? <><Loader2 size={14} className="animate-spin" /> جاري...</> : 'بدء الحصة'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {showEditDialog && editingSession && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40"
                    onClick={() => setShowEditDialog(false)}
                    role="dialog"
                    aria-modal="true"
                    aria-label="تعديل رابط الحصة"
                    onKeyDown={(e) => { if (e.key === 'Escape') setShowEditDialog(false); }}
                >
                    <div
                        className="bg-card rounded-2xl shadow-2xl border border-border p-6 max-w-md w-full space-y-5"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="font-bold text-lg text-main text-center">تعديل رابط الحصة</h3>

                        <div>
                            <label className="block text-xs font-bold text-muted mb-2">نوع الاجتماع</label>
                            <div className="flex gap-2">
                                {PROVIDERS.map((p) => (
                                    <button
                                        key={p.value}
                                        onClick={() => setEditProvider(p.value)}
                                        className={cn(
                                            "flex-1 py-3 px-2 text-[11px] font-bold rounded-xl border-2 transition-all",
                                            editProvider === p.value
                                                ? "border-primary bg-primary-soft text-primary"
                                                : "border-border text-muted hover:border-border"
                                        )}
                                    >
                                        {p.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="edit-meeting-url" className="block text-xs font-bold text-muted mb-2">رابط الاجتماع</label>
                            <div className="flex gap-2">
                                <input
                                    id="edit-meeting-url"
                                    type="url"
                                    value={editUrl}
                                    onChange={(e) => setEditUrl(e.target.value)}
                                    placeholder={
                                        editProvider === 'google_meet' ? 'https://meet.google.com/abc-defg-hij' :
                                        editProvider === 'zoom' ? 'https://zoom.us/j/1234567890' :
                                        'https://...'
                                    }
                                    className="flex-1 px-4 py-3 text-sm font-medium bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-focus"
                                />
                                {editProvider === 'google_meet' && (
                                    <a
                                        href="https://meet.google.com/new"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-3 py-3 text-[11px] font-bold rounded-xl bg-success/10 border border-success/20 text-success hover:bg-success/20 transition-colors whitespace-nowrap flex items-center gap-1"
                                        title="إنشاء رابط Google Meet جديد"
                                    >
                                        <LinkIcon size={14} /> إنشاء
                                    </a>
                                )}
                            </div>
                        </div>

                        {editError && (
                            <p className="text-error text-xs font-bold">{editError}</p>
                        )}

                        <div className="flex gap-3 pt-2">
                            <Button
                                variant="outline"
                                onClick={() => { setShowEditDialog(false); setEditingSession(null); setEditError(null); }}
                                className="flex-1 h-11 rounded-xl text-xs font-bold"
                            >
                                إلغاء
                            </Button>
                            <Button
                                onClick={saveEditedLink}
                                disabled={editMutation.isPending}
                                className="flex-1 h-11 rounded-xl text-xs font-bold bg-primary text-on-primary gap-2"
                            >
                                {editMutation.isPending ? <><Loader2 size={14} className="animate-spin" /> جاري...</> : 'حفظ التعديل'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
