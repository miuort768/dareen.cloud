import { Activity, GraduationCap } from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend
} from 'recharts';

interface AttendanceReportProps {
    monthlySessionsData: any[];
    teacherPerformanceData: any[];
}

export const AttendanceReport = ({
    monthlySessionsData,
    teacherPerformanceData
}: AttendanceReportProps) => {
    return (
        <div className="space-y-4">
            {/* Monthly Sessions Trend */}
            <div className="bg-white p-3 border border-gray-200 dark:bg-gray-900 dark:border-gray-800 shadow-sm">
                <h2 className="text-sm font-bold text-gray-800 mb-3 dark:text-white flex items-center gap-2">
                    <Activity size={16} className="text-purple-600" />
                    اتجاه الحضور الشهري
                </h2>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={monthlySessionsData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                            <XAxis dataKey="month" tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
                            <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} dx={-10} />
                            <Tooltip content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="bg-white border border-gray-200 p-4 shadow-xl dark:bg-gray-900 dark:border-gray-700 min-w-[200px]" dir="rtl">
                                            <p className="text-sm font-bold mb-3 border-b pb-2">{label}</p>
                                            {payload.map((entry: any, index: number) => (
                                                <div key={index} className="flex items-center justify-between gap-4 text-xs mb-2 last:mb-0">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.stroke }}></div>
                                                        <span className="text-gray-600 dark:text-gray-300">{entry.name}</span>
                                                    </div>
                                                    <span className="font-bold">{entry.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                }
                                return null;
                            }} />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            <Line type="monotone" dataKey="total" name="إجمالي" stroke="#8B5CF6" strokeWidth={3} />
                            <Line type="monotone" dataKey="completed" name="حضور" stroke="#10B981" strokeWidth={3} />
                            <Line type="monotone" dataKey="cancelled" name="غياب" stroke="#EF4444" strokeWidth={3} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Teacher Performance Table */}
            <div className="bg-white border border-gray-200 overflow-hidden dark:bg-gray-900 dark:border-gray-800">
                <div className="p-3 border-b border-gray-100 dark:border-gray-800">
                    <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <GraduationCap size={16} className="text-purple-600" />
                        أداء المعلمات
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-gray-800 dark:to-gray-800 text-[10px] font-black text-gray-700 dark:text-gray-300 uppercase tracking-tighter">
                            <tr>
                                <th className="px-3 py-2 text-center border-l-2 border-white/20">اسم المعلمة</th>
                                <th className="px-3 py-2 text-center border-l-2 border-white/20">المتوقعة</th>
                                <th className="px-3 py-2 text-center border-l-2 border-white/20">المكتملة</th>
                                <th className="px-3 py-2 text-center border-l-2 border-white/20">الملغية</th>
                                <th className="px-3 py-2 text-center">نسبة النجاح</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {teacherPerformanceData.map((teacher, index) => (
                                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    <td className="px-3 py-1.5 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-purple-500/10 text-purple-700 flex items-center justify-center font-black text-[9px] border border-purple-500/20">{teacher.teacher.charAt(0)}</div>
                                            <p className="text-xs font-bold text-gray-900 dark:text-white">{teacher.teacher}</p>
                                        </div>
                                    </td>
                                    <td className="px-3 py-1.5 text-center font-mono text-xs font-bold">{teacher.total}</td>
                                    <td className="px-3 py-1.5 text-center font-mono text-xs font-bold text-emerald-600">{teacher.completed}</td>
                                    <td className="px-3 py-1.5 text-center font-mono text-xs font-bold text-rose-600">{teacher.cancelled}</td>
                                    <td className="px-3 py-1.5">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden dark:bg-gray-700 max-w-[100px]">
                                                <div className={`h-full rounded-full ${teacher.rate >= 80 ? 'bg-emerald-600' : teacher.rate >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${teacher.rate}%` }}></div>
                                            </div>
                                            <span className="text-xs font-bold text-gray-600 dark:text-gray-400">{teacher.rate}%</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
