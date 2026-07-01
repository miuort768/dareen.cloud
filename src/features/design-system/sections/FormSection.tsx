const INPUT_CLASS = "w-full rounded-md border bg-card text-main px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary";
const LABEL_CLASS = "block text-sm font-medium text-main mb-1";

export function FormSection() {
  return (
    <section>
      <h2 className="text-lg font-bold mb-4">النماذج — Forms</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className={LABEL_CLASS}>Input نص</label>
            <input type="text" placeholder="اكتب هنا..." className={INPUT_CLASS} />
          </div>
          <div>
            <label className={LABEL_CLASS}>Input مع خطأ</label>
            <input type="text" defaultValue="قيمة خاطئة" className={`${INPUT_CLASS} border-error focus:ring-error`} />
            <p className="text-xs text-error mt-1">هذا الحقل مطلوب</p>
          </div>
          <div>
            <label className={LABEL_CLASS}>Disabled</label>
            <input type="text" disabled value="معطل" className={`${INPUT_CLASS} opacity-50 cursor-not-allowed`} />
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className={LABEL_CLASS}>Select</label>
            <select className={INPUT_CLASS}>
              <option>اختر خياراً</option>
              <option>خيار 1</option>
              <option>خيار 2</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS}>Textarea</label>
            <textarea rows={3} placeholder="اكتب نصاً طويلاً..." className={INPUT_CLASS} />
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-main">
              <input type="checkbox" className="rounded border text-primary focus:ring-primary" /> Checkbox
            </label>
            <label className="flex items-center gap-2 text-sm text-main">
              <input type="radio" name="radio" className="border text-primary focus:ring-primary" /> Radio
            </label>
          </div>
        </div>
      </div>
    </section>
  );
}
