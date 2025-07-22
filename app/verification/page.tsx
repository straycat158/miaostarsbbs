import type { Metadata } from "next"
import VerificationRequest from "@/components/verification/verification-request"

export const metadata: Metadata = {
  title: "身份认证 - 论坛",
  description: "申请官方身份认证，获得认证标志",
}

export default function VerificationPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">身份认证</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            通过身份认证，获得专属认证标志，提升您在社区中的可信度和影响力
          </p>
        </div>

        <VerificationRequest />
      </div>
    </div>
  )
}
