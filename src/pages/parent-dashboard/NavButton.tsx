import type { FC } from 'react';

export const NavButton: FC<{
    label: string;
    icon: FC<{ size?: number }>;
    onClick?: () => void;
}> = ({ label, icon: Icon, onClick }) => (
    <button onClick={onClick}
        className="bg-card border border-border rounded-2xl p-4 flex flex-col items-center justify-center gap-2 transition-all active:scale-95 hover:bg-card group">
        <div className="w-10 h-10 bg-warning rounded-2xl flex items-center justify-center text-on-warning group-hover:scale-110 transition-transform">
            <Icon size={18} />
        </div>
        <span className="text-micro font-bold text-muted">{label}</span>
    </button>
);
