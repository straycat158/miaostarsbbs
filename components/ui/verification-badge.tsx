"use client"

import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Shield, Star, Crown, Award, CheckCircle } from "lucide-react"

interface VerificationBadgeProps {
  verificationType: string
  size?: "sm" | "md" | "lg"
  showText?: boolean
  className?: string
}

const verificationTypes = {
  official: {
    name: "官方认证",
    description: "官方团队成员或合作伙伴",
    icon: Shield,
    color: "bg-blue-100 text-blue-800 border-blue-200",
    iconColor: "text-blue-600",
  },
  expert: {
    name: "专家认证",
    description: "在特定领域具有专业知识的用户",
    icon: Star,
    color: "bg-purple-100 text-purple-800 border-purple-200",
    iconColor: "text-purple-600",
  },
  vip: {
    name: "VIP用户",
    description: "高级会员或赞助者",
    icon: Crown,
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    iconColor: "text-yellow-600",
  },
  contributor: {
    name: "贡献者",
    description: "对社区做出重要贡献的用户",
    icon: Award,
    color: "bg-green-100 text-green-800 border-green-200",
    iconColor: "text-green-600",
  },
  verified: {
    name: "已认证",
    description: "身份已验证的用户",
    icon: CheckCircle,
    color: "bg-gray-100 text-gray-800 border-gray-200",
    iconColor: "text-gray-600",
  },
}

export default function VerificationBadge({
  verificationType,
  size = "md",
  showText = true,
  className = "",
}: VerificationBadgeProps) {
  const verification = verificationTypes[verificationType as keyof typeof verificationTypes]

  if (!verification) {
    return null
  }

  const Icon = verification.icon

  const sizeClasses = {
    sm: "text-xs px-1.5 py-0.5 gap-1",
    md: "text-sm px-2 py-1 gap-1.5",
    lg: "text-base px-3 py-1.5 gap-2",
  }

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  }

  const badge = (
    <Badge
      variant="outline"
      className={`
        ${verification.color}
        ${sizeClasses[size]}
        font-medium
        inline-flex items-center
        hover:shadow-sm transition-shadow
        border
        ${className}
      `}
    >
      <Icon className={`${iconSizes[size]} ${verification.iconColor}`} />
      {showText && <span className="ml-1">{verification.name}</span>}
    </Badge>
  )

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent>
          <div className="text-center">
            <div className="font-semibold">{verification.name}</div>
            <div className="text-sm text-gray-600">{verification.description}</div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
