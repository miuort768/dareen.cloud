import { alert } from '../../lib/confirmDialog';

export const ForumHelpBanner = () => (
    <div className="max-w-[700px] mx-auto px-4 mt-10 mb-8">
        <div className="bg-primary rounded-card p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-soft">
            <div className="text-center md:text-start">
                <h4 className="text-on-primary font-bold text-base mb-1">إرشادات المنتدى</h4>
                <p className="text-on-primary/80 text-xs font-medium">يرجى الالتزام بسياسات النشر واحترام آراء الآخرين</p>
            </div>
            <button onClick={() => alert('يرجى الالتزام بسياسات النشر واحترام آراء الآخرين.\n\nالممنوع:\n• الإساءة والمحتوى المسيء\n• الترويج\n• نشر معلومات شخصية')}
                className="bg-card text-primary px-6 py-2.5 text-xs font-bold rounded-card hover:bg-primary-soft transition-all shadow-sm active:scale-95">
                عرض الإرشادات
            </button>
        </div>
    </div>
);
