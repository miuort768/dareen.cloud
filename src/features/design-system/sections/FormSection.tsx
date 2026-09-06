const INPUT_CLASS =
  'w-full rounded-md border bg-card text-main px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary'
const LABEL_CLASS = 'block text-sm font-medium text-main mb-1'

export function FormSection() {
  return (
    <section>
      <h2 className="mb-4 text-lg font-bold">النماذج — Forms</h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label htmlFor="input-text" className={LABEL_CLASS}>
              Input نص
            </label>
            <input id="input-text" type="text" placeholder="اكتب هنا..." className={INPUT_CLASS} />
          </div>
          <div>
            <label htmlFor="input-error" className={LABEL_CLASS}>
              Input مع خطأ
            </label>
            <input
              id="input-error"
              type="text"
              defaultValue="قيمة خاطئة"
              className={`${INPUT_CLASS} border-error focus:ring-error`}
            />
            <p className="mt-1 text-xs text-error">هذا الحقل مطلوب</p>
          </div>
          <div>
            <label htmlFor="input-disabled" className={LABEL_CLASS}>
              Disabled
            </label>
            <input
              id="input-disabled"
              type="text"
              disabled
              value="معطل"
              className={`${INPUT_CLASS} cursor-not-allowed opacity-50`}
            />
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label htmlFor="input-select" className={LABEL_CLASS}>
              Select
            </label>
            <select id="input-select" className={INPUT_CLASS}>
              <option>اختر خياراً</option>
              <option>خيار 1</option>
              <option>خيار 2</option>
            </select>
          </div>
          <div>
            <label htmlFor="input-textarea" className={LABEL_CLASS}>
              Textarea
            </label>
            <textarea
              id="input-textarea"
              rows={3}
              placeholder="اكتب نصاً طويلاً..."
              className={INPUT_CLASS}
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-main">
              <input type="checkbox" className="rounded border text-primary focus:ring-primary" />{' '}
              Checkbox
            </label>
            <label className="flex items-center gap-2 text-sm text-main">
              <input type="radio" name="radio" className="border text-primary focus:ring-primary" />{' '}
              Radio
            </label>
          </div>
        </div>
      </div>
    </section>
  )
}
