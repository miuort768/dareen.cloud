import { useState } from 'react';
import { 
    User, Lock, Palette, CheckCircle2, Save, Sparkles, 
    ShieldCheck, UserCog
} from 'lucide-react';
import { useCurrentUser, useUpdateCurrentUser, useThemeColor, useSetThemeColor, useShowNotification } from '../context/AppContext';
import type { User } from '../types/auth';
import { Image } from '../shared/components/ui';
import { cn } from '../lib/utils';
import { triggerHaptic } from '../lib/haptics';

const THEME_COLORS = [
    { id: 'indigo', label: '����', class: 'bg-primary' },
    { id: 'blue', label: '����', class: 'bg-info' },
    { id: 'emerald', label: '�����', class: 'bg-success' },
    { id: 'rose', label: '����', class: 'bg-error' },
    { id: 'amber', label: '�������', class: 'bg-warning' },
    { id: 'purple', label: '�������', class: 'bg-primary' },
    { id: 'cyan', label: '����', class: 'bg-info' },
    { id: 'teal', label: '������', class: 'bg-info' },
    { id: 'orange', label: '�������', class: 'bg-warning' },
    { id: 'pink', label: '����', class: 'bg-primary' },
    { id: 'lava', label: '���', class: 'bg-warning' },
    { id: 'midnight', label: '����', class: 'bg-primary-active' },
    { id: 'gold', label: '����', class: 'bg-warning' },
    { id: 'crimson', label: '�����', class: 'bg-error' },
];

