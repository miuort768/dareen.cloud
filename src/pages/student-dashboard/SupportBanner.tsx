import { MessageSquare } from 'lucide-react';
import { useAdminPhone } from '../../context/AppContext';

export const SupportBanner = () => {
    const adminPhone = useAdminPhone();
    const waPhone = ((adminPhone?.replace(/\D/g, '') || '').replace(/^0/, '965')) || '96500000000';

    return (
        <div className="px-4 py-3 pb-6">
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary to-primary-active p-5 shadow-lg shadow-primary/20">
                <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
                <div className="relative z-10">
                    <h3 className="text-white font-bold text-lg mb-1 text-start">تحتاج مساعدة؟</h3>
                    <p className="text-white/80 text-xs mb-4 text-start">فريقنا جاهز لمساعدتك في أي وقت</p>
                    <a href={`https://wa.me/${waPhone}`} target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 bg-white text-primary py-3 rounded-xl font-bold text-sm shadow-lg active:scale-95 transition-transform">
                        <MessageSquare size={16} /> تواصل الآن
                    </a>
                </div>
            </div>
        </div>
    );
};
