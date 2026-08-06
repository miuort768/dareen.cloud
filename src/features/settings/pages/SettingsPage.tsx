import { useEffect, useMemo } from 'react';
import { Settings as SettingsIcon, Building2, Users, Shield, Palette, Coins, MessageSquare, HardDrive, Clock, UserCheck, Award, FileText, Lock, KeyRound, Activity, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '../../../shared/components/ui';
import { cn } from '../../../lib/utils';
import { SecureActionModal } from '../components/SecureActionModal';
import { DeleteUserModal } from '../components/DeleteUserModal';
import { MaintenanceModal } from '../components/MaintenanceModal';
import { SuccessToast } from '../components/SuccessToast';
import { TABS, SettingsTabContent } from './settings-page';
import { useSettingsHandlers } from '../hooks/useSettingsHandlers';
import { useAcademyName } from '../../../context/AppContext';

const particles = Array.from({ length: 8 }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100,
    size: Math.random() * 5 + 2, duration: Math.random() * 6 + 4, delay: Math.random() * 3,
}));

const tabGroups = [
    { label: 'عام', items: ['general', 'academy', 'academic-year'] },
    { label: 'النظام', items: ['users', 'permissions', 'policies', 'working-hours'] },
    { label: 'المالية والتقارير', items: ['currencies', 'reports', 'rewards'] },
    { label: 'الاتصالات', items: ['communications', 'mobile'] },
    { label: 'المظهر', items: ['appearance', 'attendance'] },
    { label: 'الصيانة', items: ['backup', 'advanced', 'audit'] },
];

