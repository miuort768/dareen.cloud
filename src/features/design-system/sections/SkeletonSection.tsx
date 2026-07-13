import { Skeleton, SkeletonText, SkeletonAvatar, SkeletonCard, SkeletonChart, SkeletonTable } from '../../../shared/components/ui/Skeleton';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="space-y-4">
        <h3 className="text-xs font-bold text-main tracking-wider">{title}</h3>
        <div className="bg-card border border-border rounded-card p-6">
            {children}
        </div>
    </div>
);

export const SkeletonSection = () => (
    <div className="space-y-10">
        <div className="mb-6">
            <h2 className="text-section font-bold text-main">Skeleton Loading</h2>
            <p className="text-sm text-muted mt-1">مكونات التحميل المؤقت مع تأثير النبض</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Section title="Skeleton — عنصر مفرد">
                <div className="space-y-4">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
            </Section>

            <Section title="SkeletonText — نص">
                <SkeletonText lines={4} />
            </Section>

            <Section title="SkeletonAvatar — صورة شخصية">
                <div className="flex items-center gap-4">
                    <SkeletonAvatar size="sm" />
                    <SkeletonAvatar size="md" />
                    <SkeletonAvatar size="lg" />
                </div>
            </Section>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Section title="SkeletonCard — بطاقة">
                <SkeletonCard />
            </Section>

            <Section title="SkeletonChart — رسم بياني">
                <SkeletonChart chartType="bar" className="h-40" />
            </Section>

            <Section title="SkeletonTable — جدول">
                <SkeletonTable rows={4} cols={4} />
            </Section>
        </div>
    </div>
);
