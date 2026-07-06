import { useEffect, useState } from 'react';
import { settingsService } from '../../settings/services/settingsService';

interface MonitoringData {
    total: number;
    errors: number;
    slow: { method: string; path: string; duration: number }[];
    uptime: number;
    memory: { rss: number; heapUsed: number; heapTotal: number };
    database: string;
    counts: { users: number; sessions: number; backups: number };
    timestamp: string;
    byMethod: Record<string, number>;
    byPath: Record<string, number>;
}

export const MonitoringPage = () => {
    const [data, setData] = useState<MonitoringData | null>(null);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);
        try {
            const d = await settingsService.getMonitoring();
            setData(d);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); const t = setInterval(load, 15000); return () => clearInterval(t); }, []);

    if (loading && !data) return <div style={{ padding: 20 }}>جاري التحميل...</div>;

    const fmtBytes = (b: number) => b > 1073741824 ? `${(b / 1073741824).toFixed(1)} GB` : b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${(b / 1024).toFixed(1)} KB`;
    const fmtUptime = (s: number) => { const d = Math.floor(s / 86400); s %= 86400; const h = Math.floor(s / 3600); s %= 3600; const m = Math.floor(s / 60); return `${d}d ${h}h ${m}m`; };

    return (
        <div style={{ padding: 20, direction: 'rtl', maxWidth: 900, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2>مراقبة النظام</h2>
                <button onClick={load}>تحديث</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
                {[
                    ['الطلبات', data?.total || 0],
                    ['الأخطاء', data?.errors || 0],
                    ['البطيئة', data?.slow?.length || 0],
                    ['المستخدمين', data?.counts?.users || 0],
                    ['الجلسات', data?.counts?.sessions || 0],
                    ['النسخ', data?.counts?.backups || 0],
                ].map(([label, value]) => (
                    <div key={label as string} style={{ background: 'var(--bg-surface)', padding: 16, borderRadius: 8, textAlign: 'center' }}>
                        <div style={{ fontSize: 24, fontWeight: 'bold' }}>{value}</div>
                        <div style={{ color: '#666' }}>{label}</div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                <div style={{ background: 'var(--bg-surface)', padding: 16, borderRadius: 8 }}>
                    <h3>الذاكرة</h3>
                    <div>المستخدم: {fmtBytes(data?.memory?.rss || 0)}</div>
                    <div>Heap: {fmtBytes(data?.memory?.heapUsed || 0)} / {fmtBytes(data?.memory?.heapTotal || 0)}</div>
                </div>
                <div style={{ background: 'var(--bg-surface)', padding: 16, borderRadius: 8 }}>
                    <h3>النظام</h3>
                    <div>عمر التشغيل: {fmtUptime(data?.uptime || 0)}</div>
                    <div>قاعدة البيانات: {data?.database === 'connected' ? '✅ متصلة' : '❌ منفصلة'}</div>
                    <div>آخر تحديث: {data?.timestamp ? new Date(data.timestamp).toLocaleString('ar-SA') : ''}</div>
                </div>
            </div>

            {data?.slow && data.slow.length > 0 && (
                <div style={{ background: 'rgba(255,193,7,0.20)', padding: 16, borderRadius: 8, marginBottom: 24 }}>
                    <h3>{'الطلبات البطيئة (>1s)'}</h3>
                    {data.slow.slice(-10).reverse().map((s, i) => (
                        <div key={i} style={{ fontSize: 13, margin: '4px 0' }}>
                            {s.method} {s.path} — {(s.duration / 1000).toFixed(1)}s
                        </div>
                    ))}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ background: 'var(--bg-surface)', padding: 16, borderRadius: 8 }}>
                    <h3>حسب الطريقة</h3>
                    {Object.entries(data?.byMethod || {}).map(([k, v]) => (
                        <div key={k}>{k}: {v}</div>
                    ))}
                </div>
                <div style={{ background: 'var(--bg-surface)', padding: 16, borderRadius: 8 }}>
                    <h3>حسب المسار</h3>
                    {Object.entries(data?.byPath || {}).sort((a, b) => b[1] - a[1]).slice(0, 15).map(([k, v]) => (
                        <div key={k}>{k}: {v}</div>
                    ))}
                </div>
            </div>
        </div>
    );
};
