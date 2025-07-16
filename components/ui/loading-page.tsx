"use client"

import { motion } from "framer-motion"
import LoadingSpinner from "./loading-spinner"

interface LoadingPageProps {
  title?: string
  description?: string
  variant?: "spinner" | "dots" | "pulse" | "forum"
}

export default function LoadingPage({
  title = "加载中...",
  description = "请稍候，内容正在加载",
  variant = "forum",
}: LoadingPageProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-[60vh] flex items-center justify-center"
    >
      <div className="text-center space-y-6">
        <LoadingSpinner size="lg" variant={variant} />
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <p className="text-gray-600">{description}</p>
        </div>
      </div>
    </motion.div>
  )
}
