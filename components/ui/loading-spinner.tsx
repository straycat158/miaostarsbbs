"use client"

import { motion } from "framer-motion"
import { Loader2, MessageSquare } from "lucide-react"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  text?: string
  variant?: "spinner" | "dots" | "pulse" | "forum"
}

export default function LoadingSpinner({ size = "md", text, variant = "spinner" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  }

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  }

  if (variant === "dots") {
    return (
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="flex space-x-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className={`bg-primary rounded-full ${size === "sm" ? "w-2 h-2" : size === "md" ? "w-3 h-3" : "w-4 h-4"}`}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 1,
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
        {text && <p className={`text-gray-600 ${textSizeClasses[size]}`}>{text}</p>}
      </div>
    )
  }

  if (variant === "pulse") {
    return (
      <div className="flex flex-col items-center justify-center space-y-4">
        <motion.div
          className={`bg-primary rounded-full ${sizeClasses[size]}`}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Number.POSITIVE_INFINITY,
          }}
        />
        {text && <p className={`text-gray-600 ${textSizeClasses[size]}`}>{text}</p>}
      </div>
    )
  }

  if (variant === "forum") {
    return (
      <div className="flex flex-col items-center justify-center space-y-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        >
          <MessageSquare className={`text-primary ${sizeClasses[size]}`} />
        </motion.div>
        {text && <p className={`text-gray-600 ${textSizeClasses[size]}`}>{text}</p>}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
      >
        <Loader2 className={`text-primary ${sizeClasses[size]}`} />
      </motion.div>
      {text && <p className={`text-gray-600 ${textSizeClasses[size]}`}>{text}</p>}
    </div>
  )
}
