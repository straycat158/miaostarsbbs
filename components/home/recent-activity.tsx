"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Clock } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"

interface Activity {
  id: string
  type: "thread" | "post"
  title?: string
  content: string
  created_at: string
  forum_slug: string
  forum_name: string
  thread_id?: string
  user: {
    username: string
    avatar_url: string
  }
}

export default function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecentActivity()
  }, [])

  const fetchRecentActivity = async () => {
    try {
      // Fetch recent threads
      const { data: threads, error: threadsError } = await supabase
        .from("threads")
        .select(`
          id,
          title,
          content,
          created_at,
          forums!inner(name, slug),
          profiles!inner(username, avatar_url)
        `)
        .order("created_at", { ascending: false })
        .limit(5)

      if (threadsError) {
        console.error("Error fetching recent threads:", threadsError)
      }

      // Fetch recent posts
      const { data: posts, error: postsError } = await supabase
        .from("posts")
        .select(`
          id,
          content,
          created_at,
          threads!inner(id, title, forums!inner(name, slug)),
          profiles!inner(username, avatar_url)
        `)
        .order("created_at", { ascending: false })
        .limit(5)

      if (postsError) {
        console.error("Error fetching recent posts:", postsError)
      }

      // Format threads
      const threadActivities = (threads || []).map((thread: any) => ({
        id: `thread-${thread.id}`,
        type: "thread" as const,
        title: thread.title,
        content: thread.content,
        created_at: thread.created_at,
        forum_slug: thread.forums.slug,
        forum_name: thread.forums.name,
        thread_id: thread.id,
        user: {
          username: thread.profiles.username,
          avatar_url: thread.profiles.avatar_url,
        },
      }))

      // Format posts
      const postActivities = (posts || []).map((post: any) => ({
        id: `post-${post.id}`,
        type: "post" as const,
        title: post.threads.title,
        content: post.content,
        created_at: post.created_at,
        forum_slug: post.threads.forums.slug,
        forum_name: post.threads.forums.name,
        thread_id: post.threads.id,
        user: {
          username: post.profiles.username,
          avatar_url: post.profiles.avatar_url,
        },
      }))

      // Combine and sort by date
      const allActivities = [...threadActivities, ...postActivities].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )

      setActivities(allActivities.slice(0, 5))
    } catch (error) {
      console.error("Error fetching recent activity:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <motion.div
          key={activity.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200">
            <CardContent className="p-4">
              <div className="flex gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={activity.user.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback>{activity.user.username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Link
                      href={`/profile/${activity.user.username}`}
                      className="font-medium text-gray-900 hover:text-blue-600"
                    >
                      {activity.user.username}
                    </Link>
                    <Badge variant="outline" className="text-xs">
                      {activity.type === "thread" ? "发布了主题" : "回复了主题"}
                    </Badge>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(activity.created_at), {
                        addSuffix: true,
                        locale: zhCN,
                      })}
                    </span>
                  </div>

                  <Link
                    href={`/forums/${activity.forum_slug}/threads/${activity.thread_id}`}
                    className="text-gray-900 hover:text-blue-600 font-medium line-clamp-1"
                  >
                    {activity.title}
                  </Link>

                  <p className="text-sm text-gray-600 line-clamp-1 mt-1">{activity.content}</p>

                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    <Link href={`/forums/${activity.forum_slug}`} className="hover:text-blue-600">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {activity.forum_name}
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
