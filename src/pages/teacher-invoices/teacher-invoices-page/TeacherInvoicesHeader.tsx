import { Search, Calendar, GraduationCap, Sparkles, Plus, X, UserPlus, Trash2, Printer } from 'lucide-react';
import { INVOICE_STATUS } from '../../../types/invoice';
import { PrimaryBtn, SecondaryBtn, DangerBtn } from '../components/InvoiceUI';

interface TeacherInvoicesHeaderProps {
    stats: { totalAmount: number };
    searchTerm: string;
    onSearchChange: (v: string) => void;
    filterStatus: string;
    onFilterChange: (v: string) => void;
    startDate: string;
    onStartDateChange: (v: string) => void;
    endDate: string;
    onEndDateChange: (v: string) => void;
    showForm: boolean;
    onToggleForm: () => void;
    onImport: () => void;
    onDeleteAll: () => void;
    onPrint: () => void;
    isTeacher: boolean;
}

export const TeacherInvoicesHeader = ({
    stats, searchTerm, onSearchChange, filterStatus, onFilterChange,
    startDate, onStartDateChange, endDate, onEndDateChange,
    showForm, onToggleForm, onImport, onDeleteAll, onPrint, isTeacher
}: TeacherInvoicesHeaderProps) => (
    <>
        <div className="bg-primary rounded-2xl px-4 md:px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-white/15">
                    <GraduationCap size={22} className="text-on-primary" />
                </div>
                <div>
                    <h1 className="text-lg md:text-xl font-black text-on-primary leading-tight">فواتير المعلمات</h1>
                    <p className="text-xs font-bold text-on-primary opacity-70 mt-0.5">إدارة مستحقات المعلمات المالية</p>
                </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold px-3 py-2 whitespace-nowrap rounded-xl bg-success text-on-success">
                <Sparkles size={13} />
                {stats.totalAmount.toLocaleString()} ج.م إجمالي المستحقات
            </div>
        </div>
        <div className="bg-gradient-to-l from-primary to-primary-light rounded-2xl p-3">
            <div className="flex flex-col lg:flex-row gap-3 items-center justify-between">
                <div className="flex-1 flex gap-3 items-center w-full">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-on-primary opacity-50" size={14} />
                        <input placeholder="بحث باسم المعلمة..." value={searchTerm} onChange={(e) => onSearchChange(e.target.value)}
                            className="w-full rounded-xl ps-9 py-2 text-xs font-bold outline-none text-on-primary placeholder:text-on-primary bg-white/15" />
                    </div>
                    <div className="flex items-center gap-2 rounded-xl px-3 py-2 bg-white/15">
                        <Calendar size={14} className="text-on-primary opacity-50" />
                        <div className="flex items-center gap-1">
                            <input type="date" className="bg-transparent border-none p-0 text-xs font-bold text-on-primary outline-none cursor-pointer"
                                value={startDate} onChange={(e) => onStartDateChange(e.target.value)} />
                            <span className="text-micro font-bold text-on-primary opacity-50">إلى</span>
                            <input type="date" className="bg-transparent border-none p-0 text-xs font-bold text-on-primary outline-none cursor-pointer"
                                value={endDate} onChange={(e) => onEndDateChange(e.target.value)} />
                        </div>
                    </div>
                    <select value={filterStatus} onChange={(e) => onFilterChange(e.target.value)}
                        className="w-auto min-w-[140px] rounded-xl px-3 py-2 text-xs font-bold outline-none text-on-primary bg-white/15">
                        <option value="all" className="text-main">جميع الحالات</option>
                        {Object.values(INVOICE_STATUS).map(status => (
                            <option key={status} value={status} className="text-main">{status}</option>
                        ))}
                    </select>
                </div>
                <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto no-scrollbar pb-1 lg:pb-0">
                    {!isTeacher && (
                        <>
                            <PrimaryBtn onClick={onToggleForm} className="whitespace-nowrap">
                                {showForm ? <X size={14} /> : <Plus size={14} />}
                                {showForm ? 'إلغاء' : 'إضافة فاتورة'}
                            </PrimaryBtn>
                            <SecondaryBtn onClick={onImport} title="استيراد من الحصص">
                                <UserPlus size={14} /> استيراد
                            </SecondaryBtn>
                            <DangerBtn onClick={onDeleteAll} title="حذف الكل">
                                <Trash2 size={14} />
                            </DangerBtn>
                        </>
                    )}
                    <SecondaryBtn onClick={onPrint} title="طباعة السجل">
                        <Printer size={14} />
                    </SecondaryBtn>
                </div>
            </div>
        </div>
    </>
);
