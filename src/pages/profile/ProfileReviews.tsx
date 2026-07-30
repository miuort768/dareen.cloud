import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

interface Review {
    id: string;
    studentName: string;
    rating: number;
    text: string;
    date: string;
    avatar?: string;
}

interface ProfileReviewsProps {
    reviews: Review[];
    title?: string;
}

export const ProfileReviews = ({ reviews, title = 'تقييمات الطلاب' }: ProfileReviewsProps) => {
    if (reviews.length === 0) return null;

    const avgRating = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;

    return (
        <div className="bg-card border border-border rounded-2xl p-5 md:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-main">{title}</h3>
                <div className="flex items-center gap-1.5">
                    <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                size={12}
                                className={star <= Math.round(avgRating) ? 'text-warning fill-warning' : 'text-border'}
                            />
                        ))}
                    </div>
                    <span className="text-xs font-bold text-main tabular-nums">{avgRating.toFixed(1)}</span>
                </div>
            </div>
            <div className="space-y-3">
                {reviews.slice(0, 4).map((review, i) => (
                    <motion.div
                        key={review.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05, duration: 0.3 }}
                        className="p-4 bg-surface rounded-xl border border-border"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-9 h-9 rounded-xl bg-primary-soft flex items-center justify-center shrink-0">
                                <span className="text-sm font-bold text-primary">
                                    {(review.studentName || 'ط').charAt(0)}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-main">{review.studentName}</p>
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            size={9}
                                            className={star <= review.rating ? 'text-warning fill-warning' : 'text-border'}
                                        />
                                    ))}
                                </div>
                            </div>
                            <span className="text-[10px] font-medium text-muted">{review.date}</span>
                        </div>
                        <p className="text-[11px] font-medium text-muted leading-relaxed">"{review.text}"</p>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
