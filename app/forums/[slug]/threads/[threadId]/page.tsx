import ThreadDetail from "@/components/thread/thread-detail"
import { Suspense } from "react"
import LoadingPage from "@/components/ui/loading-page"

interface ThreadPageProps {
  params: {
    slug: string
    threadId: string
  }
}

export default function ThreadPage({ params }: ThreadPageProps) {
  console.log("ThreadPage rendered with params:", params)

  return (
    <Suspense fallback={<LoadingPage title="主题加载中..." description="正在获取主题内容..." />}>
      <ThreadDetail threadId={params.threadId} />
    </Suspense>
  )
}
