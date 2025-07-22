"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, X, ChevronRight, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface NotificationBannerProps {
  type?: "info" | "warning" | "success"
  title: string
  message: string
  linkText?: string
  linkHref?: string
  onDismiss?: () => void
}

export default function NotificationBanner({
  type = "info",
  title,
  message,
  linkText,
  linkHref,
  onDismiss,
}: NotificationBannerProps) {
  const [isVisible, setIsVisible] = useState(true)

  const handleDismiss = () => {
    setIsVisible(false)
    if (onDismiss) onDismiss()
  }

  const getBgColor = () => {
    switch (type) {
      case "warning":
        return "bg-amber-50 border-amber-200"
      case "success":
        return "bg-green-50 border-green-200"
      case "info":
      default:
        return "bg-blue-50 border-blue-200"
    }
  }

  const getIconColor = () => {
    switch (type) {
      case "warning":
        return "text-amber-500"
      case "success":
        return "text-green-500"
      case "info":
      default:
        return "text-blue-500"
    }
  }

  const getIcon = () => {
    switch (type) {
      case "warning":
        return <AlertCircle className={`h-5 w-5 ${getIconColor()}`} />
      case "success":
        return <Bell className={`h-5 w-5 ${getIconColor()}`} />
      case "info":
      default:
        return <Bell className={`h-5 w-5 ${getIconColor()}`} />
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className={`border-t-4 border-b ${getBgColor()} py-3 px-4`}>
            <div className="container mx-auto">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {getIcon()}
                  <div>
                    <h3 className="font-medium text-gray-900">{title}</h3>
                    <p className="text-sm text-gray-600">{message}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {linkText && linkHref && (
                    <Button asChild variant="ghost" size="sm" className="hidden sm:flex">
                      <Link href={linkHref}>
                        <span>{linkText}</span>
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDismiss}
                    className="h-8 w-8 p-0 rounded-full"
                    aria-label="关闭通知"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
