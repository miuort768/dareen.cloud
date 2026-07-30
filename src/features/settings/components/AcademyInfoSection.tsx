import { useRef } from 'react';
import { Building2, Phone, MapPin, Hash, Send, Image as ImageIcon, Globe, Apple } from 'lucide-react';
import { Image } from '../../../shared/components/ui';
import { useSettingsStore } from '../../../store/settingsStore';
import { SectionCard, SectionTitle, FieldLabel, InputField, TextAreaField, PrimaryBtn } from './SettingsUI';

export const AcademyInfoSection = ({
    localAcademyName, setLocalAcademyName, localAcademyLogo, setLocalAcademyLogo,
    localAcademyTagline, setLocalAcademyTagline, localAdminPhone, setLocalAdminPhone,
    localTelegramHandle, setLocalTelegramHandle, academyAddress, setAcademyAddress,
    academyEmail, setAcademyEmail, handleSaveGeneral, isSaving,
}: {
    localAcademyName: string; setLocalAcademyName: (v: string) => void;
    localAcademyLogo: string; setLocalAcademyLogo: (v: string) => void;
    localAcademyTagline: string; setLocalAcademyTagline: (v: string) => void;
    localAdminPhone: string; setLocalAdminPhone: (v: string) => void;
    localTelegramHandle: string; setLocalTelegramHandle: (v: string) => void;
    academyAddress: string; setAcademyAddress: (v: string) => void;
    academyEmail: string; setAcademyEmail: (v: string) => void;
    handleSaveGeneral: () => void; isSaving: boolean;
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const googlePlayUrl = useSettingsStore(s => s.googlePlayUrl);
    const appStoreUrl = useSettingsStore(s => s.appStoreUrl);
    const setSetting = useSettingsStore(s => s.setSetting);

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => setLocalAcademyLogo(ev.target?.result as string);
        reader.readAsDataURL(file);
    };

    return (
        <SectionCard>
            <SectionTitle icon={Building2} label="معلومات المعهد" sub="البيانات الأساسية للمعهد" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-4">
                    <div>
                        <FieldLabel>اسم المعهد</FieldLabel>
                        <InputField value={localAcademyName} onChange={e => setLocalAcademyName(e.target.value)} placeholder="مثال: دارين لتعليم والتدريب" />
                    </div>
                    <div>
                        <FieldLabel>الشعار</FieldLabel>
                        <div className="flex items-center gap-3">
                            {localAcademyLogo && (
                                <Image src={localAcademyLogo} alt="Logo" className="w-12 h-12 rounded-lg border border-border/30" />
                            )}
                            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                            <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2.5 bg-background border border-border/30 text-xs font-bold text-muted hover:bg-surface hover:border-border rounded-xl transition-all">
                                <ImageIcon size={14} /> {localAcademyLogo ? 'تغيير' : 'رفع'}
                            </button>
                            {localAcademyLogo && (
                                <button onClick={() => setLocalAcademyLogo('')} className="text-[11px] font-bold text-error hover:text-error-dark transition-colors">إزالة</button>
                            )}
                        </div>
                    </div>
                    <div>
                        <FieldLabel>الوصف (Tagline)</FieldLabel>
                        <InputField value={localAcademyTagline} onChange={e => setLocalAcademyTagline(e.target.value)} placeholder="مثال: مستقبل أفضل لأبنائنا" />
                    </div>
                    <div>
                        <FieldLabel>العنوان</FieldLabel>
                        <TextAreaField value={academyAddress} onChange={e => setAcademyAddress(e.target.value)} placeholder="عنوان المعهد" rows={2} />
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <FieldLabel>رقم الهاتف</FieldLabel>
                        <div className="relative">
                            <Phone size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" />
                            <InputField value={localAdminPhone} onChange={e => setLocalAdminPhone(e.target.value)} className="ps-9" placeholder="مثال: 201015098836" />
                        </div>
                    </div>
                    <div>
                        <FieldLabel>البريد الإلكتروني</FieldLabel>
                        <div className="relative">
                            <Send size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" />
                            <InputField value={academyEmail} onChange={e => setAcademyEmail(e.target.value)} className="ps-9" placeholder="email@example.com" />
                        </div>
                    </div>
                    <div>
                        <FieldLabel>تيليجرام</FieldLabel>
                        <div className="relative">
                            <Hash size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" />
                            <InputField value={localTelegramHandle} onChange={e => setLocalTelegramHandle(e.target.value)} className="ps-9" placeholder="dareen_app" />
                        </div>
                    </div>
                    <div>
                        <FieldLabel>رابط واتساب</FieldLabel>
                        <div className="relative">
                            <MapPin size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" />
                            <InputField value={localAdminPhone} onChange={e => setLocalAdminPhone(e.target.value)} className="ps-9" placeholder="رقم الواتساب" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-6 pt-5 border-t border-border/20">
                <h4 className="font-bold text-sm text-main mb-4">روابط التطبيقات</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <FieldLabel>رابط Google Play</FieldLabel>
                        <div className="relative">
                            <Globe size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" />
                            <InputField value={googlePlayUrl} onChange={e => setSetting('googlePlayUrl', e.target.value)} className="ps-9" placeholder="https://play.google.com/store/apps/..." />
                        </div>
                    </div>
                    <div>
                        <FieldLabel>رابط App Store</FieldLabel>
                        <div className="relative">
                            <Apple size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" />
                            <InputField value={appStoreUrl} onChange={e => setSetting('appStoreUrl', e.target.value)} className="ps-9" placeholder="https://apps.apple.com/app/..." />
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-6 pt-5 border-t border-border/20 flex justify-end">
                <PrimaryBtn onClick={handleSaveGeneral} loading={isSaving}>حفظ معلومات المعهد</PrimaryBtn>
            </div>
        </SectionCard>
    );
};
