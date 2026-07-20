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
        <section className="py-4 md:py-6 bg-surface dark:bg-card relative overflow-hidden transition-colors duration-500">

            <div className="absolute top-0 end-0 w-64 h-64 bg-accent/5 dark:bg-accent/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 start-0 w-48 h-48 bg-primary/5 dark:bg-primary/10 rounded-full blur-[80px] pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-4 md:mb-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-soft border border-primary/20 rounded-full mb-3 mx-auto">
                        <Quote size={12} className="text-primary" />
                        <span className="text-micro font-black text-primary">آراء يعتز بها</span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black text-main mb-3 font-heading leading-tight">
                        ماذا يقول <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary">أولياء الأمور؟</span>
                    </h2>
                </div>

                <div className="max-w-6xl mx-auto">
                    <div className="lg:hidden">
                        <div className="relative group">
                            <div className="p-4 bg-surface border border-border shadow-sm rounded-2xl relative overflow-hidden flex flex-col min-h-[140px]">
                                <Quote size={30} className="text-primary opacity-10 absolute -top-1 -end-1" />
                                
                                <div className="relative z-10 flex flex-col h-full flex-grow">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="bg-success-dark text-on-success px-3 py-1 rounded-full text-micro font-black">
                                            {reviews[currentIndex].name}
                                        </div>
                                        <div className="flex gap-0.5 text-warning">
                                            {[1, 2, 3, 4, 5].map(s => <Star key={s} size={12} fill="currentColor" />)}
                                        </div>
                                    </div>
                                    
                                    <div className="flex-grow">
                                        <p className="text-muted text-xs leading-relaxed font-medium italic">
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
                                            ? 'lg:col-span-2 bg-success-dark border-success-dark text-on-success p-6' 
                                            : 'bg-surface border-border text-muted p-5'
                                    )}
                                >
                                    <Quote size={isLarge ? 60 : 30} className={cn(
                                        'absolute -top-2 -end-2 transition-all duration-700',
                                        isLarge ? 'text-on-success opacity-10' : 'text-primary opacity-5 group-hover:text-primary/15'
                                    )} />
                                    
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={cn(
                                            'px-4 py-1.5 rounded-full text-xs font-black shadow-sm transition-transform group-hover:scale-105',
                                            isLarge ? 'bg-on-success text-success-dark' : 'bg-success-dark text-on-success'
                                        )}>
                                            {review.name}
                                        </div>
                                        <div className="flex gap-0.5 text-warning">
                                            {[1, 2, 3, 4, 5].map(s => <Star key={s} size={12} fill="currentColor" />)}
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <p className={cn(
                                            'leading-relaxed font-medium italic',
                                            isLarge ? 'text-sm text-on-success' : 'text-xs text-muted'
                                        )}>
                                            "{review.content}"
                                        </p>
                                    </div>

                                    {!isLarge && <div className="absolute bottom-0 end-0 w-8 h-8 border-b-2 border-e-2 border-transparent group-hover:border-primary/20 transition-all duration-700"></div>}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
};
