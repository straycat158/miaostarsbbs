"use client"

import { useParams } from "next/navigation"
import EnhancedThreadDetail from "@/components/thread/enhanced-thread-detail"

export default function ThreadDetailPage() {
  const params = useParams()

  const threadId = Array.isArray(params.threadId) ? params.threadId[0] : params.threadId
  const forumSlug = Array.isArray(params.slug) ? params.slug[0] : params.slug

  if (!threadId || !forumSlug) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-600">无效的页面参数</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <EnhancedThreadDetail threadId={threadId} forumSlug={forumSlug} />
    </div>
  )
}
