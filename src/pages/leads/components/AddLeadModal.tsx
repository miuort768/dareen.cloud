import React from 'react'
import { X, UserPlus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { PrimaryBtn } from './LeadsUI'

interface LeadFormData {
  studentName: string
  phone: string
  subject: string
  curriculum: string
  status: string
  priority: string
  notes: string
}

interface AddLeadModalProps {
  isAddModalOpen: boolean
  setIsAddModalOpen: (v: boolean) => void
  addMutation: { mutate: (data: LeadFormData) => void; isPending: boolean }
  formRef: React.RefObject<HTMLFormElement | null>
}

const inputClass =
  'w-full bg-surface border border-border px-3.5 py-3 text-[13px] outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/10 text-main rounded-xl transition-all duration-200 placeholder:text-muted/60 font-bold'
const labelClass = 'text-[11px] font-bold text-muted mb-1.5 block'

export const AddLeadModal = ({
  isAddModalOpen,
  setIsAddModalOpen,
  addMutation,
  formRef,
}: AddLeadModalProps) => {
  return (
    <AnimatePresence>
      {isAddModalOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm dark:bg-black/70"
            onClick={() => setIsAddModalOpen(false)}
          />
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-[210] flex max-h-[90vh] flex-col overflow-hidden border border-border bg-card md:inset-auto md:left-1/2 md:top-1/2 md:max-h-[85vh] md:w-full md:max-w-lg md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-2xl md:shadow-2xl"
            dir="rtl"
          >
            {/* Drag handle — mobile only */}
            <div className="flex shrink-0 justify-center pb-1 pt-3 md:hidden">
              <div className="h-1 w-10 rounded-full bg-border" />
            </div>

            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft">
                  <UserPlus size={18} className="text-primary" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-main">إضافة عميل جديد</h2>
                  <p className="mt-0.5 text-[10px] text-muted">أدخل بيانات العميل الجديد</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="bg-error/15 hover:bg-error/25 flex h-8 w-8 items-center justify-center rounded-full text-error transition-all"
                aria-label="إغلاق"
              >
                <X size={14} />
              </button>
            </div>

            {/* Form */}
            <form
              ref={formRef}
              className="flex-1 space-y-4 overflow-y-auto p-5"
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                const getStr = (name: string) => (formData.get(name) as string) || ''
                addMutation.mutate({
                  studentName: getStr('name'),
                  phone: getStr('phone'),
                  subject: getStr('subject'),
                  curriculum: getStr('curriculum'),
                  status: 'new',
                  priority: getStr('priority'),
                  notes: getStr('notes'),
                })
              }}
            >
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <label className={labelClass}>اسم الطالب</label>
                  <input name="name" className={inputClass} placeholder="مثال: أم أحمد" />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>المنهج</label>
                  <input
                    name="curriculum"
                    required
                    className={inputClass}
                    placeholder="مثال: مصري"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <label className={labelClass}>رقم الهاتف</label>
                  <input
                    name="phone"
                    required
                    className={inputClass}
                    placeholder="05XXXXXXXX"
                    dir="ltr"
                    style={{ textAlign: 'right' }}
                  />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>المادة المهتم بها</label>
                  <input
                    name="subject"
                    required
                    className={inputClass}
                    placeholder="مثال: رياضيات"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className={labelClass}>الأولوية</label>
                <select name="priority" aria-label="الأولوية" className={inputClass}>
                  <option value="low">منخفضة</option>
                  <option value="medium">متوسطة</option>
                  <option value="high">عالية</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className={labelClass}>ملاحظات</label>
                <textarea
                  name="notes"
                  rows={2}
                  className={inputClass + ' resize-none'}
                  placeholder="اكتب أي تفاصيل..."
                />
              </div>
              <div className="flex gap-3 pb-4 pt-2">
                <PrimaryBtn
                  type="submit"
                  disabled={addMutation.isPending}
                  className="flex-1 py-3.5"
                >
                  {addMutation.isPending ? 'جاري الحفظ...' : 'إضافة العميل'}
                </PrimaryBtn>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 rounded-xl bg-surface py-3.5 text-[11px] font-bold text-muted transition-all hover:bg-hover active:scale-[0.98]"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
