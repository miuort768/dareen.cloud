import { MessageSquare } from 'lucide-react';
import { useAdminPhone } from '../../context/AppContext';

export const SupportBanner = () => {
    const adminPhone = useAdminPhone();
    const waPhone = ((adminPhone?.replace(/\D/g, '') || '').replace(/^0/, '965')) || '96500000000';

    return (
        <div className="px-4 py-3 pb-6">
            <div className="bg-primary rounded-card p-5 shadow-soft">
                <h3 className="text-on-primary font-black text-lg mb-1 text-start">تحتاج مساعدة؟</h3>
                <p className="text-on-primary opacity-80 text-xs mb-4 text-start">فريقنا جاهز لمساعدتك في أي وقت</p>
                <a href={`https://wa.me/${waPhone}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-card text-primary py-3 rounded-card font-black text-sm shadow-soft active:scale-95 transition-transform">
                    <MessageSquare size={16} /> تواصل الآن
                </a>
            </div>
        </div>
    );
};
