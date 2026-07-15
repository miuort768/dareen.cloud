import { Avatar } from '../../../shared/components/ui';
import { Users } from 'lucide-react';

export function AvatarSection() {
    return (
        <section>
            <h2 className="text-lg font-bold text-main mb-4">الصور الشخصية — Avatars</h2>

            <div className="space-y-6">
                <div>
                    <h3 className="text-xs font-bold text-muted mb-3 uppercase tracking-wider">Sizes</h3>
                    <div className="flex items-end gap-6">
                        <div className="flex flex-col items-center gap-2">
                            <Avatar size="sm" name="أحمد" />
                            <span className="text-micro text-dim">sm</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <Avatar size="md" name="سارة" />
                            <span className="text-micro text-dim">md</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <Avatar size="lg" name="محمد" />
                            <span className="text-micro text-dim">lg</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <Avatar size="xl" name="نورة" />
                            <span className="text-micro text-dim">xl</span>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-xs font-bold text-muted mb-3 uppercase tracking-wider">حالة الاتصال</h3>
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col items-center gap-2">
                            <Avatar size="md" name="عمر" indicator="online" />
                            <span className="text-micro text-dim">online</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <Avatar size="md" name="ليلى" indicator="offline" />
                            <span className="text-micro text-dim">offline</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <Avatar size="md" name="خالد" indicator="away" />
                            <span className="text-micro text-dim">away</span>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-xs font-bold text-muted mb-3 uppercase tracking-wider">مع صورة</h3>
                    <div className="flex items-center gap-6">
                        <Avatar size="md" src="https://i.pravatar.cc/80?img=1" alt="User" />
                        <Avatar size="md" src="https://i.pravatar.cc/80?img=5" alt="User" />
                        <Avatar size="md" src="https://i.pravatar.cc/80?img=10" alt="User" />
                    </div>
                </div>
            </div>
        </section>
    );
}
