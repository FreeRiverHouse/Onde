import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-onde-coral to-onde-coral-light text-white shadow-lg shadow-onde-coral/30 hover:shadow-xl hover:shadow-onde-coral/40 hover:scale-[1.02] active:scale-[0.98]",
        destructive:
          "bg-red-500 text-white shadow-lg shadow-red-500/30 hover:bg-red-600",
        outline:
          "border-2 border-onde-coral/30 bg-transparent text-onde-ocean hover:bg-onde-coral/10 hover:border-onde-coral",
        secondary:
          "bg-onde-cream text-onde-ocean shadow hover:bg-onde-cream/80",
        ghost:
          "text-onde-ocean hover:bg-onde-ocean/10",
        link:
          "text-onde-coral underline-offset-4 hover:underline",
        ocean:
          "bg-gradient-to-r from-onde-teal to-onde-blue text-white shadow-lg shadow-onde-teal/30 hover:shadow-xl hover:shadow-onde-teal/40 hover:scale-[1.02]",
        gold:
          "bg-gradient-to-r from-onde-gold to-onde-gold-light text-onde-ocean shadow-lg shadow-onde-gold/30 hover:shadow-xl hover:shadow-onde-gold/40 hover:scale-[1.02]",
        glass:
          "bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/20",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-14 rounded-2xl px-8 text-base",
        xl: "h-16 rounded-2xl px-10 text-lg",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
