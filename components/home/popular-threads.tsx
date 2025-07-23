"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, Eye, ThumbsUp } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"
import VerificationBadge from "@/components/ui/verification-badge"

interface PopularThread {
  id: string
  title: string
  content: string
  created_at: string
  view_count: number
  reply_count: number
  like_count: number
  forum: {
    name: string
    slug: string
  }
  author: {
    username: string
    avatar_url: string
    is_verified?: boolean
    verification_type?: string
  }
}

export default function PopularThreads() {
  const [threads, setThreads] = useState<PopularThread[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPopularThreads()
  }, [])

  const fetchPopularThreads = async () => {
    try {
      const { data, error } = await supabase
        .from("threads")
        .select(`
          id,
          title,
          content,
          created_at,
          view_count,
          forums!inner(name, slug),
          profiles!inner(username, avatar_url, is_verified, verification_type)
        `)
        .order("view_count", { ascending: false })
        .limit(5)

      if (error) {
        console.error("Error fetching popular threads:", error)
        return
      }

      // Get reply counts for each thread
      const threadsWithCounts = await Promise.all(
        (data || []).map(async (thread: any) => {
          const { count: replyCount } = await supabase
            .from("posts")
            .select("*", { count: "exact", head: true })
            .eq("thread_id", thread.id)

          return {
            id: thread.id,
            title: thread.title,
            content: thread.content,
            created_at: thread.created_at,
            view_count: thread.view_count || 0,
            reply_count: replyCount || 0,
            like_count: 0, // TODO: Implement likes system
            forum: {
              name: thread.forums.name,
              slug: thread.forums.slug,
            },
            author: {
              username: thread.profiles.username,
              avatar_url: thread.profiles.avatar_url,
              is_verified: thread.profiles.is_verified,
              verification_type: thread.profiles.verification_type,
            },
          }
        }),
      )

      setThreads(threadsWithCounts)
    } catch (error) {
      console.error("Error fetching popular threads:", error)
    } finally {
      setLoading(false)
    }
  }

  // 截断用户名函数
  const truncateUsername = (username: string, maxLength = 10) => {
    if (username.length <= maxLength) return username
    return username.slice(0, maxLength) + "..."
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ThumbsUp className="h-5 w-5 text-orange-500" />
            热门主题
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-gray-200"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ThumbsUp className="h-5 w-5 text-orange-500" />
          热门主题
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {threads.map((thread, index) => (
          <motion.div
            key={thread.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="group"
          >
            <div className="flex gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src={thread.author.avatar_url || "/placeholder.svg"} />
                <AvatarFallback className="text-xs">{thread.author.username.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Link
                    href={`/profile/${thread.author.username}`}
                    className="text-sm font-medium text-gray-700 hover:text-blue-600 truncate max-w-[80px]"
                    title={thread.author.username}
                  >
                    {truncateUsername(thread.author.username)}
                  </Link>
                  {thread.author.is_verified && thread.author.verification_type && (
                    <VerificationBadge verificationType={thread.author.verification_type} size="sm" showText={false} />
                  )}
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(thread.created_at), {
                      addSuffix: true,
                      locale: zhCN,
                    })}
                  </span>
                </div>
                <Link
                  href={`/forums/${thread.forum.slug}/threads/${thread.id}`}
                  className="text-sm font-medium text-gray-900 hover:text-blue-600 line-clamp-1 group-hover:text-blue-600"
                >
                  {thread.title}
                </Link>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {thread.view_count}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    {thread.reply_count}
                  </span>
                  <Link
                    href={`/forums/${thread.forum.slug}`}
                    className="hover:text-blue-600 truncate max-w-[60px]"
                    title={thread.forum.name}
                  >
                    {thread.forum.name}
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  )
}
