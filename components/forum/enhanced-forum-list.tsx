"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageSquare, Search, Plus, Eye, MessageCircle, Users, Clock, TrendingUp } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"
import VerificationBadge from "@/components/ui/verification-badge"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"

interface Forum {
  id: string
  name: string
  description: string
  slug: string
  created_at: string
  created_by: string
  cover_image?: string
  category?: string
  creator?: {
    username: string
    avatar_url?: string
    is_verified?: boolean
    verification_type?: string
  }
  _count?: {
    threads: number
    replies: number
    members: number
  }
  latest_activity?: {
    thread_title?: string
    thread_id?: string
    author_username?: string
    created_at?: string
  }
}

export default function EnhancedForumList() {
  const [forums, setForums] = useState<Forum[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("newest")

  useEffect(() => {
    fetchForums()
  }, [])

  const fetchForums = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("forums")
        .select(`
          *,
          creator:profiles!forums_created_by_fkey(username, avatar_url, is_verified, verification_type)
        `)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Supabase error:", error)
        throw error
      }

      // Get detailed stats for each forum
      const forumsWithStats = await Promise.all(
        (data || []).map(async (forum) => {
          // Get thread count
          const { count: threadCount } = await supabase
            .from("threads")
            .select("*", { count: "exact", head: true })
            .eq("forum_id", forum.id)

          // Get total reply count for all threads in this forum
          const { data: threads } = await supabase.from("threads").select("id").eq("forum_id", forum.id)

          let totalReplies = 0
          if (threads && threads.length > 0) {
            const threadIds = threads.map((t) => t.id)
            const { count: replyCount } = await supabase
              .from("posts")
              .select("*", { count: "exact", head: true })
              .in("thread_id", threadIds)
            totalReplies = replyCount || 0
          }

          // Get latest activity
          const { data: latestThread } = await supabase
            .from("threads")
            .select(`
              id,
              title,
              created_at,
              profiles!threads_author_id_fkey(username)
            `)
            .eq("forum_id", forum.id)
            .order("created_at", { ascending: false })
            .limit(1)

          const latestActivity = latestThread?.[0]
            ? {
                thread_title: latestThread[0].title,
                thread_id: latestThread[0].id,
                author_username: latestThread[0].profiles?.username,
                created_at: latestThread[0].created_at,
              }
            : undefined

          return {
            ...forum,
            _count: {
              threads: threadCount || 0,
              replies: totalReplies,
              members: Math.floor(Math.random() * 100) + 10, // Mock member count
            },
            latest_activity: latestActivity,
          }
        }),
      )

      setForums(forumsWithStats)
    } catch (error: any) {
      console.error("Error fetching forums:", error)
      toast({
        title: "加载失败",
        description: "无法加载版块列表，请检查网络连接",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredAndSortedForums = forums
    .filter((forum) => {
      const matchesSearch =
        forum.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        forum.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === "all" || forum.category === selectedCategory
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case "most_active":
          return (b._count?.threads || 0) - (a._count?.threads || 0)
        case "name":
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="搜索版块名称或描述..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48 border-gray-300">
                <SelectValue placeholder="选择分类" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有分类</SelectItem>
                <SelectItem value="general">综合讨论</SelectItem>
                <SelectItem value="technology">科技前沿</SelectItem>
                <SelectItem value="gaming">游戏天地</SelectItem>
                <SelectItem value="lifestyle">生活方式</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48 border-gray-300">
                <SelectValue placeholder="排序方式" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">最新创建</SelectItem>
                <SelectItem value="oldest">最早创建</SelectItem>
                <SelectItem value="most_active">最活跃</SelectItem>
                <SelectItem value="name">按名称</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Create Forum Button */}
      <div className="flex justify-end">
        <Link href="/forums/create">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
            <Plus className="mr-2 h-4 w-4" />
            创建新版块
          </Button>
        </Link>
      </div>

      {/* Forums Grid */}
      {filteredAndSortedForums.length === 0 ? (
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-12 text-center">
            <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">暂无版块</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || selectedCategory !== "all" ? "没有找到匹配的版块" : "还没有创建任何版块"}
            </p>
            <Link href="/forums/create">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="mr-2 h-4 w-4" />
                创建第一个版块
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredAndSortedForums.map((forum) => (
            <Card
              key={forum.id}
              className="border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-blue-200"
            >
              <CardHeader className="pb-4">
                <div className="flex items-start gap-4">
                  {/* Forum Icon */}
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                    <MessageSquare className="h-8 w-8 text-white" />
                  </div>

                  {/* Forum Header Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Link href={`/forums/${forum.slug}`}>
                        <h3 className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors line-clamp-1">
                          {forum.name}
                        </h3>
                      </Link>
                      {forum.category && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs font-medium">
                          {forum.category}
                        </Badge>
                      )}
                    </div>

                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">{forum.description}</p>

                    {/* Creator Info */}
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={forum.creator?.avatar_url || "/placeholder.svg"} />
                        <AvatarFallback className="text-xs">
                          {forum.creator?.username?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-gray-600 font-medium">{forum.creator?.username || "未知用户"}</span>
                      {forum.creator?.is_verified && forum.creator?.verification_type && (
                        <VerificationBadge
                          verificationType={forum.creator.verification_type}
                          size="sm"
                          showText={false}
                        />
                      )}
                      <span className="text-xs text-gray-500">
                        创建于 {formatDistanceToNow(new Date(forum.created_at), { addSuffix: true, locale: zhCN })}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                      <MessageCircle className="h-4 w-4" />
                      <span className="font-semibold">{forum._count?.threads || 0}</span>
                    </div>
                    <span className="text-xs text-gray-500">主题</span>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                      <TrendingUp className="h-4 w-4" />
                      <span className="font-semibold">{forum._count?.replies || 0}</span>
                    </div>
                    <span className="text-xs text-gray-500">回复</span>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
                      <Users className="h-4 w-4" />
                      <span className="font-semibold">{forum._count?.members || 0}</span>
                    </div>
                    <span className="text-xs text-gray-500">成员</span>
                  </div>
                </div>

                {/* Latest Activity */}
                {forum.latest_activity && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-3 w-3 text-blue-600" />
                      <span className="text-xs text-blue-600 font-medium">最新活动</span>
                    </div>
                    <Link
                      href={`/forums/${forum.slug}/threads/${forum.latest_activity.thread_id}`}
                      className="text-sm text-gray-700 hover:text-blue-600 line-clamp-1 font-medium"
                    >
                      {forum.latest_activity.thread_title}
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">由 {forum.latest_activity.author_username} 发布</span>
                      <span className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(forum.latest_activity.created_at!), {
                          addSuffix: true,
                          locale: zhCN,
                        })}
                      </span>
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <Link href={`/forums/${forum.slug}`} className="block">
                  <Button
                    variant="outline"
                    className="w-full border-gray-300 bg-transparent hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    进入版块讨论
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
