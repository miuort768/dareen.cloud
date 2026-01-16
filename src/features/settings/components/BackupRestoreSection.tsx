import React from 'react';
import { Database, AlertCircle, Download, Upload } from 'lucide-react';

interface BackupRestoreSectionProps {
    onExport: () => void;
    onImport: () => void;
    fileInputRef: React.RefObject<HTMLInputElement>;
    autoBackup: boolean;
}

export const BackupRestoreSection = ({
    onExport,
    onImport,
    fileInputRef: _fileInputRef,
    autoBackup: _autoBackup
}: BackupRestoreSectionProps) => {
    return (
        <section className="bg-white border border-gray-200 p-6 dark:bg-gray-900 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="p-2 bg-primary-100 rounded-none dark:bg-primary-900/30">
                    <Database size={20} className="text-primary-600 dark:text-primary-400" />
                </div>
                <div className="flex-1">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                        إدارة البيانات والنسخ الاحتياطي
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        نسخ احتياطي كامل لقاعدة البيانات والإعدادات
                    </p>
                </div>
            </div>

            <div className="bg-blue-50 border-r-4 border-blue-500 p-4 mb-6 dark:bg-blue-900/10 dark:border-blue-700">
                <div className="flex items-start gap-3">
                    <AlertCircle size={20} className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="text-sm font-bold text-blue-900 dark:text-blue-300 mb-1">
                            النسخة الاحتياطية الكاملة تشمل:
                        </p>
                        <ul className="text-xs text-blue-800 dark:text-blue-400 space-y-1">
                            <li>✓ جميع بيانات الطلاب والتسجيلات</li>
                            <li>✓ بيانات المعلمين وأولياء الأمور</li>
                            <li>✓ الجلسات والمواعيد</li>
                            <li>✓ فواتير الطلاب والمعلمين</li>
                            <li>✓ إعدادات النظام والمستخدمين</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                    onClick={onExport}
                    className="flex items-center justify-center gap-3 p-6 rounded-none border-2 border-primary-200 bg-primary-50 hover:bg-primary-100 transition-all text-primary-700 font-bold dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 group"
                >
                    <Download size={24} className="group-hover:animate-bounce" />
                    <div className="text-right">
                        <p className="font-black">تصدير نسخة احتياطية كاملة</p>
                        <p className="text-xs font-normal opacity-75">حفظ جميع البيانات والإعدادات</p>
                    </div>
                </button>

                <button
                    onClick={onImport}
                    className="flex items-center justify-center gap-3 p-6 rounded-none border-2 border-dashed border-gray-300 hover:border-primary-500 hover:bg-primary-50 transition-all text-gray-600 hover:text-primary-700 font-bold dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 group"
                >
                    <Upload size={24} className="group-hover:animate-bounce" />
                    <div className="text-right">
                        <p className="font-black">استيراد نسخة احتياطية</p>
                        <p className="text-xs font-normal opacity-75">استرجاع من ملف JSON</p>
                    </div>
                </button>
            </div>
        </section>
    );
};
