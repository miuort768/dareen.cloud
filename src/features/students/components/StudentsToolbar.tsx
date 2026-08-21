import { useRef, useState } from 'react'
import { Upload, FileSpreadsheet, FileText, Trash2, Loader2 } from 'lucide-react'
import { api } from '../../../lib/api'
import { downloadExport } from '../../../lib/download'
import { useShowNotification } from '../../../context/AppContext'
import { useQueryClient } from '@tanstack/react-query'
import { cn } from '../../../lib/utils'

interface StudentsToolbarProps {
  filteredCount: number
  totalCount: number
  onDeleteAll: () => void
}

const parseCSV = (text: string): string[][] => {
  const rows: string[][] = []
  let field = ''
  let row: string[] = []
  let inQuotes = false
  const src = text.replace(/^\uFEFF/, '').replace(/\r/g, '')
  for (let i = 0; i < src.length; i++) {
    const ch = src[i]
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          field += '"'
          i++
        } else inQuotes = false
      } else field += ch
    } else if (ch === '"') {
      inQuotes = true
    } else if (ch === ',' || ch === ';') {
      row.push(field.trim())
      field = ''
    } else if (ch === '\n') {
      row.push(field.trim())
      field = ''
      rows.push(row)
      row = []
    } else {
      field += ch
    }
  }
  if (field.length || row.length) {
    row.push(field.trim())
    rows.push(row)
  }
  return rows.filter((r) => r.some((c) => c !== ''))
}

export const StudentsToolbar = ({
  filteredCount,
  totalCount,
  onDeleteAll,
}: StudentsToolbarProps) => {
  const queryClient = useQueryClient()
  const showNotification = useShowNotification()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importing, setImporting] = useState(false)

  const btnClass =
    'h-8 px-3 flex items-center gap-1.5 text-[10px] font-bold rounded-xl active:scale-[0.97] transition-all'

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!/\.(csv|txt|xlsx|xls|json)$/i.test(file.name)) {
      showNotification('يرجى رفع ملف Excel أو CSV أو TXT أو JSON', 'error')
      e.target.value = ''
      return
    }
    setImporting(true)
    try {
      const text = await file.text()
      const rows = parseCSV(text)
      if (rows.length === 0) {
        showNotification('الملف فارغ', 'error')
        return
      }
      const headers = rows[0].map((h) => h.toLowerCase())
      const hasHeader = headers.some((h) =>
        [
          'name',
          'الاسم',
          'اسم الطالب',
          'grade',
          'المرحلة',
          'الصف',
          'parentphone',
          'parent_phone',
          'هاتف',
          'جوال',
        ].includes(h),
      )
      const dataRows = hasHeader ? rows.slice(1) : rows

      const idx = (keys: string[]) => headers.findIndex((h) => keys.includes(h))
      let added = 0
      let skipped = 0

      for (const row of dataRows) {
        let name = ''
        let grade = ''
        let parentPhone = ''
        if (hasHeader) {
          const ni = idx(['name', 'الاسم', 'اسم الطالب', 'الطالب'])
          const gi = idx(['grade', 'المرحلة', 'الصف', 'مرحلة'])
          const pi = idx([
            'parentphone',
            'parent_phone',
            'هاتف ولي الامر',
            'هاتف ولي الأمر',
            'جوال ولي الامر',
            'هاتف',
            'جوال',
          ])
          name = ni >= 0 ? row[ni] || '' : ''
          grade = gi >= 0 ? row[gi] || '' : ''
          parentPhone = pi >= 0 ? row[pi] || '' : ''
        } else {
          name = row[0] || ''
          grade = row[1] || ''
          parentPhone = row[2] || ''
        }
        if (!name) {
          skipped++
          continue
        }
        try {
          await api.post('/students', {
            name: name.trim(),
            grade: grade.trim(),
            parentPhone: parentPhone.trim(),
          })
          added++
        } catch {
          skipped++
        }
      }

      queryClient.invalidateQueries({ queryKey: ['students'] })
      if (added === 0) {
        showNotification('لم يتم استيراد أي طالب (تحقق من صيغة الملف)', 'error')
      } else {
        showNotification(
          `تم استيراد ${added} طالب بنجاح${skipped ? `، وتجاوز ${skipped}` : ''}`,
          'success',
        )
      }
    } catch {
      showNotification('فشل استيراد الملف', 'error')
    } finally {
      setImporting(false)
      e.target.value = ''
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-3 shadow-elevation-1">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-[10px] font-bold text-muted">
          {filteredCount} / {totalCount} طالب
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          <input
            type="file"
            ref={fileInputRef}
            accept=".xlsx,.xls,.csv,.txt,.json"
            className="hidden"
            onChange={handleImport}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className={cn(
              btnClass,
              'border border-border bg-surface text-main hover:bg-hover',
              importing && 'opacity-60',
            )}
          >
            {importing ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}{' '}
            <span className="hidden sm:inline">استيراد</span>
          </button>
          <button
            onClick={() =>
              downloadExport('students', 'xlsx')
                .then(() => showNotification('تم تصدير Excel', 'success'))
                .catch((e) => showNotification(e.message, 'error'))
            }
            className={cn(btnClass, 'bg-success text-on-success shadow-sm hover:bg-success-hover')}
          >
            <FileSpreadsheet size={12} /> Excel
          </button>
          <button
            onClick={() =>
              downloadExport('students', 'pdf')
                .then(() => showNotification('تم تصدير PDF', 'success'))
                .catch((e) => showNotification(e.message, 'error'))
            }
            className={cn(btnClass, 'bg-error text-on-error shadow-sm hover:bg-error-hover')}
          >
            <FileText size={12} /> PDF
          </button>
          <button
            onClick={onDeleteAll}
            className={cn(
              btnClass,
              'border-error-soft hover:bg-error-light border bg-error-soft text-error',
            )}
          >
            <Trash2 size={12} />
            <span className="hidden sm:inline">حذف الكل</span>
          </button>
        </div>
      </div>
    </div>
  )
}
