import { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Loader2, LinkIcon, Copy, CheckCircle2, Radio, ExternalLink, Users } from 'lucide-react';
import { api } from '../../../lib/api';
import { startLiveSession } from '../../../services/liveSessionService';
import { useCurrentUser } from '../../../context/AppContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { Student } from '../../../types';

const PROVIDERS = [
    { value: 'google_meet', label: 'Google Meet' },
    { value: 'zoom', label: 'Zoom' },
    { value: 'custom', label: 'رابط آخر' },
];

interface StartLiveSessionDialogProps {
    open: boolean;
    onClose: () => void;
    defaultStudentId?: string;
    defaultSubject?: string;
}

export const StartLiveSessionDialog = ({ open, onClose, defaultStudentId, defaultSubject }: StartLiveSessionDialogProps) => {
    const queryClient = useQueryClient();
    const currentUser = useCurrentUser();

    const [studentId, setStudentId] = useState('');
    const [subject, setSubject] = useState('');
    const [provider, setProvider] = useState('google_meet');
    const [meetingUrl, setMeetingUrl] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [started, setStarted] = useState<{ id: string; meetingUrl: string } | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (open) {
            setStudentId(defaultStudentId || '');
            setSubject(defaultSubject || '');
            setProvider('google_meet');
            setMeetingUrl('');
            setError(null);
            setStarted(null);
            setCopied(false);
        }
    }, [open, defaultStudentId, defaultSubject]);

    const { data: students = [], isLoading: loadingStudents } = useQuery<Student[]>({
        queryKey: ['students'],
        queryFn: async () => {
            const data = await api.get<{ data: Student[] } | Student[]>('/students');
            return Array.isArray(data) ? data : (data.data || []);
        },
    });

    const ownStudents = useMemo(() => {
        if (currentUser?.role !== 'teacher') return students;
        const teacherId = currentUser.id;
        const teacherName = currentUser.teacherName || currentUser.name;
        return students.filter((s) => (s.enrollments || []).some((e) =>
            (e.teacherId && e.teacherId === teacherId) ||
            (typeof e.teacher === 'string' && e.teacher === teacherName) ||
            (e.teacher && typeof e.teacher === 'object' && e.teacher.id === teacherId)
        ));
    }, [students, currentUser]);

    const startMutation = useMutation({
        mutationFn: startLiveSession,
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['live-sessions'] });
            setStarted({ id: res.id, meetingUrl: res.meetingUrl });
        },
        onError: (err: unknown) => {
            setError(err instanceof Error ? err.message : 'فشل بدء الحصة');
        },
    });

    const handleStart = () => {
        if (!studentId) {
            setError('يرجى اختيار الطالب قبل بدء الحصة');
            return;
        }
        if (!meetingUrl.trim()) {
            setError('يرجى إدخال رابط الاجتماع');
            return;
        }
        setError(null);
        startMutation.mutate({
            title: `حصة مباشرة: ${subject || currentUser?.name}`,
            subject,
            meetingProvider: provider as 'google_meet' | 'zoom' | 'custom',
            meetingUrl: meetingUrl.trim(),
            targetStudentId: studentId,
        });
    };

    const copyLink = async () => {
        if (!started) return;
        try {
            await navigator.clipboard.writeText(started.meetingUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch { /* ignore */ }
    };

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-label="بدء حصة مباشرة"
            onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}
        >
            <div
                className="bg-card dark:bg-card rounded-2xl shadow-2xl border border-border dark:border-border p-6 max-w-md w-full space-y-5 max-h-[90vh] overflow-y-auto no-scrollbar"
                onClick={(e) => e.stopPropagation()}
            >
                {started ? (
                    <div className="space-y-5">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-lg text-main dark:text-main">بدأت الحصة!</h3>
                            <button
                                onClick={onClose}
                                className="w-9 h-9 flex items-center justify-center rounded-xl bg-surface dark:bg-hover hover:bg-hover dark:hover:bg-primary/5 transition-colors"
                                aria-label="إغلاق"
                            >
                                <X size={16} className="text-muted dark:text-muted" />
                            </button>
                        </div>

                        <div className="p-5 rounded-2xl bg-success-soft dark:bg-success/10 border border-success/30 flex flex-col items-center text-center gap-3">
                            <div className="w-14 h-14 rounded-2xl bg-success/15 flex items-center justify-center">
                                <CheckCircle2 size={26} className="text-success" />
                            </div>
                            <p className="text-[13px] font-bold text-main dark:text-main leading-relaxed">
                                تم إشعار الطالب وولي الأمر بأن الحصة جارية الآن
                            </p>
                            <p className="text-[11px] font-medium text-muted dark:text-muted">
                                رابط الحصة جاهز ويمكن نسخه أو مشاركته
                            </p>
                        </div>

                        <div className="flex items-center gap-2 p-3 rounded-xl bg-background dark:bg-hover border border-border dark:border-border">
                            <div className="min-w-0 flex-1">
                                <p className="text-[10px] font-bold text-muted dark:text-muted mb-0.5">رابط الحصة</p>
                                <p className="text-[11px] font-medium text-primary dark:text-primary truncate" dir="ltr">{started.meetingUrl}</p>
                            </div>
                            <button
                                onClick={copyLink}
                                className="h-9 px-3 rounded-xl bg-primary dark:bg-primary text-on-primary dark:text-on-primary text-[11px] font-bold flex items-center gap-1.5 hover:bg-primary-hover dark:hover:bg-primary-active transition-colors shrink-0"
                                aria-label="نسخ الرابط"
                            >
                                {copied ? <CheckCircle2 size={13} /> : <Copy size={13} />}
                                {copied ? 'تم النسخ' : 'نسخ'}
                            </button>
                            <a
                                href={started.meetingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="h-9 px-3 rounded-xl bg-success dark:bg-success text-on-success dark:text-on-success text-[11px] font-bold flex items-center gap-1.5 hover:opacity-90 transition-opacity shrink-0"
                            >
                                <ExternalLink size={12} />
                                الدخول
                            </a>
                        </div>

                        <Button onClick={onClose} className="w-full h-11 rounded-xl text-xs font-bold bg-primary dark:bg-primary text-on-primary dark:text-on-primary">
                            تم
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary-soft dark:bg-primary/10 flex items-center justify-center">
                                    <Radio size={16} className="text-primary dark:text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-base text-main dark:text-main">بدء حصة مباشرة</h3>
                                    <p className="text-[10px] text-muted dark:text-muted mt-0.5">اختر الطالب ثم ضع الرابط ليصل له وولي أمره</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-9 h-9 flex items-center justify-center rounded-xl bg-surface dark:bg-hover hover:bg-hover dark:hover:bg-primary/5 transition-colors"
                                aria-label="إغلاق"
                            >
                                <X size={16} className="text-muted dark:text-muted" />
                            </button>
                        </div>

                        <div>
                            <label htmlFor="start-live-student" className="block text-xs font-bold text-muted dark:text-muted mb-2">الطالب <span className="text-error">*</span></label>
                            <div className="flex gap-2">
                                <select
                                    id="start-live-student"
                                    value={studentId}
                                    onChange={(e) => setStudentId(e.target.value)}
                                    className="w-full px-4 py-3 text-sm font-medium bg-background dark:bg-surface border border-border dark:border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-focus appearance-none"
                                >
                                    <option value="">— اختر الطالب —</option>
                                    {loadingStudents && <option value="" disabled>جاري تحميل الطلاب...</option>}
                                    {ownStudents.map((s) => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                            {!loadingStudents && ownStudents.length === 0 && (
                                <p className="text-[11px] font-bold text-muted dark:text-muted mt-1 flex items-center gap-1.5">
                                    <Users size={12} />
                                    لا يوجد طلاب مضافون لك حالياً.
                                </p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="start-live-subject" className="block text-xs font-bold text-muted dark:text-muted mb-2">المادة</label>
                            <input
                                id="start-live-subject"
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="الرياضيات"
                                className="w-full px-4 py-3 text-sm font-medium bg-background dark:bg-surface border border-border dark:border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-focus"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-muted dark:text-muted mb-2">نوع الاجتماع</label>
                            <div className="flex gap-2">
                                {PROVIDERS.map((p) => (
                                    <button
                                        key={p.value}
                                        onClick={() => setProvider(p.value)}
                                        className={cn(
                                            "flex-1 py-3 px-2 text-[11px] font-bold rounded-xl border-2 transition-all",
                                            provider === p.value
                                                ? "border-primary dark:border-primary bg-primary-soft dark:bg-primary/10 text-primary dark:text-primary"
                                                : "border-border dark:border-border text-muted dark:text-muted hover:border-primary/30 dark:hover:border-primary/30"
                                        )}
                                    >
                                        {p.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="start-live-meeting-url" className="block text-xs font-bold text-muted dark:text-muted mb-2">رابط الاجتماع <span className="text-error">*</span></label>
                            <div className="flex gap-2">
                                <input
                                    id="start-live-meeting-url"
                                    type="url"
                                    value={meetingUrl}
                                    onChange={(e) => setMeetingUrl(e.target.value)}
                                    placeholder={
                                        provider === 'google_meet' ? 'https://meet.google.com/abc-defg-hij' :
                                        provider === 'zoom' ? 'https://zoom.us/j/1234567890' :
                                        'https://...'
                                    }
                                    className="flex-1 px-4 py-3 text-sm font-medium bg-background dark:bg-surface border border-border dark:border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-focus"
                                />
                                {provider === 'google_meet' && (
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

                        {error && (
                            <p className="text-error text-xs font-bold">{error}</p>
                        )}

                        <div className="flex gap-3 pt-2">
                            <Button
                                variant="outline"
                                onClick={onClose}
                                className="flex-1 h-11 rounded-xl text-xs font-bold"
                            >
                                إلغاء
                            </Button>
                            <Button
                                onClick={handleStart}
                                disabled={startMutation.isPending || !studentId || !meetingUrl.trim()}
                                className="flex-1 h-11 rounded-xl text-xs font-bold bg-primary dark:bg-primary text-on-primary dark:text-on-primary gap-2"
                            >
                                {startMutation.isPending ? <><Loader2 size={14} className="animate-spin" /> جاري...</> : 'بدء الحصة'}
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
