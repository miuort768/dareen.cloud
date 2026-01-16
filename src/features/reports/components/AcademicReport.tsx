import { BarChart3, PieChart, Search, Activity } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart as RePieChart, Pie, Cell
} from 'recharts';
import { CHART_COLORS } from '../types';

interface AcademicReportProps {
    gradeBarData: any[];
    subjectPieData: any[];
    totalEnrollments: number;
    filteredStudentProgress: any[];
    studentProgressTotal: number;
    searchTerm: string;
    setSearchTerm: (val: string) => void;
}

export const AcademicReport = ({
    gradeBarData,
    subjectPieData,
    totalEnrollments,
    filteredStudentProgress,
    studentProgressTotal: _studentProgressTotal,
    searchTerm,
    setSearchTerm
}: AcademicReportProps) => {
    return (
        <div className="space-y-6">
            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Grade Distribution */}
                <div className="bg-white p-6 border border-gray-200 dark:bg-gray-900 dark:border-gray-800 shadow-xl relative overflow-hidden group">
                    <h2 className="text-lg font-black text-gray-800 mb-6 dark:text-white flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30">
                            <BarChart3 size={20} className="text-indigo-600" />
                        </div>
                        توزيع الطلاب حسب الصف
                    </h2>
                    <div className="h-80" dir="ltr">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={gradeBarData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} opacity={0.5} />
                                <XAxis dataKey="grade" tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false} dy={10} />
                                <YAxis tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false} dx={-10} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                                    content={({ active, payload, label }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="bg-white/95 backdrop-blur-xl border border-gray-200 p-4 shadow-2xl dark:bg-gray-900/95 dark:border-gray-700 min-w-[150px]" dir="rtl">
                                                    <p className="text-xs font-black text-gray-400 mb-3 border-b border-gray-100 pb-2 dark:border-gray-800">{label}</p>
                                                    {payload.map((entry: any, index: number) => (
                                                        <div key={index} className="flex items-center justify-between gap-3 text-xs">
                                                            <div className="flex items-center gap-1.5">
                                                                <div className="w-2 h-2" style={{ backgroundColor: entry.fill }}></div>
                                                                <span className="text-gray-600 dark:text-gray-300 font-bold">عدد الطلاب</span>
                                                            </div>
                                                            <span className="font-black text-gray-900 dark:text-white">{entry.value}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Bar dataKey="count" fill="#8B5CF6" radius={[2, 2, 0, 0]} maxBarSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Subject Distribution */}
                <div className="bg-white p-6 border border-gray-200 dark:bg-gray-900 dark:border-gray-800">
                    <h2 className="text-lg font-bold text-gray-800 mb-6 dark:text-white flex items-center gap-2">
                        <PieChart size={20} className="text-purple-600" />
                        توزيع الاشتراكات حسب المادة
                    </h2>
                    <div className="flex flex-col md:flex-row items-center gap-6 h-full">
                        <div className="w-full md:w-1/2 h-64 relative">
                            {subjectPieData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <RePieChart>
                                        <Pie data={subjectPieData} cx="50%" cy="50%" innerRadius={65} outerRadius={95} paddingAngle={4} cornerRadius={4} dataKey="value" stroke="none">
                                            {subjectPieData.map((_, index) => <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip />
                                    </RePieChart>
                                </ResponsiveContainer>
                            ) : <div className="h-full flex items-center justify-center text-gray-400">لا توجد بيانات</div>}
                        </div>
                        <div className="w-full md:w-1/2 grid grid-cols-2 gap-2 overflow-y-auto max-h-64 pr-2">
                            {subjectPieData.map((entry, index) => (
                                <div key={index} className="flex flex-col p-2 bg-gray-50 dark:bg-gray-800/50 border-r-2" style={{ borderColor: CHART_COLORS[index % CHART_COLORS.length] }}>
                                    <span className="text-[10px] text-gray-400 font-bold truncate">{entry.name}</span>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-black text-gray-900 dark:text-white">{entry.value}</span>
                                        <span className="text-[10px] font-bold opacity-60">{Math.round((entry.value / totalEnrollments) * 100)}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Student Progress Table */}
            <div className="bg-white border border-gray-200 overflow-hidden dark:bg-gray-900 dark:border-gray-800">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Activity size={20} className="text-purple-600" />
                        تقرير تقدم الطلاب
                    </h2>
                </div>
                <div className="p-4 bg-gray-50 border-b border-gray-100 dark:bg-gray-800/50 dark:border-gray-800">
                    <div className="relative">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="ابحث عن طالب أو صف..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-4 pr-10 py-2.5 border border-gray-200 focus:outline-none focus:border-purple-500 text-sm rounded-none bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-gray-800 dark:to-gray-800 text-xs font-bold text-gray-700 dark:text-gray-300">
                            <tr>
                                <th className="px-6 py-4 text-center">اسم الطالب</th>
                                <th className="px-6 py-4 text-center">الصف</th>
                                <th className="px-6 py-4 text-center">عدد الاشتراكات</th>
                                <th className="px-6 py-4 text-center">الحصص المتوقعة</th>
                                <th className="px-6 py-4 text-center">الحصص المستخدمة</th>
                                <th className="px-6 py-4 text-center">نسبة التقدم</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {filteredStudentProgress.length > 0 ? filteredStudentProgress.map((student) => (
                                <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    <td className="px-6 py-2.5 text-center font-bold text-gray-900 dark:text-white text-sm">{student.name}</td>
                                    <td className="px-6 py-2.5 text-center">
                                        <span className="inline-block px-3 py-1 bg-blue-500/10 text-blue-700 dark:text-blue-400 text-[10px] font-black uppercase rounded-full border border-blue-500/20">{student.grade}</span>
                                    </td>
                                    <td className="px-6 py-2.5 text-center font-mono text-sm font-bold">{student.totalEnrollments}</td>
                                    <td className="px-6 py-2.5 text-center font-mono text-sm font-bold">{student.totalSessions}</td>
                                    <td className="px-6 py-2.5 text-center font-mono text-sm font-bold text-emerald-600">{student.usedSessions}</td>
                                    <td className="px-6 py-2.5">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden dark:bg-gray-700 max-w-[100px]">
                                                <div className={`h-full rounded-full ${student.progress >= 80 ? 'bg-emerald-600' : student.progress >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${student.progress}%` }}></div>
                                            </div>
                                            <span className="text-xs font-bold text-gray-600 dark:text-gray-400">{student.progress}%</span>
                                        </div>
                                    </td>
                                </tr>
                            )) : <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">لا توجد نتائج</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
