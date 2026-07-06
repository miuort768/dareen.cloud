import { useState, useRef } from 'react';
import { Building2, Phone, MapPin, Hash, Send, Image as ImageIcon } from 'lucide-react';
import { Image } from '../../../shared/components/ui';
import { SectionCard, SectionTitle, FieldLabel, InputField, TextAreaField, PrimaryBtn } from './SettingsUI';

export const AcademyInfoSection = ({
    localAcademyName, setLocalAcademyName,
    localAcademyLogo, setLocalAcademyLogo,
    localAcademyTagline, setLocalAcademyTagline,
    localAdminPhone, setLocalAdminPhone,
    localTelegramHandle, setLocalTelegramHandle,
    academyAddress, setAcademyAddress,
    academyEmail, setAcademyEmail,
    handleSaveGeneral, isSaving,
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
                                <Image src={localAcademyLogo} alt="Logo" className="w-12 h-12 rounded-lg border" />
                            )}
                            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                            <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border text-xs font-bold text-muted hover:bg-hover rounded-xl transition-all">
                                <ImageIcon size={14} /> {localAcademyLogo ? 'تغيير' : 'رفع'}
                            </button>
                            {localAcademyLogo && (
                                <button onClick={() => setLocalAcademyLogo('')} className="text-micro font-bold text-error hover:text-error-dark">إزالة</button>
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
                            <Phone size={14} className="absolute end-3 top-1/2 -translate-y-1/2 text-dim" />
                            <InputField value={localAdminPhone} onChange={e => setLocalAdminPhone(e.target.value)} className="pe-9" placeholder="مثال: 201015098836" />
                        </div>
                    </div>
                    <div>
                        <FieldLabel>البريد الإلكتروني</FieldLabel>
                        <div className="relative">
                            <Send size={14} className="absolute end-3 top-1/2 -translate-y-1/2 text-dim" />
                            <InputField value={academyEmail} onChange={e => setAcademyEmail(e.target.value)} className="pe-9" placeholder="email@example.com" />
                        </div>
                    </div>
                    <div>
                        <FieldLabel>تيليجرام</FieldLabel>
                        <div className="relative">
                            <Hash size={14} className="absolute end-3 top-1/2 -translate-y-1/2 text-dim" />
                            <InputField value={localTelegramHandle} onChange={e => setLocalTelegramHandle(e.target.value)} className="pe-9" placeholder="dareen_app" />
                        </div>
                    </div>
                    <div>
                        <FieldLabel>رابط واتساب</FieldLabel>
                        <div className="relative">
                            <MapPin size={14} className="absolute end-3 top-1/2 -translate-y-1/2 text-dim" />
                            <InputField value={localAdminPhone} onChange={e => setLocalAdminPhone(e.target.value)} className="pe-9" placeholder="رقم الواتساب" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border flex justify-end">
                <PrimaryBtn onClick={handleSaveGeneral} loading={isSaving}>حفظ معلومات المعهد</PrimaryBtn>
            </div>
        </SectionCard>
    );
};
