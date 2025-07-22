"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Eye, Pin, Lock, Reply, Edit, Trash2, Flag } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"
import VerificationBadge from "@/components/ui/verification-badge"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"
import BlockBasedEditor from "@/components/editor/block-based-editor"

interface Thread {
  id: string
  title: string
  content: string
  blocks?: any[]
  created_at: string
  updated_at: string
  author_id: string
  forum_id: string
  is_pinned: boolean
  is_locked: boolean
  view_count: number
  author: {
    id: string
    username: string
    avatar_url?: string
    is_verified?: boolean
    verification_type?: string
    created_at: string
  }
  forum: {
    name: string
    slug: string
  }
}

interface Post {
  id: string
  content: string
  blocks?: any[]
  created_at: string
  updated_at: string
  author_id: string
  thread_id: string
  author: {
    id: string
    username: string
    avatar_url?: string
    is_verified?: boolean
    verification_type?: string
    created_at: string
  }
}

interface EnhancedThreadDetailProps {
  threadId: string
}

export default function EnhancedThreadDetail({ threadId }: EnhancedThreadDetailProps) {
  const [thread, setThread] = useState<Thread | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [replyContent, setReplyContent] = useState("")
  const [isReplying, setIsReplying] = useState(false)

  useEffect(() => {
    fetchThreadAndPosts()
    getCurrentUser()
    incrementViewCount()
  }, [threadId])

  const getCurrentUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
      setCurrentUser(profile)
    }
  }

  const incrementViewCount = async () => {
    try {
      await supabase.rpc("increment_thread_views", { thread_id: threadId })
    } catch (error) {
      console.error("Error incrementing view count:", error)
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
          author:profiles!threads_author_id_fkey(id, username, avatar_url, is_verified, verification_type, created_at),
          forum:forums!threads_forum_id_fkey(name, slug)
        `)
        .eq("id", threadId)
        .single()

      if (threadError) throw threadError

      setThread(threadData)

      // Fetch posts
      const { data: postsData, error: postsError } = await supabase
        .from("posts")
        .select(`
          *,
          author:profiles!posts_author_id_fkey(id, username, avatar_url, is_verified, verification_type, created_at)
        `)
        .eq("thread_id", threadId)
        .order("created_at", { ascending: true })

      if (postsError) throw postsError

      setPosts(postsData || [])
    } catch (error: any) {
      console.error("Error fetching thread:", error)
      toast({
        title: "加载失败",
        description: "无法加载主题详情",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleReply = async () => {
    if (!currentUser || !replyContent.trim()) return

    try {
      setIsReplying(true)
      const { error } = await supabase.from("posts").insert({
        content: replyContent,
        author_id: currentUser.id,
        thread_id: threadId,
      })

      if (error) throw error

      setReplyContent("")
      await fetchThreadAndPosts()
      toast({
        title: "回复成功",
        description: "您的回复已发布",
      })
    } catch (error: any) {
      console.error("Error posting reply:", error)
      toast({
        title: "回复失败",
        description: "无法发布回复，请重试",
        variant: "destructive",
      })
    } finally {
      setIsReplying(false)
    }
  }

  const renderContent = (content: string, blocks?: any[]) => {
    if (blocks && blocks.length > 0) {
      return <BlockBasedEditor initialBlocks={blocks} readOnly />
    }
    return <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="animate-pulse">
          <CardHeader className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-2/3"></div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
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
          <p className="text-gray-500">该主题可能已被删除或您没有访问权限</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600">
        <Link href="/forums" className="hover:text-blue-600">
          论坛
        </Link>
        <span>/</span>
        <Link href={`/forums/${thread.forum.slug}`} className="hover:text-blue-600">
          {thread.forum.name}
        </Link>
        <span>/</span>
        <span className="text-gray-900">{thread.title}</span>
      </nav>

      {/* Thread Header */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {thread.is_pinned && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <Pin className="h-3 w-3 mr-1" />
                    置顶
                  </Badge>
                )}
                {thread.is_locked && (
                  <Badge variant="secondary" className="bg-red-100 text-red-800">
                    <Lock className="h-3 w-3 mr-1" />
                    锁定
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">{thread.title}</h1>

              {/* Author Info */}
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={thread.author?.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback>{thread.author?.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{thread.author?.username || "未知用户"}</span>
                    {thread.author?.is_verified && thread.author?.verification_type && (
                      <VerificationBadge verificationType={thread.author.verification_type} size="md" showText={true} />
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>
                      发布于 {formatDistanceToNow(new Date(thread.created_at), { addSuffix: true, locale: zhCN })}
                    </span>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{thread.view_count || 0} 浏览</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Flag className="h-4 w-4 mr-1" />
                举报
              </Button>
              {currentUser?.id === thread.author_id && (
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-1" />
                  编辑
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>{renderContent(thread.content, thread.blocks)}</CardContent>
      </Card>

      {/* Posts */}
      <div className="space-y-4">
        {posts.map((post, index) => (
          <Card key={post.id} className="border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-10 w-10 flex-shrink-0">
                  <AvatarImage src={post.author?.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback>{post.author?.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-gray-900">{post.author?.username || "未知用户"}</span>
                        {post.author?.is_verified && post.author?.verification_type && (
                          <VerificationBadge
                            verificationType={post.author.verification_type}
                            size="sm"
                            showText={true}
                          />
                        )}
                      </div>
                      <span className="text-sm text-gray-500">
                        #{index + 1} ·{" "}
                        {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: zhCN })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Reply className="h-4 w-4 mr-1" />
                        回复
                      </Button>
                      {currentUser?.id === post.author_id && (
                        <>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {renderContent(post.content, post.blocks)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Reply Form */}
      {currentUser && !thread.is_locked && (
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader>
            <h3 className="text-lg font-semibold">发表回复</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <BlockBasedEditor
              placeholder="写下您的回复..."
              onChange={(blocks) => {
                // Convert blocks to content string for now
                setReplyContent(JSON.stringify(blocks))
              }}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setReplyContent("")}>
                取消
              </Button>
              <Button
                onClick={handleReply}
                disabled={isReplying || !replyContent.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isReplying ? "发布中..." : "发布回复"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {thread.is_locked && (
        <Card className="border border-red-200 bg-red-50">
          <CardContent className="p-4 text-center">
            <Lock className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <p className="text-red-800 font-medium">此主题已被锁定，无法回复</p>
          </CardContent>
        </Card>
      )}

      {!currentUser && (
        <Card className="border border-blue-200 bg-blue-50">
          <CardContent className="p-4 text-center">
            <p className="text-blue-800 mb-4">请登录后参与讨论</p>
            <Link href="/auth">
              <Button className="bg-blue-600 hover:bg-blue-700">登录 / 注册</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
