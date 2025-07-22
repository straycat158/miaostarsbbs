"use client"

import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Shield, Star, Crown, Award, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface VerificationBadgeProps {
  verificationType: string
  size?: "sm" | "md" | "lg"
  showText?: boolean
  className?: string
}

const verificationTypes = {
  official: {
    icon: Shield,
    label: "官方认证",
    description: "官方认证用户",
    color: "bg-blue-100 text-blue-800 border-blue-200",
  },
  expert: {
    icon: Star,
    label: "专家认证",
    description: "领域专家用户",
    color: "bg-purple-100 text-purple-800 border-purple-200",
  },
  vip: {
    icon: Crown,
    label: "VIP用户",
    description: "VIP会员用户",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  contributor: {
    icon: Award,
    label: "贡献者",
    description: "社区贡献者",
    color: "bg-green-100 text-green-800 border-green-200",
  },
  verified: {
    icon: CheckCircle,
    label: "已认证",
    description: "身份已验证用户",
    color: "bg-gray-100 text-gray-800 border-gray-200",
  },
}

export default function VerificationBadge({
  verificationType,
  size = "sm",
  showText = true,
  className,
}: VerificationBadgeProps) {
  const verification = verificationTypes[verificationType as keyof typeof verificationTypes]

  if (!verification) return null

  const Icon = verification.icon

  const sizeClasses = {
    sm: "text-xs px-1.5 py-0.5",
    md: "text-sm px-2 py-1",
    lg: "text-base px-3 py-1.5",
  }

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="secondary"
            className={cn(
              verification.color,
              sizeClasses[size],
              "font-medium inline-flex items-center gap-1 border",
              className,
            )}
          >
            <Icon className={iconSizes[size]} />
            {showText && <span>{verification.label}</span>}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{verification.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