export const Settings = () => {
    const academyName = useAcademyName();
    useEffect(() => { document.title = `الإعدادات | ${academyName} للتعليم والتدريب`; }, [academyName]);
    const h = useSettingsHandlers();

    const activeTabLabel = TABS.find(t => t.id === h.activeTab)?.label || '';

    const kpiCards = useMemo(() => [
        { label: 'تبويبات', value: TABS.length, icon: SettingsIcon },
        { label: 'مستخدمين', value: h.users?.length || 0, icon: Users },
        { label: 'صلاحيات', value: '14', icon: KeyRound },
        { label: 'حالة', value: h.maintenanceMode ? 'صيانة' : 'نشط', icon: Activity },
    ], [h.users?.length, h.maintenanceMode]);

    if (h.loading) return (
        <div className="max-w-page mx-auto px-2 pt-4 space-y-3">
            <Skeleton className="h-36 rounded-2xl" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[...Array(4)].map((_, i) => <Skeleton key={`kpi-${i}`} className="h-20 rounded-xl" />)}
            </div>
            <Skeleton className="h-64 rounded-2xl" />
        </div>
    );

    return (
        <div className="min-h-full pb-24 overflow-x-hidden relative" dir="rtl">
            <div className="max-w-page mx-auto px-2">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary-deep to-primary-hover p-6 md:p-8 mb-4">
                    {particles.map(p => (
                        <motion.div key={p.id} className="absolute rounded-full bg-white/10 pointer-events-none"
                            style={{ width: p.size, height: p.size, left: `${p.x}%`, top: `${p.y}%` }}
                            animate={{ y: [0, -20, 0], opacity: [0.2, 0.5, 0.2] }} transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }} />
                    ))}
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-2 rounded-xl bg-white/15 backdrop-blur-sm"><SettingsIcon className="text-white" size={20} /></div>
                                <span className="text-white/70 text-xs font-medium">النظام</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">الإعدادات</h1>
                            <p className="text-white/70 text-sm">إدارة إعدادات المنصة وتكوين النظام</p>
                        </div>
                        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                            <div className="text-center">
                                <p className="text-white/60 text-xs mb-1">القسم النشط</p>
                                <p className="text-lg font-bold text-white">{activeTabLabel}</p>
                            </div>
                            <div className="w-px h-10 bg-white/10" />
                            <div className="text-center">
                                <p className="text-white/60 text-xs mb-1">الكل</p>
                                <p className="text-lg font-bold text-white">{TABS.length}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                        {kpiCards.map((kpi, i) => {
                            const Icon = kpi.icon;
                            return (
                                <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 + i * 0.06 }}
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-border/50 p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="p-2 rounded-lg bg-primary/10 text-primary"><Icon size={16} /></div>
                                        <div className="h-1 w-12 rounded-full bg-primary" />
                                    </div>
                                    <p className="text-xs text-muted mb-1">{kpi.label}</p>
                                    <p className="text-2xl font-bold text-main tabular-nums">{kpi.value}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <div className="bg-card border border-border rounded-2xl p-2 mb-4">
                        <div className="flex overflow-x-auto no-scrollbar gap-1">
                            {tabGroups.map((group, gi) => (
                                <div key={group.label} className={cn("flex items-center gap-1", gi > 0 && 'me-2 pe-2 border-s border-border/30')}>
                                    {group.items.map(tabId => {
                                        const tab = TABS.find(t => t.id === tabId);
                                        if (!tab) return null;
                                        const isActive = h.activeTab === tabId;
                                        const Icon = tab.icon;
                                        return (
                                            <button key={tab.id} onClick={() => h.setActiveTab(tab.id)}
                                                className={cn('flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-bold whitespace-nowrap transition-all',
                                                    isActive ? 'bg-primary text-on-primary shadow-sm' : 'text-muted hover:text-main hover:bg-accent/5')}>
                                                <Icon size={13} />
                                                <span className="hidden sm:inline">{tab.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                <AnimatePresence mode="wait">
                    <motion.div key={h.activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                        <SettingsTabContent
                            activeTab={h.activeTab}
                            localAcademyName={h.localAcademyName} setLocalAcademyName={h.setLocalAcademyName}
                            localAcademyLogo={h.localAcademyLogo} setLocalAcademyLogo={h.setLocalAcademyLogo}
                            localAcademyTagline={h.localAcademyTagline} setLocalAcademyTagline={h.setLocalAcademyTagline}
                            localAdminPhone={h.localAdminPhone} setLocalAdminPhone={h.setLocalAdminPhone}
                            localTelegramHandle={h.localTelegramHandle} setLocalTelegramHandle={h.setLocalTelegramHandle}
                            localSemesterName={h.localSemesterName} setLocalSemesterName={h.setLocalSemesterName}
                            localSemesters={h.localSemesters} setLocalSemesters={h.setLocalSemesters}
                            localPrice={h.localPrice} localTeacherPrice={h.localTeacherPrice}
                            localCurrency={h.localCurrency} localThreshold={h.localThreshold}
                            localAutoFreeze={h.localAutoFreeze} localBackdateLock={h.localBackdateLock}
                            setLocalPrice={h.setLocalPrice} setLocalTeacherPrice={h.setLocalTeacherPrice}
                            setLocalCurrency={h.setLocalCurrency} setLocalThreshold={h.setLocalThreshold}
                            setLocalAutoFreeze={h.setLocalAutoFreeze} setLocalBackdateLock={h.setLocalBackdateLock}
                            academyAddress={h.academyAddress} setAcademyAddress={h.setAcademyAddress}
                            academyEmail={h.academyEmail} setAcademyEmail={h.setAcademyEmail}
                            localHeroBanners={h.localHeroBanners} setLocalHeroBanners={h.setLocalHeroBanners}
                            themeColor={h.themeColor} setThemeColor={h.setThemeColor}
                            notificationsEnabled={h.notificationsEnabled} setNotificationsEnabled={h.setNotificationsEnabled}
                            newUser={h.newUser} setNewUser={h.setNewUser}
                            editingUserId={h.editingUserId} setEditingUserId={h.setEditingUserId}
                            setShowDeleteModal={h.setShowDeleteModal}
                            handleUserAction={h.handleUserAction}
                            handleSaveGeneral={h.handleSaveGeneral} isSaving={h.isSaving}
                            showNotify={h.showNotify}
                            maintenanceMode={h.maintenanceMode}
                            setShowMaintenanceModal={h.setShowMaintenanceModal} setMaintenanceMode={h.setMaintenanceMode}
                            handleExportBackup={h.handleExportBackup} handleImportBackup={h.handleImportBackup}
                            triggerReset={h.triggerReset} triggerArchive={h.triggerArchive}
                            setSecureAction={h.setSecureAction}
                            setWhatsappTemplate={h.setWhatsappTemplate}
                            whatsappAutoNotify={h.whatsappAutoNotify} setWhatsappAutoNotify={h.setWhatsappAutoNotify}
                            localWhatsappTemplate={h.localWhatsappTemplate} setLocalWhatsappTemplate={h.setLocalWhatsappTemplate}
                            academyName={h.academyName} academyLogo={h.academyLogo} academyTagline={h.academyTagline}
                            user={h.user} users={h.users}
                            whatsappNumbers={h.whatsappNumbers} setWhatsappNumbers={h.setWhatsappNumbers}
                            backdateLockEnabled={h.backdateLockEnabled} setBackdateLockEnabled={h.setBackdateLockEnabled}
                            teacherCommissionType={h.teacherCommissionType} setTeacherCommissionType={h.setTeacherCommissionType}
                            autoFreezeThreshold={h.autoFreezeThreshold} setAutoFreezeThreshold={h.setAutoFreezeThreshold}
                            reminderMinutesBefore={h.reminderMinutesBefore} setReminderMinutesBefore={h.setReminderMinutesBefore}
                            setSemesterName={h.setSemesterName} setSemesters={h.setSemesters}
                            auditLogs={h.auditLogs} fetchLogs={h.fetchLogs} />
                    </motion.div>
                </AnimatePresence>
            </div>

            <SecureActionModal secureAction={h.secureAction} secureInput={h.secureInput} setSecureInput={h.setSecureInput} setSecureAction={h.setSecureAction} />
            <DeleteUserModal showDeleteModal={h.showDeleteModal} setShowDeleteModal={h.setShowDeleteModal} deleteUser={h.deleteUser} showNotify={h.showNotify} />
            <MaintenanceModal showMaintenanceModal={h.showMaintenanceModal} setShowMaintenanceModal={h.setShowMaintenanceModal} setMaintenanceMode={h.setMaintenanceMode} showNotify={h.showNotify} />
            <SuccessToast showSuccess={h.showSuccess} message={h.notificationMessage} />
        </div>
    );
};

export default Settings;
