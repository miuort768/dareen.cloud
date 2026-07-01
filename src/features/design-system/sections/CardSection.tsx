export function CardSection() {
  return (
    <section>
      <h2 className="text-lg font-bold mb-4">البطاقات — Cards</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-card bg-card border p-4">
          <h3 className="font-bold text-main mb-1">بطاقة عادية</h3>
          <p className="text-sm text-muted">هذه بطاقة عادية ذات خلفية بيضاء وحدود رمادية.</p>
        </div>
        <div className="rounded-card bg-surface border p-4">
          <h3 className="font-bold text-main mb-1">بطاقة سطح</h3>
          <p className="text-sm text-muted">خلفية سطح مناسبة للأقسام الداخلية.</p>
        </div>
        <div className="rounded-card bg-primary text-on-primary p-4">
          <h3 className="font-bold mb-1">بطاقة مميزة</h3>
          <p className="text-sm opacity-90">بطاقة بخلفية Primary مع نص أبيض.</p>
        </div>
        <div className="rounded-card bg-gradient-to-br from-accent to-accent-hover text-white p-4">
          <h3 className="font-bold mb-1">Premium</h3>
          <p className="text-sm opacity-90">بطاقة ذهبية مخصصة للعناصر المميزة.</p>
        </div>
      </div>
    </section>
  );
}
