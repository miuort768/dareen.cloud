import { Star, Quote } from 'lucide-react'
import { cn } from '../../../lib/utils'

interface Review {
  name: string
  role: string
  content: string
  avatar: string
}

interface TestimonialsProps {
  reviews: Review[]
  currentIndex: number
}

export const Testimonials = ({ reviews, currentIndex }: TestimonialsProps) => {
  return (
    <section className="relative overflow-hidden bg-surface py-4 transition-colors duration-500 dark:bg-background md:py-6">
      <div className="pointer-events-none absolute end-0 top-0 h-64 w-64 rounded-full bg-primary/5 blur-[100px] dark:bg-primary/[0.08]" />
      <div className="bg-success/5 pointer-events-none absolute bottom-0 start-0 h-48 w-48 rounded-full blur-[80px] dark:bg-primary/[0.05]" />

      <div className="container relative z-10 mx-auto px-4">
        <div className="mb-4 text-center md:mb-6">
          <h2 className="mb-3 font-heading text-3xl font-black leading-tight text-main dark:text-main md:text-4xl">
            <span className="text-primary dark:text-primary">آراء يعتز بها</span>
          </h2>
        </div>

        <div className="mx-auto max-w-6xl">
          <div className="lg:hidden">
            <div className="group relative">
              <div className="relative flex min-h-[140px] flex-col overflow-hidden rounded-2xl border border-border bg-surface p-4 shadow-sm dark:border-primary/30 dark:bg-card">
                <Quote
                  size={30}
                  className="absolute -end-1 -top-1 text-primary opacity-10 dark:text-primary"
                />

                <div className="relative z-10 flex h-full flex-grow flex-col">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="rounded-full bg-success-dark px-3 py-1 text-micro font-black text-on-success dark:bg-primary dark:text-on-primary">
                      {reviews[currentIndex].name}
                    </div>
                    <div className="flex gap-0.5 text-warning dark:text-primary">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={12} fill="currentColor" />
                      ))}
                    </div>
                  </div>

                  <div className="flex-grow">
                    <p className="text-xs font-medium italic leading-relaxed text-muted dark:text-muted">
                      "{reviews[currentIndex].content}"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="hidden grid-flow-row-dense gap-6 transition-all duration-1000 lg:grid lg:grid-cols-3">
            {reviews.map((review, index) => {
              const isFirstDual = index === currentIndex % reviews.length
              const isSecondDual = index === (currentIndex + 3) % reviews.length
              const isLarge = isFirstDual || isSecondDual

              return (
                <div
                  key={index}
                  className={cn(
                    'group relative flex flex-col rounded-2xl border shadow-sm transition-all duration-700 hover:-translate-y-1',
                    isLarge
                      ? 'border-success-dark bg-success-dark p-6 text-on-success dark:border-primary dark:bg-surface dark:text-main lg:col-span-2'
                      : 'border-border bg-surface p-5 text-muted dark:border-primary/20 dark:bg-card dark:text-muted',
                  )}
                >
                  <Quote
                    size={isLarge ? 60 : 30}
                    className={cn(
                      'absolute -end-2 -top-2 transition-all duration-700',
                      isLarge
                        ? 'dark:text-main/10 text-on-success opacity-10'
                        : 'dark:group-hover:text-accent/15 text-primary opacity-5 group-hover:text-primary/15 dark:text-primary',
                    )}
                  />

                  <div className="mb-4 flex items-center justify-between">
                    <div
                      className={cn(
                        'rounded-full px-4 py-1.5 text-xs font-black shadow-sm transition-transform group-hover:scale-105',
                        isLarge
                          ? 'bg-on-success text-success-dark dark:bg-background dark:text-primary'
                          : 'bg-success-dark text-on-success dark:bg-primary dark:text-on-primary',
                      )}
                    >
                      {review.name}
                    </div>
                    <div className="flex gap-0.5 text-warning dark:text-primary">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={12} fill="currentColor" />
                      ))}
                    </div>
                  </div>

                  <div>
                    <p
                      className={cn(
                        'font-medium italic leading-relaxed',
                        isLarge
                          ? 'text-sm text-on-success dark:text-main'
                          : 'text-xs text-muted dark:text-muted',
                      )}
                    >
                      "{review.content}"
                    </p>
                  </div>

                  {!isLarge && (
                    <div className="dark:group-hover:border-accent/30 absolute bottom-0 end-0 h-8 w-8 border-b-2 border-e-2 border-transparent transition-all duration-700 group-hover:border-primary/20"></div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
