"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageSquare, Clock, ArrowRight, TrendingUp } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"
import VerificationBadge from "@/components/ui/verification-badge"

interface Thread {
  id: string
  title: string
  content: string
  created_at: string
  post_count: number
  forum: {
    name: string
    slug: string
  }
  profiles: {
    username: string
    avatar_url: string
    is_verified: boolean
    verification_type: string
  }
}

export default function PopularThreads() {
  const [threads, setThreads] = useState<Thread[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPopularThreads()
  }, [])

  const fetchPopularThreads = async () => {
    try {
      const { data: threadsData, error } = await supabase
        .from("threads")
        .select(`
          id,
          title,
          content,
          created_at,
          forums(name, slug),
          profiles(username, avatar_url, is_verified, verification_type),
          posts(count)
        `)
        .order("count", { foreignTable: "posts", ascending: false })
        .limit(8)

      if (error) {
        console.error("Error fetching popular threads:", error)
        return
      }

      const processedThreads = (threadsData || []).map((thread: any) => ({
        id: thread.id,
        title: thread.title,
        content: thread.content,
        created_at: thread.created_at,
        post_count: thread.posts?.[0]?.count || 0,
        forum: thread.forums,
        profiles: thread.profiles,
      }))

      setThreads(processedThreads)
    } catch (error) {
      console.error("Error fetching popular threads:", error)
    } finally {
      setLoading(false)
    }
  }

  const truncateContent = (content: string, maxLength = 100) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + "..."
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-0">
                <div className="flex">
                  <div className="w-12 h-12 bg-gray-200 rounded-full m-4"></div>
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-red-500" />
          热门主题
        </h2>
        <Button variant="outline" size="sm" asChild>
          <Link href="/forums">
            查看更多
            <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </Button>
      </div>

      {/* Threads Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {threads.map((thread, index) => (
          <motion.div
            key={thread.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ y: -2 }}
          >
            <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200 h-full">
              <CardContent className="p-0">
                <div className="flex">
                  {/* User Avatar */}
                  <div className="flex-shrink-0 p-3 sm:p-4">
                    <div className="flex flex-col items-center space-y-1">
                      <img
                        src={thread.profiles?.avatar_url || "/placeholder.svg?height=40&width=40"}
                        alt={thread.profiles?.username}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                      />
                      <div className="text-center">
                        <div className="text-xs text-gray-600 truncate max-w-[60px] flex items-center gap-1">
                          {thread.profiles?.username}
                          {thread.profiles?.is_verified && (
                            <VerificationBadge type={thread.profiles.verification_type} size="sm" showText={false} />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Thread Content */}
                  <div className="flex-1 p-3 sm:p-4 min-w-0">
                    <div className="space-y-2">
                      {/* Forum Badge */}
                      <Badge variant="outline" className="text-xs">
                        {thread.forum?.name}
                      </Badge>

                      {/* Title */}
                      <Link
                        href={`/forums/${thread.forum?.slug}/threads/${thread.id}`}
                        className="block font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 text-sm sm:text-base leading-tight"
                      >
                        {thread.title}
                      </Link>

                      {/* Content Preview */}
                      <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 leading-relaxed">
                        {truncateContent(thread.content)}
                      </p>

                      {/* Stats */}
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            <span>{thread.post_count}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Clock className="h-3 w-3" />
                          <span>
                            {formatDistanceToNow(new Date(thread.created_at), {
                              addSuffix: true,
                              locale: zhCN,
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Empty state */}
      {threads.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-2xl">
          <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">暂无热门主题</h3>
          <p className="text-gray-600">快来发布第一个主题吧！</p>
        </div>
      )}
    </div>
  )
}
