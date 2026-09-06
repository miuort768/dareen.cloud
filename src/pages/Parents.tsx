import { useEffect, useState, useMemo, useCallback } from 'react'
import { Plus, Download, FileText, FileUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../lib/utils'
import { downloadExport } from '../lib/download'
import { useShowNotification, useAcademyName } from '../context/AppContext'
import type { Parent, Student } from '../types'

import { ParentsHeader } from '../features/parents/components/ParentsHeader'
import { ParentsTable } from '../features/parents/components/ParentsTable'
import { ParentDrawer } from '../features/parents/components/ParentDrawer'
import { ParentForm } from '../features/parents/components/ParentForm'
import { useParents } from '../features/parents/hooks/useParents'
import { ConfirmModal } from '../shared/components/ConfirmModal'
import { Skeleton } from '../shared/components/ui/Skeleton'
import { canonicalPhone } from '../lib/phone'

const samePhone = (a?: string | null, b?: string | null) => {
  const ca = canonicalPhone(a)
  const cb = canonicalPhone(b)
  return ca.length > 0 && ca === cb
}

const parentHasStudents = (parent: Parent, students: Student[]) =>
  students.filter(
    (s) => samePhone(parent.phone, s.parentPhone) || (parent.id && s.parent?.id === parent.id),
  )

export const Parents = () => {
  const academyName = useAcademyName()
  useEffect(() => {
    document.title = `أولياء الأمور | ${academyName}`
  }, [academyName])
  const { state, actions } = useParents()
  const showNotification = useShowNotification()
  const [fabOpen, setFabOpen] = useState(false)

  const [filterStatus, setFilterStatus] = useState('')

  const filteredParents = useMemo(() => {
    let list = state.filteredParents
    if (filterStatus === 'active')
      list = list.filter((p) =>
        parentHasStudents(p, state.students).some((s) => (s.enrollments?.length || 0) > 0),
      )
    else if (filterStatus === 'inactive')
      list = list.filter(
        (p) => !parentHasStudents(p, state.students).some((s) => (s.enrollments?.length || 0) > 0),
      )
    else if (filterStatus === 'overdue')
      list = list.filter((p) =>
        parentHasStudents(p, state.students).some((s) =>
          (s.enrollments || []).some((en) => en.sessionsTotal - en.sessionsUsed <= 2),
        ),
      )
    return list
  }, [state.filteredParents, filterStatus, state.students])

  const isEdit = !!state.editId

  const openEditParent = (parent: Parent) => {
    actions.handleEditParent(parent)
    actions.setShowDetails(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const openAddParent = useCallback(() => {
    actions.setShowAddForm(true)
    actions.setEditId(null)
    actions.setNewParent({ name: '', phone: '', phone2: '', username: '', password: '' })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [actions])

  const fabActions = useMemo(
    () => [
      {
        icon: Plus,
        label: 'إضافة ولي أمر',
        onClick: () => {
          if (!state.showAddForm) openAddParent()
        },
      },
      { icon: FileUp, label: 'استيراد من الطلاب', onClick: actions.handleImportParents },
      {
        icon: Download,
        label: 'تصدير Excel',
        onClick: () =>
          downloadExport('parents', 'xlsx')
            .then(() => showNotification('تم تصدير Excel', 'success'))
            .catch((e) => showNotification(e.message, 'error')),
      },
      {
        icon: FileText,
        label: 'تصدير PDF',
        onClick: () =>
          downloadExport('parents', 'pdf')
            .then(() => showNotification('تم تصدير PDF', 'success'))
            .catch((e) => showNotification(e.message, 'error')),
      },
    ],
    [state.showAddForm, showNotification, actions, openAddParent],
  )

  if (state.loading) {
    return (
      <div className="min-h-full bg-background" dir="rtl">
        <div className="relative z-10 mx-auto max-w-page space-y-4 pt-3 md:space-y-5 md:pt-8">
          <Skeleton className="h-44 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative min-h-full overflow-x-hidden bg-background pb-2 font-sans"
      dir="rtl"
    >
      <div className="relative z-10 mx-auto max-w-page space-y-4 pt-3 md:space-y-5 md:pt-8">
        <ParentsHeader
          totalParents={state.totalParents}
          totalLinkedStudents={state.totalLinkedStudents}
          showAddForm={state.showAddForm}
          searchTerm={state.searchTerm}
          onSearchChange={actions.setSearchTerm}
          filterStatus={filterStatus}
          onFilterStatusChange={setFilterStatus}
          onToggleAddForm={() => {
            if (state.showAddForm) {
              actions.setShowAddForm(false)
              actions.setEditId(null)
            } else {
              openAddParent()
            }
          }}
          onImport={actions.handleImportParents}
          onExportExcel={() =>
            downloadExport('parents', 'xlsx')
              .then(() => showNotification('تم تصدير Excel', 'success'))
              .catch((e) => showNotification(e.message, 'error'))
          }
          onExportPDF={() =>
            downloadExport('parents', 'pdf')
              .then(() => showNotification('تم تصدير PDF', 'success'))
              .catch((e) => showNotification(e.message, 'error'))
          }
        />

        <div className="space-y-4 md:space-y-5">
          <AnimatePresence>
            {state.showAddForm && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <ParentForm
                  isEdit={isEdit}
                  formData={state.newParent}
                  onChange={actions.setNewParent}
                  onSubmit={actions.handleAddParent}
                  onClose={() => {
                    actions.setShowAddForm(false)
                    actions.setEditId(null)
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {!state.showDetails ? (
              <ParentsTable
                parents={filteredParents}
                students={state.students}
                selectedParentId={state.selectedParent?.id || null}
                showDetails={state.showDetails}
                onSelectParent={(parent) => {
                  actions.setSelectedParent(parent)
                  actions.setShowDetails(true)
                }}
                onEdit={openEditParent}
                onDelete={actions.handleDeleteParent}
                onViewParent={(parent) => {
                  actions.setSelectedParent(parent)
                  actions.setShowDetails(true)
                }}
              />
            ) : (
              <ParentDrawer
                parent={state.selectedParent}
                details={state.selectedParentData}
                onClose={() => actions.setShowDetails(false)}
                onEdit={openEditParent}
                onDelete={actions.handleDeleteParent}
                onCall={(phone) => window.open(`tel:${phone}`)}
                onWhatsApp={(phone) =>
                  window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}`, '_blank')
                }
                inline
              />
            )}
          </motion.div>
        </div>

        {/* Parent details now render inline above */}
      </div>

      <ConfirmModal
        isOpen={state.confirmModal.show}
        title={
          state.confirmModal.title ||
          (state.confirmModal.variant === 'danger' ? 'تأكيد عملية الحذف' : 'إشعار')
        }
        message={state.confirmModal.message}
        confirmText={state.confirmModal.confirmText}
        cancelText="إلغاء"
        isDestructive={state.confirmModal.variant !== 'primary'}
        requirePassword={state.confirmModal.variant === 'danger'}
        expectedPassword="dareen"
        onConfirm={() => {
          if (state.confirmModal.action) state.confirmModal.action()
        }}
        onClose={() =>
          actions.setConfirmModal({ ...state.confirmModal, show: false, action: null })
        }
      />

      <div
        className="fixed end-4 z-50 flex flex-col items-end gap-3 md:end-8"
        style={{ bottom: 'calc(96px + env(safe-area-inset-bottom, 0px))' }}
      >
        <AnimatePresence>
          {fabOpen &&
            fabActions.map((action, i) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, scale: 0.3, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.3, y: 20 }}
                transition={{ delay: 0.05 * (fabActions.length - 1 - i) }}
                className="flex items-center gap-2"
              >
                <span className="whitespace-nowrap rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-bold shadow-elevation-1">
                  {action.label}
                </span>
                <button
                  onClick={() => {
                    action.onClick()
                    setFabOpen(false)
                  }}
                  aria-label={action.label}
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-card text-main shadow-elevation-2 transition-colors hover:bg-hover focus-visible:ring-2 focus-visible:ring-focus active:scale-95"
                >
                  <action.icon size={18} />
                </button>
              </motion.div>
            ))}
        </AnimatePresence>
        <motion.button
          onClick={() => setFabOpen(!fabOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label={fabOpen ? 'إغلاق القائمة' : 'خيارات أولياء الأمور'}
          aria-expanded={fabOpen}
          className={cn(
            'flex h-14 w-14 items-center justify-center rounded-2xl text-on-primary shadow-elevation-3 transition-colors focus-visible:ring-2 focus-visible:ring-focus',
            fabOpen ? 'bg-error' : 'bg-primary',
          )}
        >
          <Plus
            size={24}
            className={cn('transition-transform duration-normal', fabOpen && 'rotate-45')}
          />
        </motion.button>
      </div>
    </motion.div>
  )
}
