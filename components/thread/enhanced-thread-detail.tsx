"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Pin, Lock, MessageCircle, Clock, Reply, Flag, Send } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"
import VerificationBadge from "@/components/ui/verification-badge"
import { toast } from "@/hooks/use-toast"

interface Thread {
  id: string
  title: string
  content: string
  created_at: string
  updated_at: string
  is_pinned: boolean
  is_locked: boolean
  view_count: number
  forum: {
    name: string
    slug: string
  }
  profiles: {
    username: string
    avatar_url?: string
    full_name?: string
    is_verified?: boolean
    verification_type?: string
  }
}

interface Post {
  id: string
  content: string
  created_at: string
  updated_at: string
  created_by: string
  author: {
    username: string
    avatar_url?: string
    full_name?: string
    is_verified?: boolean
    verification_type?: string
  }
}

interface EnhancedThreadDetailProps {
  threadId: string
  forumSlug: string
}

export default function EnhancedThreadDetail({ threadId, forumSlug }: EnhancedThreadDetailProps) {
  const [thread, setThread] = useState<Thread | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [replyContent, setReplyContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    fetchCurrentUser()
    fetchThreadAndPosts()
  }, [threadId])

  const fetchCurrentUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
      setCurrentUser(profile)
    }
  }

  const fetchThreadAndPosts = async () => {
    try {
      setLoading(true)

      // Fetch thread details
      const { data: threadData, error: threadError } = await supabase
        .from("threads")
        .select(`
          *,
          forum:forums(name, slug),
          profiles(username, avatar_url, full_name, is_verified, verification_type)
        `)
        .eq("id", threadId)
        .single()

      if (threadError) throw threadError

      // Fetch posts
      const { data: postsData, error: postsError } = await supabase
        .from("posts")
        .select(`
          id,
          content,
          created_at,
          created_by,
          author:profiles(username, avatar_url, full_name, is_verified, verification_type)
        `)
        .eq("thread_id", threadId)
        .order("created_at", { ascending: true })

      if (postsError) throw postsError

      setThread(threadData)
      setPosts(postsData || [])
    } catch (error) {
      console.error("Error fetching thread and posts:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReply = async () => {
    if (!currentUser) {
      toast({
        title: "请先登录",
        description: "您需要登录后才能发表回复",
        variant: "destructive",
      })
      return
    }

    if (!replyContent.trim()) {
      toast({
        title: "内容不能为空",
        description: "请输入回复内容",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      const { error } = await supabase.from("posts").insert({
        content: replyContent.trim(),
        thread_id: threadId,
        created_by: currentUser.id,
      })

      if (error) throw error

      toast({
        title: "回复成功",
        description: "您的回复已发表",
      })

      setReplyContent("")
      fetchThreadAndPosts() // Refresh posts
    } catch (error) {
      console.error("Error submitting reply:", error)
      toast({
        title: "发表失败",
        description: "回复发表失败，请重试",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="animate-pulse">
          <CardHeader className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!thread) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <h3 className="text-xl font-semibold text-gray-600 mb-2">主题不存在</h3>
          <p className="text-gray-500">请检查链接是否正确</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Thread Header */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2 mb-3">
            {thread.is_pinned && (
              <Badge variant="destructive">
                <Pin className="mr-1 h-3 w-3" />
                置顶
              </Badge>
            )}
            {thread.is_locked && (
              <Badge variant="outline">
                <Lock className="mr-1 h-3 w-3" />
                已锁定
              </Badge>
            )}
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">{thread.title}</h1>

          <div className="flex items-start gap-4">
            <div className="flex flex-col items-center">
              <Avatar className="h-12 w-12 mb-2">
                <AvatarImage src={thread.profiles?.avatar_url || "/placeholder.svg"} />
                <AvatarFallback>{thread.profiles?.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
              <div className="text-center">
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-sm font-medium text-gray-900">{thread.profiles?.username || "未知用户"}</span>
                  {thread.profiles?.is_verified && thread.profiles?.verification_type && (
                    <VerificationBadge type={thread.profiles.verification_type} size="sm" showText={false} />
                  )}
                </div>
                <p className="text-xs text-gray-500">楼主</p>
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{formatDistanceToNow(new Date(thread.created_at), { addSuffix: true, locale: zhCN })}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  <span>{posts.length} 回复</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div
            className="prose prose-sm max-w-none text-gray-700"
            dangerouslySetInnerHTML={{ __html: thread.content }}
          />
        </CardContent>
      </Card>

      {/* Posts */}
      <div className="space-y-4">
        {posts.map((post, index) => (
          <Card key={post.id} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <Avatar className="h-10 w-10 mb-1">
                    <AvatarImage src={post.author?.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback>{post.author?.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="text-center">
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-xs font-medium text-gray-700">{post.author?.username || "未知用户"}</span>
                      {post.author?.is_verified && post.author?.verification_type && (
                        <VerificationBadge type={post.author.verification_type} size="sm" showText={false} />
                      )}
                    </div>
                    <p className="text-xs text-gray-500">#{index + 1}楼</p>
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: zhCN })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Reply className="h-3 w-3 mr-1" />
                        回复
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Flag className="h-3 w-3 mr-1" />
                        举报
                      </Button>
                    </div>
                  </div>

                  <div
                    className="prose prose-sm max-w-none text-gray-700"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Reply Section */}
      {!thread.is_locked ? (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <h3 className="text-lg font-semibold">回复主题</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentUser ? (
              <>
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={currentUser.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback>{currentUser.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Textarea
                      placeholder="输入您的回复..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      className="min-h-[120px] resize-none"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={handleSubmitReply}
                    disabled={isSubmitting || !replyContent.trim()}
                    className="min-w-[100px]"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        发表中...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        发表回复
                      </>
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">请登录后参与讨论</p>
                <Button variant="outline" onClick={() => (window.location.href = "/auth")}>
                  登录
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">主题已锁定</h3>
            <p className="text-gray-500">此主题已被管理员锁定，无法回复</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
