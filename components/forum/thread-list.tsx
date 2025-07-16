"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Pin, Lock, MessageSquare, Clock, Eye } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"

interface Thread {
  id: string
  title: string
  content: string
  is_pinned: boolean
  is_locked: boolean
  created_at: string
  created_by: string
  profiles: {
    username: string
    avatar_url: string
  }
  posts: { count: number }[]
}

interface ThreadListProps {
  forumSlug: string
  forumName: string
}

export default function ThreadList({ forumSlug, forumName }: ThreadListProps) {
  const [threads, setThreads] = useState<Thread[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchThreads = async () => {
      const { data: forum } = await supabase.from("forums").select("id").eq("slug", forumSlug).single()

      if (forum) {
        const { data: threads, error } = await supabase
          .from("threads")
          .select(`
            *,
            profiles(username, avatar_url),
            posts(count)
          `)
          .eq("forum_id", forum.id)
          .order("is_pinned", { ascending: false })
          .order("created_at", { ascending: false })

        if (error) {
          console.error("Error fetching threads:", error)
        } else {
          setThreads(threads || [])
        }
      }
      setLoading(false)
    }

    fetchThreads()
  }, [forumSlug])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
            <Link href="/forums" className="hover:text-blue-600">
              版块
            </Link>
            <span>/</span>
            <span className="text-gray-900">{forumName}</span>
          </nav>
          <h1 className="text-3xl font-bold text-gray-900">{forumName}</h1>
          <p className="text-gray-600 text-lg">版块讨论和主题</p>
        </div>
        <Button asChild className="self-start sm:self-auto">
          <Link href={`/forums/${forumSlug}/create-thread`}>
            <Plus className="mr-2 h-4 w-4" />
            发布主题
          </Link>
        </Button>
      </div>

      <div className="space-y-4">
        {threads.map((thread) => (
          <Card
            key={thread.id}
            className="group hover:shadow-md transition-all duration-200 border-0 shadow-sm bg-white"
          >
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-3">
                    {thread.is_pinned && (
                      <Badge variant="secondary" className="bg-red-50 text-red-700 border-red-200">
                        <Pin className="mr-1 h-3 w-3" />
                        置顶
                      </Badge>
                    )}
                    {thread.is_locked && (
                      <Badge variant="outline" className="border-gray-300">
                        <Lock className="mr-1 h-3 w-3" />
                        已锁定
                      </Badge>
                    )}
                  </div>
                  <Link
                    href={`/forums/${forumSlug}/threads/${thread.id}`}
                    className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors group-hover:text-blue-600 line-clamp-2 leading-relaxed"
                  >
                    {thread.title}
                  </Link>
                </div>
                <Eye className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors flex-shrink-0" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={thread.profiles?.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback className="text-sm">
                      {thread.profiles?.username?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">{thread.profiles?.username}</div>
                    <div className="text-gray-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(thread.created_at), {
                        addSuffix: true,
                        locale: zhCN,
                      })}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                  <MessageSquare className="h-4 w-4" />
                  <span className="font-medium">{thread.posts?.[0]?.count || 0}</span>
                  <span>回复</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {threads.length === 0 && (
        <div className="text-center py-16 bg-gray-50 rounded-2xl">
          <div className="max-w-md mx-auto">
            <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
              <MessageSquare className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">暂无主题</h3>
            <p className="text-gray-600 mb-6">开始对话，发布第一个主题！</p>
            <Button asChild size="lg">
              <Link href={`/forums/${forumSlug}/create-thread`}>发布主题</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
