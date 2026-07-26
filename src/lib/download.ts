import { API_BASE_URL } from '../config/api';

function getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
}

export async function downloadExport(
    entity: string,
    format: 'xlsx' | 'pdf',
    params: Record<string, string> = {}
): Promise<void> {
    const searchParams = new URLSearchParams({ format, ...params }).toString();
    const url = `${API_BASE_URL}/export/${entity}?${searchParams}`;
    const token = getAuthToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(url, { headers });
    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'فشل التصدير' }));
        throw new Error(error.error || 'فشل التصدير');
    }

    const blob = await response.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const disposition = response.headers.get('Content-Disposition') || '';
    const match = disposition.match(/filename="?(.+?)"?$/);
    link.download = match?.[1] || `${entity}_${new Date().toISOString().split('T')[0]}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}
