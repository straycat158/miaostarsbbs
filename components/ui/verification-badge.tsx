import { Shield, Star, Award, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface VerificationBadgeProps {
  verificationType: string
  size?: "sm" | "md" | "lg"
  showLabel?: boolean
}

const verificationConfig = {
  official: {
    label: "官方认证",
    icon: Shield,
    color: "bg-blue-600 text-white",
    description: "官方机构认证用户",
  },
  expert: {
    label: "专家认证",
    icon: Star,
    color: "bg-purple-600 text-white",
    description: "行业专家认证用户",
  },
  contributor: {
    label: "贡献者",
    icon: Award,
    color: "bg-green-600 text-white",
    description: "社区贡献者认证用户",
  },
  partner: {
    label: "合作伙伴",
    icon: Users,
    color: "bg-orange-600 text-white",
    description: "合作伙伴认证用户",
  },
}

export default function VerificationBadge({
  verificationType,
  size = "md",
  showLabel = false,
}: VerificationBadgeProps) {
  const config = verificationConfig[verificationType as keyof typeof verificationConfig]

  if (!config) return null

  const Icon = config.icon

  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  }

  const badgeContent = (
    <Badge className={`${config.color} flex items-center gap-1 px-2 py-1`}>
      <Icon className={sizeClasses[size]} />
      {showLabel && <span className="text-xs">{config.label}</span>}
    </Badge>
  )

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{badgeContent}</TooltipTrigger>
        <TooltipContent>
          <p>{config.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
