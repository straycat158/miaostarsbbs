"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Pin, Lock, MessageSquare, Clock, Search, Filter, MessageCircle, Eye } from "lucide-react"
import { supabase } from "@/lib/supabase"
import VerificationBadge from "@/components/ui/verification-badge"

interface Thread {
  id: string
  title: string
  content: string
  is_pinned: boolean
  is_locked: boolean
  created_at: string
  created_by: string
  view_count: number
  profiles: {
    username: string
    avatar_url: string
    full_name: string
    is_verified?: boolean
    verification_type?: string
  }
  posts: { count: number }[]
}

interface EnhancedThreadListProps {
  forumSlug: string
  forumName: string
}

type SortBy = "latest" | "popular" | "oldest" | "most_replies"

export default function EnhancedThreadList({ forumSlug, forumName }: EnhancedThreadListProps) {
  const [threads, setThreads] = useState<Thread[]>([])
  const [filteredThreads, setFilteredThreads] = useState<Thread[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<SortBy>("latest")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  useEffect(() => {
    fetchThreads()
  }, [forumSlug])

  useEffect(() => {
    filterAndSortThreads()
  }, [threads, searchQuery, selectedCategory, sortBy])

  const fetchThreads = async () => {
    try {
      console.log("Fetching threads for forum:", forumSlug)
      const { data: forum, error: forumError } = await supabase
        .from("forums")
        .select("id")
        .eq("slug", forumSlug)
        .maybeSingle()

      if (forumError) {
        console.error("Error fetching forum in EnhancedThreadList:", forumError)
        setThreads([])
        return
      }

      if (!forum) {
        console.warn(`Forum with slug "${forumSlug}" not found.`)
        setThreads([])
        return
      }

      const { data: threads, error } = await supabase
        .from("threads")
        .select(`
            *,
            profiles(username, avatar_url, full_name, is_verified, verification_type),
            posts(count)
          `)
        .eq("forum_id", forum.id)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false })

      console.log("Threads query result:", { threads, error })

      if (error) {
        console.error("Error fetching threads:", error)
      } else {
        // Get reply counts for each thread
        const threadsWithCounts = await Promise.all(
          (threads || []).map(async (thread) => {
            const { count: replyCount } = await supabase
              .from("posts")
              .select("*", { count: "exact", head: true })
              .eq("thread_id", thread.id)

            return {
              ...thread,
              posts: [{ count: replyCount || 0 }],
            }
          }),
        )

        setThreads(threadsWithCounts)
      }
    } catch (error) {
      console.error("Unexpected error fetching threads:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortThreads = () => {
    const filtered = threads.filter((thread) => {
      const matchesSearch =
        thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        thread.content.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory =
        selectedCategory === "all" ||
        (selectedCategory === "pinned" && thread.is_pinned) ||
        (selectedCategory === "locked" && thread.is_locked)

      return matchesSearch && matchesCategory
    })

    filtered.sort((a, b) => {
      // Always keep pinned threads at the top
      if (a.is_pinned && !b.is_pinned) return -1
      if (!a.is_pinned && b.is_pinned) return 1

      switch (sortBy) {
        case "popular":
          return (b.view_count || 0) - (a.view_count || 0)
        case "most_replies":
          return (b.posts?.[0]?.count || 0) - (a.posts?.[0]?.count || 0)
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case "latest":
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })

    setFilteredThreads(filtered)
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
      return `${diffInMinutes}分钟`
    } else if (diffInHours < 24) {
      return `${diffInHours}小时`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays}天`
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
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
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2 min-w-0 flex-1">
            <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
              <Link href="/forums" className="hover:text-blue-600 transition-colors">
                版块
              </Link>
              <span>/</span>
              <span className="text-gray-900">{forumName}</span>
            </nav>
            <h1 className="text-3xl font-bold text-gray-900">{forumName}</h1>
          </div>
          <Button asChild className="shadow-lg bg-blue-600 hover:bg-blue-700">
            <Link href={`/forums/${forumSlug}/create-thread`}>
              <Plus className="mr-2 h-4 w-4" />
              发布主题
            </Link>
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="搜索主题..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-40 border-gray-300">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部主题</SelectItem>
              <SelectItem value="pinned">置顶主题</SelectItem>
              <SelectItem value="locked">已锁定</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortBy)}>
            <SelectTrigger className="w-full sm:w-36 border-gray-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">最新发布</SelectItem>
              <SelectItem value="popular">最多浏览</SelectItem>
              <SelectItem value="most_replies">最多回复</SelectItem>
              <SelectItem value="oldest">最早发布</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Threads List */}
      {filteredThreads.length === 0 ? (
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-12 text-center">
            <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">暂无主题</h3>
            <p className="text-gray-500 mb-6">
              {searchQuery ? "没有找到匹配的主题" : `${forumName} 版块还没有任何主题`}
            </p>
            <Link href={`/forums/${forumSlug}/create-thread`}>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="mr-2 h-4 w-4" />
                发布第一个主题
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredThreads.map((thread) => (
            <Card key={thread.id} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {/* Author Avatar */}
                  <div className="flex flex-col items-center flex-shrink-0">
                    <Avatar className="h-10 w-10 mb-1">
                      <AvatarImage src={thread.profiles?.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback>{thread.profiles?.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-center text-center">
                      <span className="text-xs text-gray-600 font-medium max-w-[60px] truncate">
                        {thread.profiles?.username || "未知"}
                      </span>
                      {thread.profiles?.is_verified && thread.profiles?.verification_type && (
                        <VerificationBadge
                          verificationType={thread.profiles.verification_type}
                          size="sm"
                          showText={false}
                        />
                      )}
                    </div>
                  </div>

                  {/* Thread Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {thread.is_pinned && (
                        <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                          <Pin className="mr-1 h-3 w-3" />
                          置顶
                        </Badge>
                      )}
                      {thread.is_locked && (
                        <Badge variant="outline" className="text-xs px-1.5 py-0.5 border-orange-300 text-orange-700">
                          <Lock className="mr-1 h-3 w-3" />
                          锁定
                        </Badge>
                      )}
                    </div>

                    <Link href={`/forums/${forumSlug}/threads/${thread.id}`}>
                      <h3 className="text-base font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-1 mb-2">
                        {thread.title}
                      </h3>
                    </Link>

                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                      {thread.content.replace(/<[^>]*>/g, "").substring(0, 120)}
                      {thread.content.length > 120 && "..."}
                    </p>

                    {/* Simplified Stats */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-3.5 w-3.5" />
                          <span className="font-medium">{thread.posts?.[0]?.count || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-3.5 w-3.5" />
                          <span className="font-medium">{thread.view_count || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          <span className="font-medium">{formatTimeAgo(thread.created_at)}</span>
                        </div>
                      </div>

                      <Link href={`/forums/${forumSlug}/threads/${thread.id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs px-2 py-1 h-7 text-blue-600 hover:bg-blue-50"
                        >
                          查看
                        </Button>
                      </Link>
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
