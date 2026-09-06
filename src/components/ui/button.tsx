/* eslint-disable react-refresh/only-export-components -- constants/variants exported beside the component (intentional UI pattern) */
import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap select-none transition-all duration-normal ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 disabled:scale-100 [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-on-primary shadow-elevation-1 border border-primary/80 hover:bg-primary-hover hover:shadow-elevation-2 hover:border-primary-hover active:bg-primary-active active:shadow-elevation-1 active:scale-[0.98]',
        destructive:
          'bg-error text-on-error shadow-elevation-1 border border-error hover:bg-error-hover hover:shadow-elevation-2 hover:border-error-hover active:bg-error-active active:shadow-elevation-1 active:scale-[0.98] focus-visible:ring-error',
        outline:
          'bg-transparent text-primary border-2 border-primary/30 hover:bg-primary-soft hover:border-primary/60 hover:shadow-elevation-1 active:bg-primary-soft active:border-primary active:scale-[0.98]',
        secondary:
          'bg-card text-main border border-border shadow-elevation-1 hover:bg-hover hover:shadow-elevation-2 hover:border-border-strong active:bg-hover active:shadow-elevation-1 active:scale-[0.98]',
        ghost:
          'bg-transparent text-muted border border-transparent hover:bg-hover hover:text-main hover:border-border active:bg-hover active:scale-[0.98]',
        link: 'text-primary underline-offset-4 hover:underline active:underline',
        success:
          'bg-success text-on-success shadow-elevation-1 border border-success hover:brightness-110 hover:shadow-elevation-2 active:brightness-95 active:shadow-elevation-1 active:scale-[0.98] focus-visible:ring-success',
        warning:
          'bg-warning text-on-warning shadow-elevation-1 border border-warning hover:brightness-110 hover:shadow-elevation-2 active:brightness-95 active:shadow-elevation-1 active:scale-[0.98] focus-visible:ring-warning',
      },
      size: {
        default: 'h-10 px-5 text-sm rounded-lg font-semibold',
        sm: 'h-8 px-3.5 text-xs rounded-lg font-semibold',
        lg: 'h-12 px-7 text-base rounded-xl font-semibold',
        icon: 'h-10 w-10 rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
