import { useState } from 'react';
import { Dropdown } from '../../../shared/components/ui/Dropdown';
import { Edit, Trash, Share, Download } from 'lucide-react';

export function DropdownSection() {
    const [selected, setSelected] = useState('');

    return (
        <section>
            <h2 className="text-lg font-bold text-main mb-4">القوائم المنسدلة — Dropdowns</h2>

            <div className="flex items-start gap-8">
                <div>
                    <h3 className="text-xs font-bold text-muted mb-3 uppercase tracking-wider">عادي</h3>
                    <Dropdown
                        trigger={<span>إجراءات</span>}
                        items={[
                            { label: 'تعديل', value: 'edit', icon: <Edit size={14} /> },
                            { label: 'مشاركة', value: 'share', icon: <Share size={14} /> },
                            { label: 'تحميل', value: 'download', icon: <Download size={14} /> },
                            { label: 'حذف', value: 'delete', icon: <Trash size={14} />, danger: true },
                        ]}
                        onSelect={(v) => setSelected(v)}
                    />
                    {selected && (
                        <p className="text-micro text-muted mt-2">آخر اختيار: {selected}</p>
                    )}
                </div>

                <div>
                    <h3 className="text-xs font-bold text-muted mb-3 uppercase tracking-wider">مع عنصر معطل</h3>
                    <Dropdown
                        trigger={<span>قائمة</span>}
                        items={[
                            { label: 'عرض', value: 'view' },
                            { label: 'تعديل', value: 'edit' },
                            { label: 'أرشفة', value: 'archive', disabled: true },
                            { label: 'حذف', value: 'delete', danger: true },
                        ]}
                        onSelect={(v) => setSelected(v)}
                    />
                </div>
            </div>
        </section>
    );
}
