import { Building2, Clock, Mail, MessageSquare, Video, Globe } from 'lucide-react';
import { SectionCard, SectionTitle, FieldLabel, InputField, TextAreaField, ToggleRow, PrimaryBtn } from './SettingsUI';

export const CommunicationsSection = ({
    whatsappAutoNotify, setWhatsappAutoNotify,
    localWhatsappTemplate, setLocalWhatsappTemplate,
    setWhatsappTemplate, showNotify,
    academyEmail, setAcademyEmail,
}: {
    whatsappAutoNotify: boolean; setWhatsappAutoNotify: (v: boolean) => void;
    localWhatsappTemplate: string; setLocalWhatsappTemplate: (v: string) => void;
    setWhatsappTemplate: (v: string) => void; showNotify: (msg: string) => void;
    academyEmail: string; setAcademyEmail: (v: string) => void;
}) => {
    const handleSaveWhatsappTemplate = () => {
        setWhatsappTemplate(localWhatsappTemplate);
        showNotify('تم حفظ قالب واتساب');
    };

    return (
        <div className="space-y-5">
            <SectionCard>
                <SectionTitle icon={Mail} label="البريد الإلكتروني" sub="إعدادات SMTP للمراسلات" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <FieldLabel>خادم SMTP</FieldLabel>
                        <InputField placeholder="smtp.gmail.com" />
                    </div>
                    <div>
                        <FieldLabel>المنفذ</FieldLabel>
                        <InputField placeholder="587" />
                    </div>
                    <div>
                        <FieldLabel>البريد الإلكتروني</FieldLabel>
                        <InputField value={academyEmail} onChange={e => setAcademyEmail(e.target.value)} placeholder="noreply@dareen.com" />
                    </div>
                    <div>
                        <FieldLabel>كلمة المرور</FieldLabel>
                        <InputField type="password" placeholder="●●●●●●●●" />
                    </div>
                </div>
                <div className="mt-4 flex justify-end">
                    <PrimaryBtn onClick={() => showNotify('تم حفظ إعدادات البريد')}>حفظ إعدادات البريد</PrimaryBtn>
                </div>
            </SectionCard>

            <SectionCard>
                <SectionTitle icon={MessageSquare} label="واتساب" sub="إعدادات الإشعارات عبر واتساب وقوالب الرسائل" />
                <div className="space-y-4">
                    <ToggleRow
                        icon={MessageSquare}
                        label="الإشعار التلقائي عبر واتساب"
                        sub="إرسال إشعارات تلقائية للطلاب وأولياء الأمور"
                        checked={whatsappAutoNotify}
                        onChange={() => setWhatsappAutoNotify(!whatsappAutoNotify)}
                    />
                    <div>
                        <FieldLabel>قالب رسالة واتساب</FieldLabel>
                        <TextAreaField value={localWhatsappTemplate} onChange={e => setLocalWhatsappTemplate(e.target.value)} rows={4} placeholder="أهلاً {student}، تذكير بحصة {subject} غداً الساعة {time}" />
                    </div>
                    <div className="flex justify-end">
                        <PrimaryBtn onClick={handleSaveWhatsappTemplate}>حفظ قالب واتساب</PrimaryBtn>
                    </div>
                </div>
            </SectionCard>

            <SectionCard>
                <SectionTitle icon={Video} label="Google Meet" sub="إعدادات الاجتماعات الافتراضية" />
                <div className="space-y-4">
                    <div>
                        <FieldLabel>رابط Google Meet الافتراضي</FieldLabel>
                        <InputField placeholder="https://meet.google.com/xxx-xxxx-xxx" />
                    </div>
                    <div className="flex justify-end">
                        <PrimaryBtn onClick={() => showNotify('تم حفظ إعدادات Google Meet')}>حفظ</PrimaryBtn>
                    </div>
                </div>
            </SectionCard>

            <SectionCard>
                <SectionTitle icon={Globe} label="الرسائل النصية (SMS)" sub="إعدادات بوابة الرسائل النصية" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <FieldLabel>اسم المرسل</FieldLabel>
                        <InputField placeholder="Dareen" />
                    </div>
                    <div>
                        <FieldLabel>API Key</FieldLabel>
                        <InputField type="password" placeholder="●●●●●●●●" />
                    </div>
                </div>
                <div className="mt-4 flex justify-end">
                    <PrimaryBtn onClick={() => showNotify('تم حفظ إعدادات SMS')}>حفظ</PrimaryBtn>
                </div>
            </SectionCard>
        </div>
    );
};
