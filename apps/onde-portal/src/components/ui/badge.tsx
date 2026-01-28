import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-all duration-300",
  {
    variants: {
      variant: {
        default:
          "bg-onde-coral/10 text-onde-coral border border-onde-coral/20",
        secondary:
          "bg-onde-ocean/10 text-onde-ocean border border-onde-ocean/20",
        success:
          "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20",
        warning:
          "bg-amber-500/10 text-amber-600 border border-amber-500/20",
        destructive:
          "bg-red-500/10 text-red-600 border border-red-500/20",
        ocean:
          "bg-onde-teal/10 text-onde-teal border border-onde-teal/20",
        gold:
          "bg-onde-gold/10 text-onde-gold border border-onde-gold/20",
        outline:
          "border border-onde-ocean/30 text-onde-ocean bg-transparent",
        glass:
          "bg-white/20 backdrop-blur-sm text-white border border-white/20",
        glow:
          "bg-onde-coral/20 text-onde-coral border border-onde-coral/30 shadow-glow-coral",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
