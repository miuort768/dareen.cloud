import { MessageSquare } from 'lucide-react';

interface SupportBannerProps {
    adminPhone: string | undefined;
}

export const SupportBanner = ({ adminPhone }: SupportBannerProps) => {
    const whatsappUrl = `https://wa.me/${(adminPhone?.replace(/\D/g, '') || '').replace(/^0/, '20') || '200000000000'}`;

    return (
        <div className="bg-surface dark:bg-card border border-border dark:border-border rounded-2xl p-5 transition-colors duration-300">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-start">
                    <h4 className="text-sm font-bold text-main dark:text-main mb-0.5">هل تحتاج لمساعدة؟</h4>
                    <p className="text-[11px] font-medium text-muted dark:text-muted">فريق الدعم متاح دائماً لخدمة ولي الأمر</p>
                </div>
                <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-primary dark:bg-primary text-on-primary dark:text-on-primary px-5 py-3 rounded-xl font-bold text-[11px] flex items-center gap-2.5 transition-all active:scale-95 w-full sm:w-auto justify-center"
                >
                    <MessageSquare size={14} />
                    تواصل معنا
                </a>
            </div>
        </div>
    );
};
