import React, { useState } from 'react';
import { Breadcrumb } from '../../../shared/components/ui/Breadcrumb';
import { Tabs } from '../../../shared/components/ui/Tabs';
import { Home, Settings, Shield } from 'lucide-react';

export function NavigationSection() {
  const [activeTab, setActiveTab] = useState('students');

  return (
    <section>
      <h2 className="text-lg font-bold mb-4">التنقل — Navigation</h2>
      <div className="space-y-6">
        {/* Tabs */}
        <div>
          <h3 className="text-sm font-semibold text-muted mb-3">Tabs — Underline</h3>
          <Tabs
            tabs={[
              { label: 'لوحة القيادة', value: 'dashboard' },
              { label: 'الطلاب', value: 'students' },
              { label: 'المعلمين', value: 'teachers' },
              { label: 'الإعدادات', value: 'settings' },
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
            variant="underline"
          />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-muted mb-3">Tabs — Pills</h3>
          <Tabs
            tabs={[
              { label: 'لوحة القيادة', value: 'dashboard' },
              { label: 'الطلاب', value: 'students' },
              { label: 'المعلمين', value: 'teachers' },
              { label: 'الإعدادات', value: 'settings' },
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
            variant="pills"
          />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-muted mb-3">Tabs — Buttons</h3>
          <Tabs
            tabs={[
              { label: 'لوحة القيادة', value: 'dashboard' },
              { label: 'الطلاب', value: 'students' },
              { label: 'المعلمين', value: 'teachers' },
              { label: 'الإعدادات', value: 'settings', badge: 3 },
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
            variant="buttons"
          />
        </div>

        {/* Breadcrumb */}
        <div>
          <h3 className="text-sm font-semibold text-muted mb-3">Breadcrumb</h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-muted mb-2">مستويان</p>
              <Breadcrumb
                items={[
                  { label: 'الرئيسية', href: '/' },
                  { label: 'الإعدادات' },
                ]}
                separator="chevron"
              />
            </div>
            <div>
              <p className="text-xs text-muted mb-2">ثلاثة مستويات</p>
              <Breadcrumb
                items={[
                  { label: 'الرئيسية', href: '/' },
                  { label: 'الإعدادات', href: '/settings' },
                  { label: 'الصلاحيات' },
                ]}
                separator="chevron"
              />
            </div>
            <div>
              <p className="text-xs text-muted mb-2">مع أيقونات</p>
              <Breadcrumb
                items={[
                  { label: 'الرئيسية', href: '/', icon: <Home size={14} /> },
                  { label: 'الإعدادات', href: '/settings', icon: <Settings size={14} /> },
                  { label: 'الصلاحيات', icon: <Shield size={14} /> },
                ]}
                separator="chevron"
              />
            </div>
            <div>
              <p className="text-xs text-muted mb-2">فاصل Slash</p>
              <Breadcrumb
                items={[
                  { label: 'الرئيسية', href: '/' },
                  { label: 'الإعدادات', href: '/settings' },
                  { label: 'الصلاحيات' },
                ]}
                separator="slash"
              />
            </div>
          </div>
        </div>

        {/* Sidebar mock */}
        <div>
          <h3 className="text-sm font-semibold text-muted mb-3">Sidebar</h3>
          <div className="w-56 rounded-card border border-border overflow-hidden">
            {['لوحة القيادة', 'الطلاب', 'المعلمين', 'المالية', 'الإعدادات'].map((item, i) => (
              <div key={item} className={`px-4 py-2.5 text-sm flex items-center gap-3 transition-colors ${
                i === 1 ? 'bg-primary-soft text-primary font-semibold border-s-2 border-primary' : 'text-muted hover:bg-hover'
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
