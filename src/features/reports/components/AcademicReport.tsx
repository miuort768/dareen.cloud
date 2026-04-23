import { BarChart3, PieChart, Search, Activity } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart as RePieChart, Pie, Cell
} from 'recharts';
import { CHART_COLORS } from '../types';
import { cn } from '../../../lib/utils';

interface AcademicReportProps {
    gradeBarData: any[];
    subjectPieData: any[];
    totalEnrollments: number;
    filteredStudentProgress: any[];
    studentProgressTotal: number;
    searchTerm: string;
    setSearchTerm: (val: string) => void;
}

const SectionCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={cn(
        'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm p-4 md:p-5',
        className
    )}>
        {children}
    </div>
);

const SectionTitle = ({ icon: Icon, label, sub }: { icon: any; label: string; sub?: string }) => (
    <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="w-8 h-8 flex items-center justify-center bg-[#eef2ff] dark:bg-indigo-900/30 rounded-xl">
            <Icon size={16} className="text-[#5c59f2]" />
        </div>
        <div>
            <p className="text-sm font-bold text-slate-800 dark:text-white">{label}</p>
            {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
        </div>
    </div>
);

export const AcademicReport = ({
    gradeBarData,
    subjectPieData,
    totalEnrollments,
    filteredStudentProgress,
    searchTerm,
    setSearchTerm
}: AcademicReportProps) => {
    return (
        <div className="space-y-4">
            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Grade Distribution */}
                <SectionCard>
                    <SectionTitle icon={BarChart3} label="توزيع الطلاب حسب الصف" />
                    <div className="h-64" dir="ltr">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={gradeBarData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} opacity={0.5} />
                                <XAxis dataKey="grade" tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} dy={10} />
                                <YAxis tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} dx={-10} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                                    content={({ active, payload, label }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="bg-white/95 backdrop-blur-xl border border-slate-100 p-3 rounded-xl shadow-xl dark:bg-slate-900/95 dark:border-slate-700 min-w-[120px]" dir="rtl">
                                                    <p className="text-[10px] font-bold text-slate-400 mb-2 border-b border-slate-50 pb-1 dark:border-slate-800">{label}</p>
                                                    {payload.map((entry: any, index: number) => (
                                                        <div key={index} className="flex items-center justify-between gap-3 text-[10px]">
                                                            <div className="flex items-center gap-1.5">
                                                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.fill }}></div>
                                                                <span className="text-slate-500 dark:text-slate-400 font-bold">الطلاب</span>
                                                            </div>
                                                            <span className="font-black text-slate-800 dark:text-white">{entry.value}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Bar dataKey="count" fill="#5c59f2" radius={[4, 4, 0, 0]} maxBarSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </SectionCard>

                {/* Subject Distribution */}
                <SectionCard>
                    <SectionTitle icon={PieChart} label="توزيع الاشتراكات حسب المادة" />
                    <div className="flex flex-col md:flex-row items-center gap-4 h-full">
                        <div className="w-full md:w-1/2 h-64 relative">
                            {subjectPieData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <RePieChart>
                                        <Pie data={subjectPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={4} cornerRadius={6} dataKey="value" stroke="none">
                                            {subjectPieData.map((_, index) => <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip />
                                    </RePieChart>
                                </ResponsiveContainer>
                            ) : <div className="h-full flex items-center justify-center text-slate-300 text-xs font-bold">لا توجد بيانات</div>}
                        </div>
                        <div className="w-full md:w-1/2 grid grid-cols-2 gap-1.5 overflow-y-auto max-h-64 pr-1 scrollbar-thin content-start">
                            {subjectPieData.map((entry, index) => (
                                <div key={index} className="flex flex-col justify-between p-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-sm border-r-2" style={{ borderColor: CHART_COLORS[index % CHART_COLORS.length] }}>
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="text-[8px] text-slate-400 font-bold truncate max-w-[70%]">{entry.name}</p>
                                        <span className="text-[8px] font-bold text-slate-400 bg-white dark:bg-slate-700 px-1 py-0.5 rounded border border-slate-100 dark:border-slate-600 leading-none">
                                            {Math.round((entry.value / totalEnrollments) * 100)}%
                                        </span>
                                    </div>
                                    <p className="text-[10px] font-black text-slate-800 dark:text-white font-mono">{entry.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </SectionCard>
            </div>

            {/* Student Progress Table */}
            <SectionCard className="p-0 overflow-hidden">
                <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 flex items-center justify-center bg-[#eef2ff] dark:bg-indigo-900/30 rounded-xl">
                            <Activity size={16} className="text-[#5c59f2]" />
                        </div>
                        <h2 className="text-sm font-bold text-slate-800 dark:text-white">تقرير تقدم الطلاب</h2>
                    </div>
                    <div className="relative flex-1 max-w-xs">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input
                            type="text"
                            placeholder="ابحث عن طالب أو صف..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-3 pr-9 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:border-[#5c59f2] transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                                <th className="px-4 py-3">اسم الطالب</th>
                                <th className="px-4 py-3 text-center">الصف</th>
                                <th className="px-4 py-3 text-center">الاشتراكات</th>
                                <th className="px-4 py-3 text-center">المتوقعة</th>
                                <th className="px-4 py-3 text-center">المستخدمة</th>
                                <th className="px-4 py-3 text-center">التقدم</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                            {filteredStudentProgress.length > 0 ? filteredStudentProgress.map((student) => (
                                <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                    <td className="px-4 py-3">
                                        <p className="font-bold text-slate-800 dark:text-white">{student.name}</p>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className="inline-flex px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[9px] font-bold rounded-md border border-blue-100 dark:border-blue-800">
                                            {student.grade}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center font-mono font-bold text-slate-500">{student.totalEnrollments}</td>
                                    <td className="px-4 py-3 text-center font-mono font-bold text-slate-500">{student.totalSessions}</td>
                                    <td className="px-4 py-3 text-center font-mono font-bold text-emerald-600">{student.usedSessions}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-center gap-3">
                                            <div className="flex-1 bg-slate-100 h-1.5 rounded-full overflow-hidden dark:bg-slate-700 max-w-[80px]">
                                                <div className={cn(
                                                    "h-full rounded-full transition-all duration-1000",
                                                    student.progress >= 80 ? 'bg-emerald-500' : student.progress >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                                                )} style={{ width: `${student.progress}%` }}></div>
                                            </div>
                                            <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 w-8">{student.progress}%</span>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-300 font-bold">لا توجد نتائج</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </SectionCard>
        </div>
    );
};
