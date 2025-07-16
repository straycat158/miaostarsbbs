import LoadingPage from "@/components/ui/loading-page"

export default function ThreadLoading() {
  return <LoadingPage title="主题加载中..." description="正在获取主题详情和回复..." variant="forum" />
}
