import { AlertCircle } from 'lucide-react';
import { InputField, SecondaryBtn } from './SettingsUI';

interface SecureActionModalProps {
    secureAction: {
        type: 'reset' | 'archive';
        title: string;
        description: string;
        confirmWord: string;
        actionFn: () => void;
    } | null;
    secureInput: string;
    setSecureInput: (v: string) => void;
    setSecureAction: (v: SecureActionModalProps['secureAction']) => void;
}

export const SecureActionModal = ({ secureAction, secureInput, setSecureInput, setSecureAction }: SecureActionModalProps) => {
    if (!secureAction) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4  bg-black/50 animate-in fade-in">
            <div className="bg-card p-6 max-w-md w-full shadow-sm border border-error">
                <div className="flex flex-col items-center text-center space-y-3">
                    <div className="w-12 h-12 bg-error-soft flex items-center justify-center text-error mb-1">
                        <AlertCircle size={24} />
                    </div>
                    <h3 className="text-base font-normal text-main">{secureAction.title}</h3>
                    <p className="text-xs text-muted leading-relaxed">{secureAction.description}</p>

                    <div className="w-full bg-surface p-4 border border-border space-y-3 text-right mt-2">
                        <p className="text-[11px] font-normal text-muted">اكتب للتأكيد:</p>
                        <div className="text-center font-normal text-error bg-error-soft py-1.5 text-xs select-all border border-error">
                            {secureAction.confirmWord}
                        </div>
                        <InputField
                            value={secureInput}
                            onChange={e => setSecureInput(e.target.value)}
                            placeholder="اكتب العبارة للتحقق..."
                            className="text-center"
                        />
                    </div>

                    <div className="flex gap-2 w-full pt-2">
                        <SecondaryBtn onClick={() => { setSecureAction(null); setSecureInput(''); }} className="flex-1">
                            تراجع
                        </SecondaryBtn>
                        <button
                            disabled={secureInput !== secureAction.confirmWord}
                            onClick={() => { secureAction.actionFn(); setSecureAction(null); setSecureInput(''); }}
                            className="flex-1 py-2 bg-error hover:bg-error-hover text-on-error text-xs font-normal disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                            تنفيذ نهائي
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
