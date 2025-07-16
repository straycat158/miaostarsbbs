"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { MessageSquare, Users, TrendingUp, Clock } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { motion } from "framer-motion"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"

interface ForumWithStats {
  id: string
  name: string
  description: string
  slug: string
  cover_image?: string
  thread_count: number
  post_count: number
  latest_activity?: string
}

export default function PopularForumsPreview() {
  const [forums, setForums] = useState<ForumWithStats[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPopularForums()
  }, [])

  const fetchPopularForums = async () => {
    try {
      // Get forums with thread and post counts
      const { data: forumsData, error } = await supabase
        .from("forums")
        .select(`
          id,
          name,
          description,
          slug,
          cover_image,
          threads!inner(
            id,
            created_at,
            posts(count)
          )
        `)
        .limit(6)

      if (error) {
        console.error("Error fetching forums:", error)
        return
      }

      // Process the data to get stats
      const processedForums = (forumsData || []).map((forum: any) => {
        const threads = forum.threads || []
        const threadCount = threads.length
        const postCount = threads.reduce((total: number, thread: any) => {
          return total + (thread.posts?.[0]?.count || 0)
        }, 0)

        // Get latest activity
        const latestThread = threads.sort(
          (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )[0]

        return {
          id: forum.id,
          name: forum.name,
          description: forum.description,
          slug: forum.slug,
          cover_image: forum.cover_image,
          thread_count: threadCount,
          post_count: postCount,
          latest_activity: latestThread?.created_at,
        }
      })

      // Sort by activity (thread count + post count)
      processedForums.sort((a, b) => b.thread_count + b.post_count - (a.thread_count + a.post_count))

      setForums(processedForums.slice(0, 3))
    } catch (error) {
      console.error("Error fetching popular forums:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="border-0 shadow-lg animate-pulse">
            <CardHeader className="pb-4">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (forums.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-2xl">
        <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">暂无版块</h3>
        <p className="text-gray-600">创建第一个版块开始讨论吧！</p>
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {forums.map((forum, index) => (
        <motion.div
          key={forum.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer">
            <Link href={`/forums/${forum.slug}`}>
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                      {forum.name}
                    </CardTitle>
                    <CardDescription className="text-base text-gray-600 leading-relaxed line-clamp-2">
                      {forum.description}
                    </CardDescription>
                  </div>
                  <TrendingUp className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors flex-shrink-0" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        <span className="font-medium">{forum.thread_count}</span>
                        <span>个主题</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span className="font-medium">{forum.post_count}</span>
                        <span>条回复</span>
                      </div>
                    </div>
                  </div>

                  {forum.latest_activity && (
                    <div className="flex items-center gap-1 text-xs text-gray-400 pt-2 border-t border-gray-100">
                      <Clock className="h-3 w-3" />
                      <span>
                        最新活动{" "}
                        {formatDistanceToNow(new Date(forum.latest_activity), { addSuffix: true, locale: zhCN })}
                      </span>
                    </div>
                  )}

                  {/* Activity indicator */}
                  <div className="w-full bg-gray-200 rounded-full h-1 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(((forum.thread_count + forum.post_count) / 10) * 100, 100)}%` }}
                      transition={{ duration: 1, delay: index * 0.2 }}
                    />
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
