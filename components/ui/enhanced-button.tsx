"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md hover:scale-105 active:scale-95",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:shadow-md hover:scale-105",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground hover:border-primary hover:scale-105",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:shadow-sm hover:scale-105",
        ghost: "hover:bg-accent hover:text-accent-foreground hover:scale-105",
        link: "text-primary underline-offset-4 hover:underline hover:scale-105",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
      interactive: {
        true: "hover:shadow-lg active:shadow-sm transform-gpu",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      interactive: true,
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const EnhancedButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, interactive, asChild = false, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"

    const buttonContent = (
      <Comp
        className={cn(buttonVariants({ variant, size, interactive, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            {children}
          </div>
        ) : (
          children
        )}
      </Comp>
    )

    if (interactive && !asChild) {
      return (
        <motion.div
          whileHover={{ scale: disabled ? 1 : 1.05 }}
          whileTap={{ scale: disabled ? 1 : 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          {buttonContent}
        </motion.div>
      )
    }

    return buttonContent
  },
)
EnhancedButton.displayName = "EnhancedButton"

export { EnhancedButton, buttonVariants }
