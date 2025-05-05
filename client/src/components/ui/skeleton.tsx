import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-primary/10 dark:bg-primary/5 skeleton-loading", className)}
      {...props}
    />
  )
}

export { Skeleton }