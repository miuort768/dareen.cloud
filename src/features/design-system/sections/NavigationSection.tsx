export function NavigationSection() {
  return (
    <section>
      <h2 className="text-lg font-bold mb-4">التنقل — Navigation</h2>
      <div className="space-y-6">
        {/* Tabs */}
        <div>
          <h3 className="text-sm font-semibold text-muted mb-3">Tabs</h3>
          <div className="flex gap-1 border-b">
            {['لوحة القيادة', 'الطلاب', 'المعلمين', 'الإعدادات'].map(tab => (
              <button key={tab} className={`px-4 py-2 text-sm border-b-2 transition-colors ${
                tab === 'الطلاب'
                  ? 'border-primary text-primary font-semibold'
                  : 'border-transparent text-muted hover:text-main'
              }`}>
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Breadcrumb */}
        <div>
          <h3 className="text-sm font-semibold text-muted mb-3">Breadcrumb</h3>
          <div className="flex items-center gap-2 text-sm text-muted">
            <span className="text-main">الرئيسية</span>
            <span>/</span>
            <span className="text-main">الإعدادات</span>
            <span>/</span>
            <span className="text-primary font-semibold">الصلاحيات</span>
          </div>
        </div>

        {/* Sidebar mock */}
        <div>
          <h3 className="text-sm font-semibold text-muted mb-3">Sidebar</h3>
          <div className="w-56 rounded-card border overflow-hidden">
            {['لوحة القيادة', 'الطلاب', 'المعلمين', 'المالية', 'الإعدادات'].map((item, i) => (
              <div key={item} className={`px-4 py-2.5 text-sm flex items-center gap-3 transition-colors ${
                i === 1 ? 'bg-primary-soft text-primary font-semibold border-r-2 border-primary' : 'text-muted hover:bg-hover'
              }`}>
                <div className={`w-2 h-2 rounded-full ${i === 1 ? 'bg-primary' : 'bg-border'}`} />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