export const Profile = () => {
    const currentUser = useCurrentUser();
    const updateCurrentUser = useUpdateCurrentUser();
    const themeColor = useThemeColor();
    const setThemeColor = useSetThemeColor();
    const showNotification = useShowNotification();
    
    const [name, setName] = useState(currentUser?.name || '');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSaveProfile = async () => {
        if (!name.trim()) {
            showNotification('���� ����� �����', 'error');
            return;
        }

        if (password && password !== confirmPassword) {
            showNotification('����� ���� ��� �������', 'error');
            return;
        }

        setIsSaving(true);
        try {
            triggerHaptic('medium');
            
            // Prepare updates
            const updates: Partial<User> = { name };
            if (password) {
                updates.password = password;
                // For admin visibility as requested
                updates.plainPassword = password; 
            }

            await updateCurrentUser(updates);
            showNotification('�� ����� ����� ������ �����', 'success');
            setPassword('');
            setConfirmPassword('');
        } catch {
            showNotification('��� ����� ��������', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-full bg-background dark:bg-background pb-20 font-sans" dir="rtl">
            {/* Header Area */}
            <div className="bg-white dark:bg-primary-active border-b border-border dark:border-border px-6 py-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                
                <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-6 relative z-10">
                    <div className="relative group">
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-none bg-surface dark:bg-primary-active border-4 border-white dark:border-border shadow-sm overflow-hidden flex items-center justify-center">
                            {currentUser?.avatar ? (
                                <Image src={currentUser.avatar} alt={currentUser.name} className="w-full h-full" />
                            ) : (
                                <User size={48} className="text-muted" />
                            )}
                        </div>
                    </div>

                    <div className="text-center md:text-right flex-1">
                        <h1 className="text-2xl md:text-3xl font-medium text-main dark:text-on-primary mb-1 uppercase tracking-tighter">
                            {currentUser?.name}
                        </h1>
                        <p className="text-muted dark:text-muted font-normal text-sm flex items-center justify-center md:justify-start gap-2">
                            <span className="bg-primary-light dark:bg-primary/30 text-primary dark:text-primary px-3 py-0.5 rounded-full text-micro uppercase tracking-widest">
                                {currentUser?.role === 'admin' ? '���� ������' : 
                                 currentUser?.role === 'student' ? '����' : 
                                 currentUser?.role === 'parent' ? '��� ���' : '����'}
                            </span>
                            <span className="opacity-40">/</span>
                            <span className="font-mono">@{currentUser?.username}</span>
                        </p>
                    </div>

                    <div className="flex gap-2">
                         <div className="flex flex-col items-center px-4 py-2 bg-background dark:bg-primary-active/50 rounded-none border border-border dark:border-border">
                            <span className="text-micro text-muted font-normal uppercase mb-1">����� ��������</span>
                            <span className="text-xs font-medium text-main dark:text-dim">������ 2023</span>
                         </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-2 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column: Form */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Info */}
                    <div className="bg-white dark:bg-primary-active rounded-none p-6 shadow-sm border border-border dark:border-border">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-info-light dark:bg-info/20 rounded-none flex items-center justify-center text-info">
                                <UserCog size={20} />
                            </div>
                            <h2 className="font-medium text-main dark:text-on-primary tracking-tight">��������� ��������</h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-muted dark:text-muted uppercase tracking-widest mb-2 ms-1">����� ������</label>
                                <input 
                                    type="text" 
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-background dark:bg-primary-active/50 border-none rounded-none px-4 py-3 text-sm font-normal text-main dark:text-on-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                    placeholder="���� ���� ���..."
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-muted dark:text-muted uppercase tracking-widest mb-2 ms-1">��� �������� (�� ���� ������)</label>
                                <input 
                                    type="text" 
                                    value={currentUser?.username}
                                    disabled
                                    className="w-full bg-surface dark:bg-primary-active border-none rounded-none px-4 py-3 text-sm font-normal text-muted cursor-not-allowed"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Password Security */}
                    <div className="bg-white dark:bg-primary-active rounded-none p-6 shadow-sm border border-border dark:border-border">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-error-light dark:bg-error/20 rounded-none flex items-center justify-center text-error">
                                <ShieldCheck size={20} />
                            </div>
                            <h2 className="font-medium text-main dark:text-on-primary tracking-tight">���� ������</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-muted dark:text-muted uppercase tracking-widest mb-2 ms-1">���� ���� �������</label>
                                    <div className="relative">
                                        <input 
                                            type="password" 
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-background dark:bg-primary-active/50 border-none rounded-none px-4 py-3 pr-10 text-sm font-normal text-main dark:text-on-primary focus:ring-2 focus:ring-error/20 transition-all"
                                            placeholder="��������"
                                        />
                                        <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-dim" size={16} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-muted dark:text-muted uppercase tracking-widest mb-2 ms-1">����� ���� ����</label>
                                    <div className="relative">
                                        <input 
                                            type="password" 
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full bg-background dark:bg-primary-active/50 border-none rounded-none px-4 py-3 pr-10 text-sm font-normal text-main dark:text-on-primary focus:ring-2 focus:ring-error/20 transition-all"
                                            placeholder="��������"
                                        />
                                        <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 text-dim" size={16} />
                                    </div>
                                </div>
                            </div>
                            <p className="text-micro text-muted font-medium leading-relaxed bg-background dark:bg-primary-active/50 p-3 rounded-lg border border-border dark:border-border">
                                �����: ������ ���� �� ���� ����� ��� ���� ������. ������ ���� ������ �� ������� �� ��� �������.
                            </p>
                        </div>
                    </div>

                    <button 
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                        className={cn(
                            "w-full bg-primary hover:bg-primary-hover text-on-primary font-medium py-4 rounded-none shadow-sm shadow-primary/20 flex items-center justify-center gap-3 transition-all active:scale-[0.98]",
                            isSaving && "opacity-70 cursor-not-allowed"
                        )}
                    >
                        {isSaving ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Save size={20} />
                                <span className="uppercase tracking-widest text-sm">��� ���������</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Right Column: Themes */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-primary-active rounded-none p-6 shadow-sm border border-border dark:border-border h-fit">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-warning-light dark:bg-warning/20 rounded-none flex items-center justify-center text-warning">
                                <Palette size={20} />
                            </div>
                            <h2 className="font-medium text-main dark:text-on-primary tracking-tight">���� �������</h2>
                        </div>

                        <p className="text-xs text-muted mb-4 font-normal uppercase tracking-tighter">���� ����� ���� ����� ������ ������</p>
                        
                        <div className="grid grid-cols-4 gap-3">
                            {THEME_COLORS.map(c => (
                                <button
                                    key={c.id}
                                    onClick={() => setThemeColor(c.id)}
                                    className={cn(
                                        "aspect-square rounded-none transition-all relative group",
                                        c.class,
                                        themeColor === c.id 
                                            ? "ring-4 ring-offset-4 ring-primary dark:ring-offset-background scale-105" 
                                            : "hover:scale-110 shadow-sm"
                                    )}
                                    title={c.label}
                                >
                                    {themeColor === c.id && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Sparkles size={16} className="text-on-primary drop-shadow-sm animate-pulse" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quick Stats or Info */}
                    <div className="bg-gradient-to-br from-[var(--bg-primary)] to-primary rounded-none p-6 text-on-primary shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:scale-150 transition-transform duration-700" />
                        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                             ���� ��������
                        </h3>
                        <p className="text-xs text-on-primary/80 leading-relaxed mb-6 font-medium">
                            ��� ����� �� ����� �� ����� �� ���� �������ʡ ����� ������� �� ����� ����� ������.
                        </p>
                        <button onClick={() => showNotification('سيتم توفير خاصية التواصل قريباً', 'info')} className="w-full bg-white/20 hover:bg-white/30  text-on-primary border border-white/20 py-2.5 rounded-lg text-xs font-medium uppercase tracking-widest transition-all">
                            تواصل معنا
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};
