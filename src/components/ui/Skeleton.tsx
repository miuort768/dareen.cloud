import { cn } from "../../lib/utils"

function Skeleton({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("animate-pulse rounded-md bg-surface/50 dark:bg-card/50", className)}
            {...props}
        />
    )
}

export { Skeleton }
