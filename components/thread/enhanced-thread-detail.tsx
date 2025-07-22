"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Pin, Lock, Clock, MessageSquare, Reply, Share2, ArrowLeft } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"
import BlockBasedEditor from "@/components/editor/block-based-editor"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"

interface Thread {
  id: string
  title: string
  content: string
  blocks?: ContentBlock[]
  is_pinned: boolean
  is_locked: boolean
  created_at: string
  cover_image?: string
  images?: any[]
  profiles: {
    username: string
    avatar_url: string
    full_name: string
  }
  forums: {
    name: string
    slug: string
  }
}

interface Post {
  id: string
  content: string
  blocks?: ContentBlock[]
  created_at: string
  images?: any[]
  profiles: {
    username: string
    avatar_url: string
    full_name: string
  }
}

interface ContentBlock {
  id: string
  type: "text" | "image"
  content: string
  image?: {
    id: string
    url: string
    name: string
  }
  order: number
}

interface EnhancedThreadDetailProps {
  threadId: string
}

export default function EnhancedThreadDetail({ threadId }: EnhancedThreadDetailProps) {
  const [thread, setThread] = useState<Thread | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showReplyEditor, setShowReplyEditor] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    console.log("EnhancedThreadDetail mounted with threadId:", threadId)
    fetchData()
  }, [threadId])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)

      const { data: threadData, error: threadError } = await supabase
        .from("threads")
        .select(`
          *,
          profiles(username, avatar_url, full_name),
          forums(name, slug)
        `)
        .eq("id", threadId)
        .single()

      if (threadError) {
        console.error("Error fetching thread:", threadError)
        setError("获取主题失败: " + threadError.message)
        return
      }

      if (!threadData) {
        console.error("No thread data found")
        setError("主题不存在")
        return
      }

      setThread(threadData)

      const { data: postsData, error: postsError } = await supabase
        .from("posts")
        .select(`
          *,
          profiles(username, avatar_url, full_name)
        `)
        .eq("thread_id", threadId)
        .order("created_at", { ascending: true })

      if (postsError) {
        console.error("Error fetching posts:", postsError)
      } else {
        setPosts(postsData || [])
      }
    } catch (error: any) {
      console.error("Unexpected error in fetchData:", error)
      setError("加载数据时发生错误: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateReply = async (content: any) => {
    try {
      if (!user) {
        throw new Error("请先登录")
      }

      const { data, error } = await supabase
        .from("posts")
        .insert({
          content: JSON.stringify(content.blocks),
          blocks: content.blocks,
          thread_id: threadId,
          created_by: user.id,
        })
        .select(`
          *,
          profiles(username, avatar_url, full_name)
        `)
        .single()

      if (error) throw error

      setPosts((prev) => [...prev, data])
      setShowReplyEditor(false)
      toast({ title: "回复发布成功！" })
    } catch (error: any) {
      console.error("Error creating reply:", error)
      throw new Error(error.message || "回复失败")
    }
  }

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: thread?.title,
          text: thread?.content,
          url: window.location.href,
        })
      } else {
        await navigator.clipboard.writeText(window.location.href)
        toast({ title: "链接已复制到剪贴板" })
      }
    } catch (error) {
      console.error("Error sharing:", error)
      toast({ title: "分享失败", variant: "destructive" })
    }
  }

  const renderBlocks = (blocks: ContentBlock[] | undefined, fallbackContent?: string) => {
    if (!blocks || blocks.length === 0) {
      if (fallbackContent) {
        return (
          <div className="prose max-w-none">
            <div
              className="text-gray-800 leading-relaxed whitespace-pre-wrap"
              style={{
                wordBreak: "break-all",
                overflowWrap: "anywhere",
                hyphens: "auto",
              }}
            >
              {fallbackContent}
            </div>
          </div>
        )
      }
      return null
    }

    return (
      <div className="space-y-4">
        {blocks
          .sort((a, b) => a.order - b.order)
          .map((block) => (
            <div key={block.id}>
              {block.type === "text" ? (
                <div className="prose max-w-none">
                  <div
                    className="text-gray-800 leading-relaxed whitespace-pre-wrap"
                    style={{
                      wordBreak: "break-all",
                      overflowWrap: "anywhere",
                      hyphens: "auto",
                    }}
                  >
                    {block.content}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                    <img
                      src={block.image?.url || "/placeholder.svg"}
                      alt={block.image?.name || "图片"}
                      className="cursor-pointer"
                      style={{
                        width: "100%",
                        maxWidth: "800px",
                        maxHeight: "600px",
                        objectFit: "contain",
                        display: "block",
                        margin: "0 auto",
                      }}
                      onClick={() => window.open(block.image?.url, "_blank")}
                      onError={(e) => {
                        console.error("Image failed to load:", block.image?.url)
                        e.currentTarget.src = "/placeholder.svg"
                      }}
                    />
                  </div>
                  {block.content && (
                    <p
                      className="text-sm text-gray-600 text-center italic"
                      style={{
                        wordBreak: "break-all",
                        overflowWrap: "anywhere",
                        hyphens: "auto",
                      }}
                    >
                      {block.content}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
          </div>
          <Card className="animate-pulse">
            <CardHeader className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-48 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="text-red-600 text-lg font-semibold">加载失败</div>
              <p
                className="text-red-700"
                style={{
                  wordBreak: "break-all",
                  overflowWrap: "anywhere",
                }}
              >
                {error}
              </p>
              <Button onClick={fetchData} variant="outline">
                重试
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!thread) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="text-gray-600 text-lg">主题不存在</div>
              <Button asChild>
                <Link href="/forums">返回版块列表</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 flex-wrap">
          <Link href="/forums" className="hover:text-blue-600 transition-colors">
            版块
          </Link>
          <span>/</span>
          <Link
            href={`/forums/${thread.forums.slug}`}
            className="hover:text-blue-600 transition-colors"
            style={{
              wordBreak: "break-all",
              overflowWrap: "anywhere",
            }}
          >
            {thread.forums.name}
          </Link>
          <span>/</span>
          <span
            className="text-gray-900"
            style={{
              wordBreak: "break-all",
              overflowWrap: "anywhere",
            }}
          >
            {thread.title}
          </span>
        </nav>

        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-4">
          <Link href={`/forums/${thread.forums.slug}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回版块
          </Link>
        </Button>

        {/* Thread Content */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
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
                <h1
                  className="text-2xl font-bold text-gray-900 leading-tight"
                  style={{
                    wordBreak: "break-all",
                    overflowWrap: "anywhere",
                    hyphens: "auto",
                  }}
                >
                  {thread.title}
                </h1>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4 flex-wrap">
              <Avatar className="h-12 w-12 flex-shrink-0">
                <AvatarImage src={thread.profiles?.avatar_url || "/placeholder.svg"} />
                <AvatarFallback className="text-lg">
                  {thread.profiles?.username?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div
                  className="font-semibold text-gray-900"
                  style={{
                    wordBreak: "break-all",
                    overflowWrap: "anywhere",
                  }}
                >
                  {thread.profiles?.full_name || thread.profiles?.username || "未知用户"}
                </div>
                <div className="text-sm text-gray-500 flex items-center gap-1 flex-wrap">
                  <Clock className="h-3 w-3 flex-shrink-0" />
                  <span className="whitespace-nowrap">
                    {formatDistanceToNow(new Date(thread.created_at), {
                      addSuffix: true,
                      locale: zhCN,
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Render blocks or fallback to old content */}
            <div className="overflow-hidden">{renderBlocks(thread.blocks, thread.content)}</div>

            <Separator />

            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={handleShare}>
                  <Share2 className="mr-1 h-4 w-4" />
                  分享
                </Button>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <MessageSquare className="h-4 w-4" />
                <span className="tabular-nums">{posts.length}</span>
                <span>条回复</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Posts */}
        {posts.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              回复 (<span className="tabular-nums">{posts.length}</span>)
            </h2>
            {posts.map((post, index) => (
              <Card key={post.id} className="border-0 shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarImage src={post.profiles?.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback>{post.profiles?.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <span
                          className="font-medium text-gray-900"
                          style={{
                            wordBreak: "break-all",
                            overflowWrap: "anywhere",
                          }}
                        >
                          {post.profiles?.full_name || post.profiles?.username || "未知用户"}
                        </span>
                        <span className="text-sm text-gray-500 tabular-nums">#{index + 1}</span>
                        <span className="text-sm text-gray-500 whitespace-nowrap">
                          {formatDistanceToNow(new Date(post.created_at), {
                            addSuffix: true,
                            locale: zhCN,
                          })}
                        </span>
                      </div>

                      {/* Render blocks or fallback to old content */}
                      <div className="overflow-hidden">{renderBlocks(post.blocks, post.content)}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Reply Section */}
        {user && !thread.is_locked && (
          <div className="space-y-4">
            {!showReplyEditor ? (
              <Button onClick={() => setShowReplyEditor(true)} className="w-full sm:w-auto" size="lg">
                <Reply className="mr-2 h-4 w-4" />
                回复主题
              </Button>
            ) : (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">发表回复</h3>
                <BlockBasedEditor
                  mode="reply"
                  contextData={{
                    threadTitle: thread.title,
                    parentContent: thread.content,
                  }}
                  onPublish={handleCreateReply}
                />
                <Button variant="ghost" onClick={() => setShowReplyEditor(false)}>
                  取消回复
                </Button>
              </div>
            )}
          </div>
        )}

        {!user && (
          <Card className="border-0 shadow-sm bg-gray-50">
            <CardContent className="text-center py-8">
              <p className="text-gray-600 mb-4">请登录后参与讨论</p>
              <Button asChild>
                <Link href="/auth">立即登录</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
