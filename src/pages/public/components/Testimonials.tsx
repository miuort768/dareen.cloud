import { Star, Quote } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface Review {
    name: string;
    role: string;
    content: string;
    avatar: string;
}

interface TestimonialsProps {
    reviews: Review[];
    currentIndex: number;
}

export const Testimonials = ({ reviews, currentIndex }: TestimonialsProps) => {
    return (
        <section className="py-4 md:py-6 bg-surface dark:bg-background relative overflow-hidden transition-colors duration-500">

            <div className="absolute top-0 end-0 w-64 h-64 bg-primary/5 dark:bg-primary/[0.08] rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 start-0 w-48 h-48 bg-success/5 dark:bg-primary/[0.05] rounded-full blur-[80px] pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-4 md:mb-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-soft border border-primary/20 dark:bg-primary/20 dark:border-primary/40 rounded-full mb-3 mx-auto">
                        <Quote size={12} className="text-primary dark:text-primary" />
                        <span className="text-micro font-black text-primary dark:text-[#f3d368]">آراء يعتز بها</span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black text-main dark:text-main mb-3 font-heading leading-tight">
                        <span className="text-micro font-black text-primary dark:text-[#f3d368]">آراء يعتز بها</span>
                    </h2>
                </div>

                <div className="max-w-6xl mx-auto">
                    <div className="lg:hidden">
                        <div className="relative group">
                            <div className="p-4 bg-surface dark:bg-card border border-border dark:border-primary/30 shadow-sm rounded-2xl relative overflow-hidden flex flex-col min-h-[140px]">
                                <Quote size={30} className="text-primary dark:text-primary opacity-10 absolute -top-1 -end-1" />
                                
                                <div className="relative z-10 flex flex-col h-full flex-grow">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="bg-success-dark text-on-success px-3 py-1 rounded-full text-micro font-black dark:bg-primary dark:text-on-primary">
                                            {reviews[currentIndex].name}
                                        </div>
                                        <div className="flex gap-0.5 text-warning dark:text-primary">
                                            {[1, 2, 3, 4, 5].map(s => <Star key={s} size={12} fill="currentColor" />)}
                                        </div>
                                    </div>
                                    
                                    <div className="flex-grow">
                                        <p className="text-muted dark:text-muted text-xs leading-relaxed font-medium italic">
                                            "{reviews[currentIndex].content}"
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="hidden lg:grid lg:grid-cols-3 grid-flow-row-dense gap-6 transition-all duration-1000">
                        {reviews.map((review, index) => {
                            const isFirstDual = index === (currentIndex % reviews.length);
                            const isSecondDual = index === ((currentIndex + 3) % reviews.length);
                            const isLarge = isFirstDual || isSecondDual;
                            
                            return (
                                <div 
                                    key={index} 
                                    className={cn(
                                        'group relative border shadow-sm transition-all duration-700 hover:-translate-y-1 flex flex-col rounded-2xl',
                                        isLarge 
                                            ? 'lg:col-span-2 bg-success-dark border-success-dark text-on-success p-6 dark:bg-gradient-to-br dark:from-primary dark:to-warning dark:border-primary dark:text-on-primary' 
                                            : 'bg-surface border-border text-muted p-5 dark:bg-card dark:border-primary/20 dark:text-muted'
                                    )}
                                >
                                    <Quote size={isLarge ? 60 : 30} className={cn(
                                        'absolute -top-2 -end-2 transition-all duration-700',
                                        isLarge ? 'text-on-success opacity-10 dark:text-on-primary/10' : 'text-primary dark:text-primary opacity-5 group-hover:text-primary/15 dark:group-hover:text-accent/15'
                                    )} />
                                    
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={cn(
                                            'px-4 py-1.5 rounded-full text-xs font-black shadow-sm transition-transform group-hover:scale-105',
                                            isLarge ? 'bg-on-success text-success-dark dark:bg-background dark:text-primary' : 'bg-success-dark text-on-success dark:bg-primary dark:text-on-primary'
                                        )}>
                                            {review.name}
                                        </div>
                                        <div className="flex gap-0.5 text-warning dark:text-primary">
                                            {[1, 2, 3, 4, 5].map(s => <Star key={s} size={12} fill="currentColor" />)}
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <p className={cn(
                                            'leading-relaxed font-medium italic',
                                            isLarge ? 'text-sm text-on-success dark:text-on-primary' : 'text-xs text-muted dark:text-muted'
                                        )}>
                                            "{review.content}"
                                        </p>
                                    </div>

                                    {!isLarge && <div className="absolute bottom-0 end-0 w-8 h-8 border-b-2 border-e-2 border-transparent group-hover:border-primary/20 dark:group-hover:border-accent/30 transition-all duration-700"></div>}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
};