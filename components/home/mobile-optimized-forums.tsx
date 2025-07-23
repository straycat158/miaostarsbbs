"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageSquare, Users, Clock, ArrowRight, Filter, ChevronDown, Search, Hash } from "lucide-react"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"
import VerificationBadge from "@/components/ui/verification-badge"

interface Forum {
  id: string
  name: string
  description: string
  slug: string
  thread_count: number
  post_count: number
  latest_activity?: string
  category?: string
  latest_thread?: {
    title: string
    created_at: string
    profiles: {
      username: string
      avatar_url: string
      is_verified: boolean
      verification_type: string
    }
  }
}

export default function MobileOptimizedForums() {
  const [forums, setForums] = useState<Forum[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [expandedForum, setExpandedForum] = useState<string | null>(null)

  useEffect(() => {
    fetchForums()
  }, [])

  const fetchForums = async () => {
    try {
      const { data: forumsData, error } = await supabase
        .from("forums")
        .select(`
          id,
          name,
          description,
          slug,
          category,
          threads(
            id,
            title,
            created_at,
            profiles(username, avatar_url, is_verified, verification_type),
            posts(count)
          )
        `)
        .limit(12)

      if (error) {
        console.error("Error fetching forums:", error)
        return
      }

      // Process the data to get stats and latest thread
      const processedForums = (forumsData || []).map((forum: any) => {
        const threads = forum.threads || []
        const threadCount = threads.length
        const postCount = threads.reduce((total: number, thread: any) => {
          return total + (thread.posts?.[0]?.count || 0)
        }, 0)

        // Get latest thread
        const latestThread =
          threads.length > 0
            ? threads.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
            : null

        return {
          id: forum.id,
          name: forum.name,
          description: forum.description,
          slug: forum.slug,
          category: forum.category || "general",
          thread_count: threadCount,
          post_count: postCount,
          latest_activity: latestThread?.created_at,
          latest_thread: latestThread
            ? {
                title: latestThread.title,
                created_at: latestThread.created_at,
                profiles: latestThread.profiles,
              }
            : null,
        }
      })

      // Sort by activity
      processedForums.sort((a, b) => b.thread_count + b.post_count - (a.thread_count + a.post_count))
      setForums(processedForums)
    } catch (error) {
      console.error("Error fetching forums:", error)
    } finally {
      setLoading(false)
    }
  }

  const getCategories = () => {
    const categories = forums.map((forum) => forum.category || "general")
    return ["all", ...Array.from(new Set(categories))]
  }

  const filteredForums = forums.filter((forum) => {
    const matchesCategory = activeCategory === "all" || forum.category === activeCategory
    const matchesSearch =
      forum.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      forum.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const ForumCard = ({ forum, index }: { forum: Forum; index: number }) => {
    const isExpanded = expandedForum === forum.id

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        layout
      >
        <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
          <CardContent className="p-0">
            <div className="flex">
              {/* Forum Icon */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <Hash className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              </div>

              {/* Forum Info */}
              <div className="flex-1 p-3 sm:p-4 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/forums/${forum.slug}`}
                      className="font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-1 text-sm sm:text-base"
                    >
                      {forum.name}
                    </Link>
                    {forum.category && (
                      <Badge variant="outline" className="text-xs mt-1 capitalize">
                        {forum.category}
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 flex-shrink-0"
                    onClick={() => setExpandedForum(isExpanded ? null : forum.id)}
                  >
                    <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronDown className="h-4 w-4" />
                    </motion.div>
                  </Button>
                </div>

                <p className="text-xs sm:text-sm text-gray-600 line-clamp-1 mb-2">{forum.description}</p>

                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    <span>{forum.thread_count}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>{forum.post_count}</span>
                  </div>
                </div>

                {/* Expanded Content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-3 mt-3 border-t border-gray-100">
                        {forum.latest_thread ? (
                          <div className="space-y-2">
                            <div className="text-xs font-medium text-gray-700">最新主题:</div>
                            <div className="flex items-start gap-2">
                              <img
                                src={forum.latest_thread.profiles?.avatar_url || "/placeholder.svg?height=24&width=24"}
                                alt={forum.latest_thread.profiles?.username}
                                className="w-6 h-6 rounded-full object-cover"
                              />
                              <div className="flex-1 min-w-0">
                                <Link
                                  href={`/forums/${forum.slug}`}
                                  className="text-xs text-gray-900 hover:text-blue-600 line-clamp-1"
                                >
                                  {forum.latest_thread.title}
                                </Link>
                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                  <span>{forum.latest_thread.profiles?.username}</span>
                                  {forum.latest_thread.profiles?.is_verified && (
                                    <VerificationBadge
                                      type={forum.latest_thread.profiles.verification_type}
                                      size="sm"
                                      showText={false}
                                    />
                                  )}
                                  <span>•</span>
                                  <Clock className="h-3 w-3" />
                                  <span>
                                    {formatDistanceToNow(new Date(forum.latest_thread.created_at), {
                                      addSuffix: true,
                                      locale: zhCN,
                                    })}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-xs text-gray-500">暂无主题</div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
        </div>
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-0">
                <div className="flex">
                  <div className="w-16 h-16 bg-gray-200"></div>
                  <div className="flex-1 p-4 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Mobile-optimized header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">热门版块</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="sm:hidden">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Mobile filters */}
        <AnimatePresence>
          {(showFilters || (typeof window !== "undefined" && window.innerWidth >= 640)) && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="space-y-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="搜索版块..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-10"
                  />
                </div>

                {/* Category filters */}
                <div className="flex flex-wrap gap-2">
                  {getCategories().map((category) => (
                    <Button
                      key={category}
                      variant={activeCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveCategory(category)}
                      className="capitalize text-xs h-8"
                    >
                      {category === "all" ? "全部" : category}
                    </Button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-600">显示 {filteredForums.length} 个版块</div>

      {/* Forums display - List view only */}
      <div className="space-y-3">
        {filteredForums.map((forum, index) => (
          <ForumCard key={forum.id} forum={forum} index={index} />
        ))}
      </div>

      {/* Empty state */}
      {filteredForums.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-2xl">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">未找到匹配的版块</h3>
          <p className="text-gray-600 mb-4">尝试调整搜索条件或筛选选项</p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery("")
              setActiveCategory("all")
            }}
          >
            清除筛选条件
          </Button>
        </div>
      )}

      {/* View all button */}
      <div className="text-center pt-4">
        <Button asChild variant="outline" className="w-full sm:w-auto bg-transparent">
          <Link href="/forums">
            查看全部版块
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
