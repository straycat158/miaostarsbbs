"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Pin, Lock, Clock, MessageSquare, Reply, Heart, Share2, ImageIcon, ArrowLeft } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"
import UnifiedContentEditor from "@/components/editor/unified-content-editor"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"

interface Thread {
  id: string
  title: string
  content: string
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
  created_at: string
  images?: any[]
  profiles: {
    username: string
    avatar_url: string
    full_name: string
  }
}

interface ThreadDetailProps {
  threadId: string
}

export default function ThreadDetail({ threadId }: ThreadDetailProps) {
  const [thread, setThread] = useState<Thread | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showReplyEditor, setShowReplyEditor] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    console.log("ThreadDetail mounted with threadId:", threadId)
    fetchData()
  }, [threadId])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      console.log("Current user:", user)

      // Fetch thread
      console.log("Fetching thread with ID:", threadId)
      const { data: threadData, error: threadError } = await supabase
        .from("threads")
        .select(`
          *,
          profiles(username, avatar_url, full_name),
          forums(name, slug)
        `)
        .eq("id", threadId)
        .single()

      console.log("Thread query result:", { threadData, threadError })

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
      console.log("Thread data set:", threadData)

      // Fetch posts
      console.log("Fetching posts for thread:", threadId)
      const { data: postsData, error: postsError } = await supabase
        .from("posts")
        .select(`
          *,
          profiles(username, avatar_url, full_name)
        `)
        .eq("thread_id", threadId)
        .order("created_at", { ascending: true })

      console.log("Posts query result:", { postsData, postsError })

      if (postsError) {
        console.error("Error fetching posts:", postsError)
        // Don't set error here, just log it as posts are optional
      } else {
        setPosts(postsData || [])
        console.log("Posts data set:", postsData)
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
          content: content.content,
          thread_id: threadId,
          created_by: user.id,
          images: content.images || [],
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

  // Loading state
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

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="text-red-600 text-lg font-semibold">加载失败</div>
              <p className="text-red-700">{error}</p>
              <Button onClick={fetchData} variant="outline">
                重试
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // No thread found
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
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500">
          <Link href="/forums" className="hover:text-blue-600 transition-colors">
            版块
          </Link>
          <span>/</span>
          <Link href={`/forums/${thread.forums.slug}`} className="hover:text-blue-600 transition-colors">
            {thread.forums.name}
          </Link>
          <span>/</span>
          <span className="text-gray-900 truncate">{thread.title}</span>
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
              <div className="flex-1">
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
                <h1 className="text-2xl font-bold text-gray-900 leading-tight">{thread.title}</h1>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={thread.profiles?.avatar_url || "/placeholder.svg"} />
                <AvatarFallback className="text-lg">
                  {thread.profiles?.username?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold text-gray-900">
                  {thread.profiles?.full_name || thread.profiles?.username || "未知用户"}
                </div>
                <div className="text-sm text-gray-500 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(new Date(thread.created_at), {
                    addSuffix: true,
                    locale: zhCN,
                  })}
                </div>
              </div>
            </div>

            {/* Cover Image */}
            {thread.cover_image && (
              <div className="rounded-lg overflow-hidden">
                <img
                  src={thread.cover_image || "/placeholder.svg"}
                  alt="封面图片"
                  className="w-full h-64 object-cover"
                  onError={(e) => {
                    console.error("Cover image failed to load:", thread.cover_image)
                    e.currentTarget.style.display = "none"
                  }}
                />
              </div>
            )}

            <div className="prose max-w-none">
              <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">{thread.content}</div>
            </div>

            {/* Additional Images */}
            {thread.images && thread.images.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <ImageIcon className="h-4 w-4" />
                  <span>图片 ({thread.images.length})</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {thread.images
                    .filter((img: any) => img.url !== thread.cover_image)
                    .map((image: any, index: number) => (
                      <div key={image.id || index} className="rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={image.url || "/placeholder.svg"}
                          alt={image.name || `图片 ${index + 1}`}
                          className="w-full h-32 object-cover hover:scale-105 transition-transform cursor-pointer"
                          onClick={() => window.open(image.url, "_blank")}
                          onError={(e) => {
                            console.error("Image failed to load:", image.url)
                            e.currentTarget.src = "/placeholder.svg"
                          }}
                        />
                      </div>
                    ))}
                </div>
              </div>
            )}

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm">
                  <Heart className="mr-1 h-4 w-4" />
                  点赞
                </Button>
                <Button variant="ghost" size="sm">
                  <Share2 className="mr-1 h-4 w-4" />
                  分享
                </Button>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <MessageSquare className="h-4 w-4" />
                <span>{posts.length} 条回复</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Posts */}
        {posts.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">回复 ({posts.length})</h2>
            {posts.map((post, index) => (
              <Card key={post.id} className="border-0 shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={post.profiles?.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback>{post.profiles?.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-gray-900">
                          {post.profiles?.full_name || post.profiles?.username || "未知用户"}
                        </span>
                        <span className="text-sm text-gray-500">#{index + 1}</span>
                        <span className="text-sm text-gray-500">
                          {formatDistanceToNow(new Date(post.created_at), {
                            addSuffix: true,
                            locale: zhCN,
                          })}
                        </span>
                      </div>
                      <div className="text-gray-800 leading-relaxed whitespace-pre-wrap mb-3">{post.content}</div>

                      {/* Post Images */}
                      {post.images && post.images.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {post.images.map((image: any, imgIndex: number) => (
                            <div key={image.id || imgIndex} className="rounded-lg overflow-hidden bg-gray-100">
                              <img
                                src={image.url || "/placeholder.svg"}
                                alt={image.name || `回复图片 ${imgIndex + 1}`}
                                className="w-full h-24 object-cover hover:scale-105 transition-transform cursor-pointer"
                                onClick={() => window.open(image.url, "_blank")}
                                onError={(e) => {
                                  console.error("Post image failed to load:", image.url)
                                  e.currentTarget.src = "/placeholder.svg"
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      )}
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
                <UnifiedContentEditor
                  mode="reply"
                  contextId={threadId}
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
