import { Star, Quote } from 'lucide-react';

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
        <section className="py-4 md:py-6 bg-[#F8F8FC] dark:bg-slate-950 relative overflow-hidden transition-colors duration-500">

            <div className="absolute top-0 left-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-4 md:mb-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-600/5 border border-indigo-500/10 rounded-full mb-3 mx-auto">
                        <Quote size={12} className="text-indigo-600" />
                        <span className="text-[9px] font-black  text-indigo-700 dark:text-white">آراء يعتز بها</span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black text-black dark:text-white mb-3 font-heading leading-tight">
                        ماذا يقول <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-indigo-500">أولياء الأمور؟</span>
                    </h2>
                </div>

                <div className="max-w-6xl mx-auto">
                    <div className="lg:hidden">
                        <div className="relative group">
                            <div className="p-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm rounded-2xl relative overflow-hidden flex flex-col min-h-[140px]">
                                <Quote size={30} className="text-indigo-500/10 absolute -top-1 -left-1" />
                                
                                <div className="relative z-10 flex flex-col h-full flex-grow">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="bg-[#064E3B] text-white px-3 py-1 rounded-full text-[10px] font-black">
                                            {reviews[currentIndex].name}
                                        </div>
                                        <div className="flex gap-0.5 text-amber-500">
                                            {[1, 2, 3, 4, 5].map(s => <Star key={s} size={12} fill="currentColor" />)}
                                        </div>
                                    </div>
                                    
                                    <div className="flex-grow">
                                        <p className="text-gray-600 dark:text-white text-xs leading-relaxed font-medium italic">
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
                                    className={`group relative border shadow-sm transition-all duration-700 hover:-translate-y-1 flex flex-col rounded-2xl
                                        ${isLarge 
                                            ? 'lg:col-span-2 bg-[#064E3B] border-[#064E3B] text-white p-6' 
                                            : 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 text-gray-600 p-5'
                                        }`}
                                >
                                    <Quote size={isLarge ? 60 : 30} className={`absolute -top-2 -left-2 transition-all duration-700 
                                        ${isLarge ? 'text-white/10' : 'text-indigo-500/5 group-hover:text-indigo-500/15'}`} 
                                    />
                                    
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`px-4 py-1.5 rounded-full text-[11px] font-black shadow-sm transition-transform group-hover:scale-105
                                            ${isLarge ? 'bg-white text-[#064E3B]' : 'bg-[#064E3B] text-white'}`}>
                                            {review.name}
                                        </div>
                                        <div className="flex gap-0.5 text-amber-500">
                                            {[1, 2, 3, 4, 5].map(s => <Star key={s} size={12} fill="currentColor" />)}
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <p className={`leading-relaxed font-medium italic ${isLarge ? 'text-sm text-white/90' : 'text-[11px] text-gray-600 dark:text-white'}`}>
                                            "{review.content}"
                                        </p>
                                    </div>

                                    {!isLarge && <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-transparent group-hover:border-indigo-600/20 transition-all duration-700"></div>}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
};
