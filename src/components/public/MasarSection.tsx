import { Link } from 'react-router-dom';
import { Download, FileText, ArrowLeft, MessageCircle, Shield, BadgeCheck, Headphones } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';

export const MasarSection = () => {
    const adminPhone = useSettingsStore(s => s.adminPhone);
    const whatsappNumbers = useSettingsStore(s => s.whatsappNumbers);
    const contactUsNumber = (() => {
        try {
            const entries = JSON.parse(whatsappNumbers);
            const found = entries.find((e: { label: string; phone: string }) => e.label === '����� �����');
            return found ? found.phone.replace(/\D/g, '') : adminPhone.replace(/\D/g, '');
        } catch (e) {
            console.warn(e);
            return adminPhone.replace(/\D/g, '');
        }
    })();

    return (
        <>
            {/* ??? Desktop version ??? */}
            <section className="hidden md:block py-4 bg-surface dark:bg-background relative overflow-hidden transition-colors duration-500">
                <div className="absolute top-0 end-0 w-64 h-64 bg-accent/5 dark:bg-primary/[0.08] rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-0 start-0 w-48 h-48 bg-primary/5 dark:bg-primary/[0.05] rounded-full blur-[80px] pointer-events-none" />
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-6xl mx-auto bg-gradient-to-br from-primary via-primary-hover to-primary dark:from-hover dark:via-card dark:to-hover shadow-2xl overflow-hidden border border-white/5 dark:border-primary/30 relative rounded-2xl">
                        <div className="absolute inset-0 opacity-20 pointer-events-none">
                            <div className="absolute start-0 top-0 w-80 h-80 bg-primary/20 dark:bg-primary/10 rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2"></div>
                            <div className="absolute end-0 bottom-0 w-80 h-80 bg-primary/10 dark:bg-primary/5 rounded-full blur-[120px] -translate-x-1/2 translate-y-1/2"></div>
                        </div>
                        <div className="flex flex-col lg:flex-row items-stretch min-h-[400px]">
                            <div className="w-full lg:w-[40%] relative shrink-0 overflow-hidden bg-white/[0.08] dark:bg-primary/[0.05] backdrop-blur-md flex items-center justify-center p-8 lg:p-4 border-b lg:border-b-0 lg:border-e border-white/10 dark:border-primary/20 group">
                                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 dark:via-primary/10 to-transparent animate-shine-slow pointer-events-none z-30"></div>
                                <div className="relative w-full h-full flex items-center justify-center z-10">
                                    <div className="absolute w-64 h-64 bg-primary/20 dark:bg-primary/10 blur-[80px] rounded-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                                    <picture>
                                        <source srcSet="/dareen_books_portal_v3.webp" type="image/webp" />
                                        <source srcSet="/dareen_books_portal_v3.avif" type="image/avif" />
                                        <img src="/dareen_books_portal_v3.png" alt="����� ����� ��������� - �����" width="680" height="680" loading="lazy" decoding="async" className="w-full max-w-[280px] lg:max-w-[340px] h-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-700" />
                                    </picture>
                                </div>
                            </div>
                            <div className="w-full lg:w-[60%] p-6 md:p-12 lg:p-14 text-on-primary relative z-20 text-center lg:text-start flex flex-col justify-center">
                                <div className="flex items-center justify-center lg:justify-start gap-4 mb-6">
                                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 dark:bg-primary/20 border border-white/20 dark:border-primary/40 rounded-full backdrop-blur-md">
                                        <Download className="w-3.5 h-3.5 text-warning dark:text-primary animate-pulse" />
                                        <span className="text-xs font-black text-on-primary dark:text-primary uppercase tracking-widest">����� ����� ���������</span>
                                    </div>
                                </div>
                                <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black mb-3 font-heading leading-tight">
                                    <span className="text-on-primary dark:text-main">����</span>
                                    <span className="text-on-primary dark:text-on-primary bg-primary dark:bg-primary px-3 py-1 md:px-5 md:py-1 inline-block transform -rotate-1 shadow-lg text-shadow-none whitespace-nowrap">�����</span>
                                    <span className="text-on-primary dark:text-main">�������� ���������</span>
                                </h2>
                                <p className="text-on-primary dark:text-muted text-micro sm:text-xs md:text-sm lg:text-base leading-relaxed mb-4 max-w-2xl mx-auto lg:mx-0 font-medium">
                                    ������ �� ���� ����� ���� �� ���� �������� ��������� ��������� ������� ����� ������� �������ɡ ���� ������ �� ��� ���� �� �������� ����� ����� �������.
                                </p>
                                <div className="flex flex-wrap gap-2 justify-center lg:justify-start mb-5">
                                    <span className="px-3 py-1 bg-white/10 dark:bg-primary/15 border border-white/20 dark:border-primary/30 rounded-full text-micro font-bold text-on-primary dark:text-primary">������</span>
                                    <span className="px-3 py-1 bg-white/10 dark:bg-primary/15 border border-white/20 dark:border-primary/30 rounded-full text-micro font-bold text-on-primary dark:text-primary">��������</span>
                                    <span className="px-3 py-1 bg-white/10 dark:bg-primary/15 border border-white/20 dark:border-primary/30 rounded-full text-micro font-bold text-on-primary dark:text-primary">��������</span>
                                    <span className="px-3 py-1 bg-white/10 dark:bg-primary/15 border border-white/20 dark:border-primary/30 rounded-full text-micro font-bold text-on-primary dark:text-primary">���</span>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                    <Link to="/books" className="px-10 py-4 bg-primary dark:bg-primary hover:bg-primary-hover dark:hover:bg-warning text-on-primary dark:text-on-primary rounded-xl font-black text-lg shadow-2xl shadow-primary/20 dark:shadow-primary/20 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3 group">
                                        <FileText className="w-6 h-6 transition-transform group-hover:scale-110" />
                                        <span>����� �����</span>
                                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                                    </Link>
                                    <a href={`https://wa.me/${contactUsNumber}`} target="_blank" rel="noopener noreferrer" className="px-10 py-4 bg-white/5 dark:bg-primary/10 hover:bg-white/10 dark:hover:bg-accent/20 border border-white/20 dark:border-primary/30 text-on-primary dark:text-primary rounded-xl font-black text-lg backdrop-blur-sm transition-all duration-300 flex items-center justify-center gap-3 hover:border-white/40 dark:hover:border-accent/50">
                                        <MessageCircle className="w-6 h-6" />
                                        <span>����� ����</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ??? Mobile version ??? */}
            <section className="block md:hidden relative overflow-hidden bg-surface dark:bg-background pt-3 pb-4 transition-colors duration-500">
                <div className="absolute top-20 -start-20 w-60 h-60 bg-accent/10 dark:bg-primary/[0.08] rounded-full blur-[100px] pointer-events-none"></div>
                <div className="absolute bottom-40 -end-20 w-72 h-72 bg-primary/10 dark:bg-primary/[0.05] rounded-full blur-[120px] pointer-events-none"></div>

                <div className="relative z-10 px-4">
                    <div className="relative rounded-2xl overflow-hidden shadow-lg mb-4">
                        <div className="absolute inset-0 bg-gradient-to-t from-primary/60 dark:from-black/80 via-transparent to-transparent z-10"></div>
                        <picture>
                            <source srcSet="/dareen_books_portal_v3.webp" type="image/webp" />
                            <source srcSet="/dareen_books_portal_v3.avif" type="image/avif" />
                            <img src="/dareen_books_portal_v3.png" alt="����� ����� ���������" width="400" height="300" loading="lazy" className="w-full h-auto object-cover" />
                        </picture>
                    </div>

                    <div className="bg-surface dark:bg-card rounded-2xl shadow-sm border border-border/80 dark:border-primary/30 p-4 mb-4 flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-primary-soft dark:bg-primary/20 flex items-center justify-center shrink-0">
                            <Download size={20} className="text-primary dark:text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-main dark:text-main text-base font-black leading-tight">����� ����� ���������</h2>
                            <p className="text-muted dark:text-muted text-micro font-medium mt-0.5">���� �������� �� ���� ����</p>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-success animate-pulse shrink-0"></div>
                    </div>

                    <div className="relative bg-gradient-to-br from-primary via-primary-hover to-primary dark:from-primary dark:via-warning dark:to-primary rounded-3xl p-6 shadow-lg shadow-primary/20 dark:shadow-primary/20 mb-5 overflow-hidden">
                        {/* Decorative background pattern */}
                        <div className="absolute inset-0 opacity-10 pointer-events-none">
                            <div className="absolute -top-20 -end-20 w-40 h-40 bg-white/30 rounded-full blur-[60px]"></div>
                            <div className="absolute -bottom-10 -start-10 w-32 h-32 bg-white/20 rounded-full blur-[50px]"></div>
                        </div>

                        {/* Header section */}
                        <div className="relative z-10 mb-5">
                            {/* Badge row */}
                            <div className="flex items-center gap-2 mb-3">
                                <div className="inline-flex items-center gap-1.5 bg-white/20 dark:bg-background/20 backdrop-blur-sm border border-white/30 dark:border-black/30 px-3 py-1.5 rounded-full">
                                    <div className="w-1.5 h-1.5 bg-on-primary rounded-full animate-pulse"></div>
                                    <span className="text-on-primary dark:text-on-primary text-micro font-bold">������</span>
                                </div>
                            </div>

                            {/* Title */}
                            <div className="flex items-baseline gap-2 flex-wrap">
                                <span className="text-on-primary dark:text-on-primary font-black text-xl leading-tight">���� �����</span>
                                <span className="text-on-primary/70 dark:text-on-primary/70 font-bold text-sm">�������� ���������</span>
                            </div>

                            {/* Accent line */}
                            <div className="mt-3 flex items-center gap-2">
                                <div className="h-1 w-8 bg-on-primary/40 rounded-full"></div>
                                <div className="h-1 w-4 bg-on-primary/25 rounded-full"></div>
                                <div className="h-1 w-2 bg-on-primary/15 rounded-full"></div>
                            </div>
                        </div>

                        {/* Description */}
                        <p className="relative z-10 text-on-primary dark:text-on-primary/85 text-micro leading-relaxed mb-6 font-medium">
                            ������ �� ���� ����� ���� �� ���� �������� ��������� ��������� ������� ����� ������� �������ɡ ���� ������ �� ��� ���� �� �������� ����� ����� �������.
                        </p>

                        {/* CTA Buttons */}
                        <div className="relative z-10 flex flex-col gap-3">
                            <Link
                                to="/books"
                                className="w-full py-4 bg-on-primary text-primary dark:bg-on-primary dark:text-primary font-black text-base shadow-lg shadow-black/20 hover:shadow-black/30 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 rounded-2xl group"
                            >
                                <FileText size={20} />
                                <span>����� �����</span>
                                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                            </Link>
                            <a
                                href={`https://wa.me/${contactUsNumber}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-3.5 bg-white/10 dark:bg-background/15 backdrop-blur-sm border border-on-primary/20 dark:border-on-primary/20 text-on-primary dark:text-on-primary font-bold text-sm hover:bg-white/20 dark:hover:bg-black/25 transition-all flex items-center justify-center gap-3 rounded-2xl"
                            >
                                <MessageCircle size={18} />
                                <span>����� ����</span>
                            </a>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center bg-surface dark:bg-card rounded-2xl shadow-sm border border-border/80 dark:border-primary/20 p-4">
                            <div className="w-12 h-12 mx-auto mb-2.5 rounded-2xl bg-primary-soft dark:bg-primary/15 flex items-center justify-center">
                                <Shield size={20} className="text-primary dark:text-primary" />
                            </div>
                            <span className="text-main dark:text-main text-xs font-bold leading-tight block">���� ������</span>
                        </div>
                        <div className="text-center bg-surface dark:bg-card rounded-2xl shadow-sm border border-border/80 dark:border-primary/20 p-4">
                            <div className="w-12 h-12 mx-auto mb-2.5 rounded-2xl bg-success-light dark:bg-primary/15 flex items-center justify-center">
                                <BadgeCheck size={20} className="text-success dark:text-primary" />
                            </div>
                            <span className="text-main dark:text-main text-xs font-bold leading-tight block">����� �����</span>
                        </div>
                        <div className="text-center bg-surface dark:bg-card rounded-2xl shadow-sm border border-border/80 dark:border-primary/20 p-4">
                            <div className="w-12 h-12 mx-auto mb-2.5 rounded-2xl bg-warning-light dark:bg-primary/15 flex items-center justify-center">
                                <Headphones size={20} className="text-warning dark:text-primary" />
                            </div>
                            <span className="text-main dark:text-main text-xs font-bold leading-tight block">��� ����� ���� �����</span>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};