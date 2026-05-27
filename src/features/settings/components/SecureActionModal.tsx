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
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full shadow-sm border border-rose-100 dark:border-rose-900">
                <div className="flex flex-col items-center text-center space-y-3">
                    <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/30 rounded-xl flex items-center justify-center text-rose-500 mb-1">
                        <AlertCircle size={24} />
                    </div>
                    <h3 className="text-base font-normal text-slate-800 dark:text-white">{secureAction.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{secureAction.description}</p>

                    <div className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 space-y-3 text-right mt-2">
                        <p className="text-[11px] font-normal text-slate-600 dark:text-slate-300">اكتب للتأكيد:</p>
                        <div className="text-center font-normal text-rose-500 bg-rose-50 dark:bg-rose-900/20 py-1.5 rounded-lg text-xs select-all border border-rose-100 dark:border-rose-800">
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
                            className="flex-1 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-normal rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                            تنفيذ نهائي
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
