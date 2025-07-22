"use client"

import { usePathname } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  MessageSquare,
  Users,
  TrendingUp,
  Plus,
  Search,
  Filter,
  BookOpen,
  Download,
  HelpCircle,
  Mail,
  FileText,
  Activity,
  Clock,
} from "lucide-react"
import Link from "next/link"

export default function EnhancedSidebar() {
  const pathname = usePathname()
  const isForumsPage = pathname?.startsWith("/forums")
  const isResourcesPage = pathname?.startsWith("/resources")

  const forumStats = {
    totalForums: 12,
    activeUsers: 1247,
  }

  const resourceStats = {
    totalResources: 8543,
    downloads: 125678,
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200 p-6 space-y-6 overflow-y-auto">
      {/* Quick Actions */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            快速操作
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isForumsPage && (
            <>
              <Link href="/forums/create">
                <Button className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="mr-2 h-4 w-4" />
                  创建新版块
                </Button>
              </Link>
              <Button variant="outline" className="w-full justify-start border-gray-300 bg-transparent">
                <Search className="mr-2 h-4 w-4" />
                搜索版块
              </Button>
            </>
          )}
          {isResourcesPage && (
            <>
              <Button className="w-full justify-start bg-green-600 hover:bg-green-700 text-white">
                <Download className="mr-2 h-4 w-4" />
                上传资源
              </Button>
              <Button variant="outline" className="w-full justify-start border-gray-300 bg-transparent">
                <Filter className="mr-2 h-4 w-4" />
                高级筛选
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            统计信息
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isForumsPage && (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-gray-600">版块总数</span>
                </div>
                <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                  {forumStats.totalForums}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-600">活跃用户</span>
                </div>
                <Badge variant="secondary" className="bg-green-50 text-green-700">
                  {forumStats.activeUsers.toLocaleString()}
                </Badge>
              </div>
            </>
          )}
          {isResourcesPage && (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-purple-500" />
                  <span className="text-sm text-gray-600">资源总数</span>
                </div>
                <Badge variant="secondary" className="bg-purple-50 text-purple-700">
                  {resourceStats.totalResources.toLocaleString()}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Download className="h-4 w-4 text-orange-500" />
                  <span className="text-sm text-gray-600">总下载量</span>
                </div>
                <Badge variant="secondary" className="bg-orange-50 text-orange-700">
                  {resourceStats.downloads.toLocaleString()}
                </Badge>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-indigo-600" />
            最近活动
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isForumsPage && (
            <>
              <div className="text-sm text-gray-600">
                <span className="font-medium">张三</span> 在 <span className="text-blue-600">技术讨论</span>{" "}
                发布了新主题
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">李四</span> 回复了 <span className="text-blue-600">游戏攻略</span>{" "}
                中的讨论
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">王五</span> 创建了新版块 <span className="text-blue-600">学习交流</span>
              </div>
            </>
          )}
          {isResourcesPage && (
            <>
              <div className="text-sm text-gray-600">
                <span className="font-medium">开发者A</span> 上传了新的 <span className="text-green-600">模组资源</span>
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">用户B</span> 下载了 <span className="text-green-600">材质包合集</span>
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">管理员</span> 更新了 <span className="text-green-600">插件库</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Separator className="my-6" />

      {/* Help & Support */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-amber-600" />
            帮助与支持
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="ghost" className="w-full justify-start text-gray-600 hover:text-gray-900">
            <FileText className="mr-2 h-4 w-4" />
            使用指南
          </Button>
          <Button variant="ghost" className="w-full justify-start text-gray-600 hover:text-gray-900">
            <Mail className="mr-2 h-4 w-4" />
            联系客服
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
