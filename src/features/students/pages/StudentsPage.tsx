import { useState, useRef } from 'react';
import { useStudents } from '../hooks/useStudents';
import { useTeachers } from '../../teachers/hooks/useTeachers';
import { useShowNotification } from '../../../context/AppContext';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { Search, AlertCircle, Plus, TrendingUp, Download, Upload, Trash2 } from 'lucide-react';

// Shared Components
import { PageLoader } from '../../../components/ui/PageLoader';
// Feature Components
import { StudentStats } from '../components/StudentStats';
import { StudentForm } from '../components/StudentForm';
import { StudentTable } from '../components/StudentTable';
import { StudentDetails } from '../components/StudentDetails';
import { ConfirmModal } from '../../../shared/components/ConfirmModal';

// Utils
import { generateSessionDates } from '../utils/sessionUtils';

// Types
import type { Student, Enrollment, ScheduleSlot } from '../types';

interface EnrollmentFormData {
    teacher: string;
    subject: string;
    curr: string;
    totalSessions: number;
    schedule: ScheduleSlot[];
}

export const Students = () => {
    const queryClient = useQueryClient();
    const showNotification = useShowNotification();

    const [searchTerm, setSearchTerm] = useState('');
    const { students: allStudents, isLoading: loadingStudents, createStudent, updateStudent, deleteStudent, deleteAllStudents } = useStudents();

    // Instant Local Filtering
    const students = allStudents.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.parentPhone?.includes(searchTerm) ||
        student.studentPhone?.includes(searchTerm) ||
        student.grade.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const { teachers, isLoading: loadingTeachers } = useTeachers();

    const [showAddForm, setShowAddForm] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [showDetails, setShowDetails] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [isDeletingAll, setIsDeletingAll] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const loading = loadingStudents || loadingTeachers;

    // Calculate Stats
    const activeEnrollments = allStudents.reduce((acc, s) => acc + (s.enrollments?.length || 0), 0);
    const uniqueGrades = new Set(allStudents.map(s => s.grade)).size;
    const totalExpectedSessions = allStudents.reduce((acc, s) => 
        acc + (s.enrollments?.reduce((enAcc, en) => enAcc + (en.sessionsTotal || 0), 0) || 0), 0
    );
    const averageSessions = allStudents.length > 0 ? Math.round(totalExpectedSessions / allStudents.length) : 0;

    // Handlers
    const handleAddOrUpdateStudent = (data: Omit<Student, 'id' | 'enrollments'>) => {
        if (editId) {
            const existing = students.find(s => s.id === editId);
            if (existing) {
                updateStudent({ ...existing, ...data } as Student);
            }
        } else {
            createStudent({ ...data, enrollments: [] } as Omit<Student, 'id'>);
        }
        setShowAddForm(false);
        setEditId(null);
    };

    const handleEditStudent = (student: Student) => {
        setEditId(student.id);
        setShowAddForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleAddEnrollment = async (enrollData: EnrollmentFormData) => {
        if (!selectedStudent) return;

        try {
            const sessionInfos = generateSessionDates(enrollData.schedule, enrollData.totalSessions);
            const teacherObj = teachers.find(t => t.name === enrollData.teacher);

            for (const info of sessionInfos) {
                await api.post('/sessions', {
                    studentId: selectedStudent.id,
                    studentName: selectedStudent.name,
                    teacherId: teacherObj?.id,
                    teacherName: enrollData.teacher,
                    subject: enrollData.subject,
                    date: info.date.toISOString().split('T')[0],
                    day: info.slot.day,
                    time: `${info.slot.hour} ${info.slot.period === 'am' ? 'صباحاً' : 'مساءً'}`,
                    status: 'pending',
                    price: teacherObj?.price || 0
                });
            }

            const newEnrollment: Enrollment = {
                teacher: enrollData.teacher,
                teacherId: teacherObj?.id,
                subject: enrollData.subject,
                curr: enrollData.curr,
                sessionsTotal: enrollData.totalSessions,
                sessionsUsed: 0,
                schedule: enrollData.schedule
            };

            const updatedStudent = {
                ...selectedStudent,
                enrollments: [...(selectedStudent.enrollments || []), newEnrollment]
            };

            updateStudent(updatedStudent);
            setSelectedStudent(updatedStudent);
            queryClient.invalidateQueries({ queryKey: ['students'] });
            showNotification('تم إضافة الاشتراك والجلسات بنجاح', 'success');
        } catch (error) {
            console.error('Error adding enrollment:', error);
            showNotification('فشل إضافة الاشتراك', 'error');
        }
    };

    if (loading) {
        return <PageLoader />;
    }

    return (
        <div className="min-h-full pb-24 overflow-x-hidden relative bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-[#020617] dark:via-slate-950 dark:to-blue-950/20" dir="rtl">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/10 dark:bg-blue-500/5 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-cyan-400/10 dark:bg-cyan-500/5 blur-3xl pointer-events-none" />
            <div className="relative z-10 mx-auto px-2 space-y-4">

                {showAddForm && (
<div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/50 shadow-sm p-5 md:p-6 rounded-2xl">
                        <StudentForm
                            initialData={editId ? allStudents.find(s => s.id === editId) : null}
                            teachers={teachers}
                            onSubmit={handleAddOrUpdateStudent}
                            onCancel={() => { setShowAddForm(false); setEditId(null); }}
                        />
                    </div>
                )}

                <div className="bg-white dark:bg-slate-900 border border-slate-100/50 dark:border-slate-800/50 shadow-sm px-5 md:px-7 py-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundColor: '#2563EB12', color: '#2563EB' }}>
                            <TrendingUp size={22} />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-[#0F172A] dark:text-white leading-tight">إدارة الطلاب</h1>
                            <p className="text-[10px] font-medium text-[#64748B] mt-0.5">سجل الطلاب والمنتسبين — {allStudents.length} طالب نشط</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="بحث..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full md:w-52 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 text-[10px] font-bold px-8 py-1.5 outline-none focus:border-blue-400 transition-all rounded-xl"
                            />
                        </div>
                        <button onClick={() => { setEditId(null); setShowAddForm(true); }} className="flex items-center gap-1.5 bg-[#2563EB] hover:bg-blue-700 text-white text-[10px] font-bold px-3 py-1.5 transition-all active:scale-[0.97] rounded-xl shadow-sm"><Plus size={13} /> إضافة</button>
                    </div>
                </div>

                {isDeletingAll && (
                    <div className="border border-rose-200 dark:border-rose-800/50 bg-rose-50 dark:bg-rose-950/30 p-4 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <AlertCircle size={18} className="text-rose-500" />
                            <span className="text-xs font-bold text-rose-700 dark:text-rose-300">هل أنت متأكد من حذف جميع الطلاب؟</span>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={async () => { await deleteAllStudents(); setIsDeletingAll(false); }} className="h-8 px-4 bg-rose-600 text-white text-[10px] font-bold hover:bg-rose-700 transition-all rounded-lg">تأكيد الحذف</button>
                            <button onClick={() => setIsDeletingAll(false)} className="h-8 px-4 bg-white dark:bg-slate-800 text-slate-700 dark:text-white text-[10px] font-bold border border-slate-200 dark:border-slate-700 transition-all rounded-lg">إلغاء</button>
                        </div>
                    </div>
                )}

                <div className="p-5 md:p-6 bg-white dark:bg-slate-900 border border-slate-100/50 dark:border-slate-800/50 shadow-sm rounded-2xl">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundColor: '#22C55E12', color: '#22C55E' }}>
                            <TrendingUp size={16} />
                        </div>
                        <h2 className="text-sm font-bold text-[#0F172A] dark:text-white">إحصائيات الطلاب</h2>
                    </div>
                    <StudentStats
                        totalStudents={allStudents.length}
                        activeEnrollments={activeEnrollments}
                        uniqueGrades={uniqueGrades}
                        averageSessionsPerStudent={averageSessions}
                    />
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-100/50 dark:border-slate-800/50 shadow-sm rounded-2xl">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-3 p-3">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                            <span>{students.length} / {allStudents.length} طالب</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="file"
                                ref={fileInputRef}
                                accept=".csv,.xlsx"
                                className="hidden"
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    try {
                                        const text = await file.text();
                                        const lines = text.split('\n').filter(Boolean);
                                        for (let i = 1; i < lines.length; i++) {
                                            const cols = lines[i].split(',');
                                            if (cols.length >= 2) {
                                                await api.post('/students', {
                                                    name: cols[0].trim(),
                                                    grade: cols[1].trim(),
                                                    parentPhone: cols[2]?.trim() || '',
                                                });
                                            }
                                        }
                                        queryClient.invalidateQueries({ queryKey: ['students'] });
                                        showNotification('تم استيراد الطلاب بنجاح', 'success');
                                    } catch {
                                        showNotification('فشل استيراد الملف', 'error');
                                    }
                                    e.target.value = '';
                                }}
                            />
                            <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold px-2.5 py-1.5 border border-slate-100 dark:border-slate-700 transition-all shadow-sm active:scale-[0.97] rounded-xl"><Upload size={12} /> استيراد</button>
                            <button onClick={() => { /* export */ }} className="flex items-center gap-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold px-2.5 py-1.5 border border-slate-100 dark:border-slate-700 transition-all shadow-sm active:scale-[0.97] rounded-xl"><Download size={12} /> تصدير</button>
                            <button onClick={() => setIsDeletingAll(true)} className="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:bg-rose-500 hover:border-rose-500 hover:text-white text-rose-500 text-[10px] font-bold px-2.5 py-1.5 transition-all shadow-sm active:scale-[0.97] rounded-xl"><Trash2 size={12} /></button>
                        </div>
                    </div>
                </div>

                {!showDetails ? (
                    <div className="animate-in fade-in duration-300">
                        <StudentTable
                            students={students}
                            onEdit={handleEditStudent}
                            onDelete={(id) => setDeletingId(id)}
                            onSelect={(student) => { setSelectedStudent(student); setShowDetails(true); }}
                            selectedId={selectedStudent?.id}
                            teachers={teachers}
                        />
                    </div>
                ) : (
                    <div className="animate-in slide-in-from-right-8 duration-500">
                        {selectedStudent && (
                            <StudentDetails
                                student={selectedStudent}
                                teachers={teachers}
                                onClose={() => setShowDetails(false)}
                                onUpdateStudent={(updated) => {
                                    updateStudent(updated as Student);
                                }}
                                onAddEnrollment={handleAddEnrollment}
                            />
                        )}
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={!!deletingId}
                title="حذف طالب"
                message="سيتم حذف كافة بيانات الطالب. هل أنت متأكد؟"
                onConfirm={async () => {
                    if (deletingId) {
                        deleteStudent(deletingId);
                        setDeletingId(null);
                    }
                }}
                onClose={() => setDeletingId(null)}
            />
        </div>
    );
};

