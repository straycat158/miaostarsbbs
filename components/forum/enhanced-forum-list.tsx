"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageSquare, Search, Plus, Eye, MessageCircle } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"
import VerificationBadge from "@/components/ui/verification-badge"

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

      // Get thread counts for each forum
      const forumsWithCounts = await Promise.all(
        (data || []).map(async (forum) => {
          const { count: threadCount } = await supabase
            .from("threads")
            .select("*", { count: "exact", head: true })
            .eq("forum_id", forum.id)

          return {
            ...forum,
            _count: {
              threads: threadCount || 0,
              replies: 0,
            },
          }
        }),
      )

      setForums(forumsWithCounts)
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
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
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
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="搜索版块..."
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
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="mr-2 h-4 w-4" />
            创建新版块
          </Button>
        </Link>
      </div>

      {/* Forums List */}
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
        <div className="space-y-4">
          {filteredAndSortedForums.map((forum) => (
            <Card key={forum.id} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Forum Icon */}
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="h-6 w-6 text-white" />
                  </div>

                  {/* Forum Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Link href={`/forums/${forum.slug}`}>
                        <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                          {forum.name}
                        </h3>
                      </Link>
                      {forum.category && (
                        <Badge variant="secondary" className="bg-gray-100 text-gray-700 text-xs">
                          {forum.category}
                        </Badge>
                      )}
                    </div>

                    <p className="text-gray-600 text-sm mb-2 line-clamp-1">{forum.description}</p>

                    {/* Creator and Stats */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={forum.creator?.avatar_url || "/placeholder.svg"} />
                          <AvatarFallback className="text-xs">
                            {forum.creator?.username?.charAt(0).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-500">{forum.creator?.username || "未知用户"}</span>
                          {forum.creator?.is_verified && forum.creator?.verification_type && (
                            <VerificationBadge
                              verificationType={forum.creator.verification_type}
                              size="sm"
                              showText={false}
                            />
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4" />
                          <span>{forum._count?.threads || 0}</span>
                        </div>
                        <Link href={`/forums/${forum.slug}`}>
                          <Button variant="outline" size="sm" className="border-gray-300 bg-transparent">
                            <Eye className="mr-1 h-3 w-3" />
                            查看
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
