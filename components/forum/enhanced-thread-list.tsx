"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Plus,
  Pin,
  Lock,
  MessageSquare,
  Clock,
  Eye,
  Search,
  Filter,
  Grid3X3,
  List,
  TrendingUp,
  Calendar,
  ImageIcon,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"
import { motion, AnimatePresence } from "framer-motion"
import VerificationBadge from "@/components/ui/verification-badge"

interface Thread {
  id: string
  title: string
  content: string
  is_pinned: boolean
  is_locked: boolean
  created_at: string
  cover_image?: string
  images?: any[]
  created_by: string
  profiles: {
    username: string
    avatar_url: string
    full_name: string
    is_verified?: boolean
    verification_type?: string
  }
  posts: { count: number }[]
}

interface EnhancedThreadListProps {
  forumSlug: string
  forumName: string
}

type ViewMode = "grid" | "list"
type SortBy = "latest" | "popular" | "oldest"

export default function EnhancedThreadList({ forumSlug, forumName }: EnhancedThreadListProps) {
  const [threads, setThreads] = useState<Thread[]>([])
  const [filteredThreads, setFilteredThreads] = useState<Thread[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [sortBy, setSortBy] = useState<SortBy>("latest")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [hoveredThread, setHoveredThread] = useState<string | null>(null)

  useEffect(() => {
    fetchThreads()
  }, [forumSlug])

  useEffect(() => {
    filterAndSortThreads()
  }, [threads, searchQuery, selectedCategory, sortBy])

  const fetchThreads = async () => {
    try {
      console.log("Fetching threads for forum:", forumSlug)
      const { data: forum, error: forumError } = await supabase
        .from("forums")
        .select("id")
        .eq("slug", forumSlug)
        .maybeSingle()

      if (forumError) {
        console.error("Error fetching forum in EnhancedThreadList:", forumError)
        setThreads([])
        return
      }

      if (!forum) {
        console.warn(`Forum with slug "${forumSlug}" not found.`)
        setThreads([])
        return
      }

      const { data: threads, error } = await supabase
        .from("threads")
        .select(`
            *,
            profiles(username, avatar_url, full_name, is_verified, verification_type),
            posts(count)
          `)
        .eq("forum_id", forum.id)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false })

      console.log("Threads query result:", { threads, error })

      if (error) {
        console.error("Error fetching threads:", error)
      } else {
        setThreads(threads || [])
      }
    } catch (error) {
      console.error("Unexpected error fetching threads:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortThreads = () => {
    const filtered = threads.filter((thread) => {
      const matchesSearch =
        thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        thread.content.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory =
        selectedCategory === "all" ||
        (selectedCategory === "pinned" && thread.is_pinned) ||
        (selectedCategory === "locked" && thread.is_locked) ||
        (selectedCategory === "images" && thread.cover_image)

      return matchesSearch && matchesCategory
    })

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "popular":
          return (b.posts?.[0]?.count || 0) - (a.posts?.[0]?.count || 0)
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case "latest":
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })

    setFilteredThreads(filtered)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  }

  const ThreadCard = ({ thread, index }: { thread: Thread; index: number }) => (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      layout
      transition={{ duration: 0.3 }}
      onHoverStart={() => setHoveredThread(thread.id)}
      onHoverEnd={() => setHoveredThread(null)}
      className="group"
    >
      <Card className="border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-white overflow-hidden h-full">
        {viewMode === "grid" ? (
          <div className="relative h-full flex flex-col">
            {/* Cover Image */}
            <div className="relative h-48 bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden flex-shrink-0">
              {thread.cover_image ? (
                <motion.img
                  src={thread.cover_image}
                  alt={thread.title}
                  className="w-full h-full object-cover"
                  style={{ maxWidth: "100%", height: "100%", objectFit: "cover" }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <MessageSquare className="h-12 w-12 mx-auto mb-2" />
                    <p className="text-sm">暂无封面</p>
                  </div>
                </div>
              )}

              {/* Overlay with badges */}
              <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
                {thread.is_pinned && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }}>
                    <Badge className="bg-red-500 text-white shadow-lg text-xs">
                      <Pin className="mr-1 h-3 w-3" />
                      置顶
                    </Badge>
                  </motion.div>
                )}
                {thread.is_locked && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }}>
                    <Badge variant="outline" className="bg-white/90 border-gray-300 text-xs">
                      <Lock className="mr-1 h-3 w-3" />
                      已锁定
                    </Badge>
                  </motion.div>
                )}
              </div>

              {/* Image count indicator */}
              {thread.images && thread.images.length > 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1"
                >
                  <ImageIcon className="h-3 w-3" />
                  {thread.images.length}
                </motion.div>
              )}

              {/* Hover overlay */}
              <AnimatePresence>
                {hoveredThread === thread.id && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/20 flex items-center justify-center"
                  >
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0.8 }}
                      className="bg-white/90 backdrop-blur-sm rounded-full p-3"
                    >
                      <Eye className="h-6 w-6 text-gray-700" />
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Content */}
            <CardContent className="p-4 flex-1 flex flex-col">
              <div className="space-y-3 flex-1">
                <Link
                  href={`/forums/${forumSlug}/threads/${thread.id}`}
                  className="block group-hover:text-blue-600 transition-colors"
                >
                  <h3
                    className="font-semibold text-lg leading-tight line-clamp-2"
                    style={{
                      wordBreak: "break-all",
                      overflowWrap: "anywhere",
                      hyphens: "auto",
                    }}
                  >
                    {thread.title}
                  </h3>
                </Link>

                <p
                  className="text-gray-600 text-sm line-clamp-3 leading-relaxed flex-1"
                  style={{
                    wordBreak: "break-all",
                    overflowWrap: "anywhere",
                    hyphens: "auto",
                  }}
                >
                  {thread.content}
                </p>

                <div className="flex items-center justify-between pt-2 mt-auto">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Avatar className="h-6 w-6 flex-shrink-0">
                      <AvatarImage src={thread.profiles?.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback className="text-xs">
                        {thread.profiles?.username?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex items-center gap-2 min-w-0 flex-wrap">
                      <span
                        className="text-xs text-gray-500 min-w-0"
                        style={{
                          wordBreak: "break-all",
                          overflowWrap: "anywhere",
                        }}
                      >
                        {thread.profiles?.username}
                      </span>
                      {thread.profiles?.is_verified && thread.profiles?.verification_type && (
                        <VerificationBadge
                          verificationType={thread.profiles.verification_type}
                          size="sm"
                          showText={true}
                        />
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-gray-500 flex-shrink-0">
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      <span className="tabular-nums">{thread.posts?.[0]?.count || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span className="whitespace-nowrap">
                        {formatDistanceToNow(new Date(thread.created_at), {
                          addSuffix: true,
                          locale: zhCN,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </div>
        ) : (
          // List view
          <CardContent className="p-4">
            <div className="flex gap-4">
              {/* Thumbnail */}
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100">
                  {thread.cover_image ? (
                    <img
                      src={thread.cover_image || "/placeholder.svg"}
                      alt={thread.title}
                      className="w-full h-full object-cover"
                      style={{ maxWidth: "64px", maxHeight: "64px", objectFit: "cover" }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <MessageSquare className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {thread.is_pinned && (
                        <Badge variant="secondary" className="bg-red-50 text-red-700 border-red-200 text-xs">
                          <Pin className="mr-1 h-3 w-3" />
                          置顶
                        </Badge>
                      )}
                      {thread.is_locked && (
                        <Badge variant="outline" className="border-gray-300 text-xs">
                          <Lock className="mr-1 h-3 w-3" />
                          已锁定
                        </Badge>
                      )}
                    </div>

                    <Link
                      href={`/forums/${forumSlug}/threads/${thread.id}`}
                      className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-1 block"
                      style={{
                        wordBreak: "break-all",
                        overflowWrap: "anywhere",
                        hyphens: "auto",
                      }}
                    >
                      {thread.title}
                    </Link>

                    <p
                      className="text-gray-600 text-sm mt-1 line-clamp-2"
                      style={{
                        wordBreak: "break-all",
                        overflowWrap: "anywhere",
                        hyphens: "auto",
                      }}
                    >
                      {thread.content}
                    </p>

                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 flex-wrap">
                      <div className="flex items-center gap-2 min-w-0">
                        <Avatar className="h-6 w-6 flex-shrink-0">
                          <AvatarImage src={thread.profiles?.avatar_url || "/placeholder.svg"} />
                          <AvatarFallback className="text-xs">
                            {thread.profiles?.username?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex items-center gap-2 min-w-0 flex-wrap">
                          <span
                            className="min-w-0"
                            style={{
                              wordBreak: "break-all",
                              overflowWrap: "anywhere",
                            }}
                          >
                            {thread.profiles?.username}
                          </span>
                          {thread.profiles?.is_verified && thread.profiles?.verification_type && (
                            <VerificationBadge
                              verificationType={thread.profiles.verification_type}
                              size="sm"
                              showText={true}
                            />
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 whitespace-nowrap">
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

                  <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full flex-shrink-0">
                    <MessageSquare className="h-4 w-4" />
                    <span className="font-medium tabular-nums">{thread.posts?.[0]?.count || 0}</span>
                    <span>回复</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </motion.div>
  )

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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200"></div>
              <CardContent className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col gap-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2 min-w-0 flex-1">
            <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-2 flex-wrap">
              <Link href="/forums" className="hover:text-blue-600 transition-colors">
                版块
              </Link>
              <span>/</span>
              <span
                className="text-gray-900"
                style={{
                  wordBreak: "break-all",
                  overflowWrap: "anywhere",
                }}
              >
                {forumName}
              </span>
            </nav>
            <h1
              className="text-3xl font-bold text-gray-900"
              style={{
                wordBreak: "break-all",
                overflowWrap: "anywhere",
                hyphens: "auto",
              }}
            >
              {forumName}
            </h1>
            <p className="text-gray-600 text-lg">版块讨论和主题</p>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-shrink-0">
            <Button asChild className="self-start sm:self-auto shadow-lg">
              <Link href={`/forums/${forumSlug}/create-thread`}>
                <Plus className="mr-2 h-4 w-4" />
                发布主题
              </Link>
            </Button>
          </motion.div>
        </div>

        {/* Filters and Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between"
        >
          <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="搜索主题..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-40">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部主题</SelectItem>
                <SelectItem value="pinned">置顶主题</SelectItem>
                <SelectItem value="locked">已锁定</SelectItem>
                <SelectItem value="images">有图片</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortBy)}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    最新
                  </div>
                </SelectItem>
                <SelectItem value="popular">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    热门
                  </div>
                </SelectItem>
                <SelectItem value="oldest">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    最早
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="transition-all duration-200"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="transition-all duration-200"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </motion.div>

      {/* Results count */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-sm text-gray-600"
      >
        共找到 <span className="tabular-nums">{filteredThreads.length}</span> 个主题
      </motion.div>

      {/* Threads Grid/List */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${viewMode}-${sortBy}-${selectedCategory}-${searchQuery}`}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className={viewMode === "grid" ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3" : "space-y-4"}
        >
          {filteredThreads.map((thread, index) => (
            <ThreadCard key={thread.id} thread={thread} index={index} />
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Empty State */}
      {filteredThreads.length === 0 && !loading && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center py-16 bg-gray-50 rounded-2xl"
        >
          <div className="max-w-md mx-auto">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="mx-auto mb-6 h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center"
            >
              <MessageSquare className="h-8 w-8 text-gray-400" />
            </motion.div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchQuery || selectedCategory !== "all" ? "未找到匹配的主题" : "暂无主题"}
            </h3>
            <p
              className="text-gray-600 mb-6"
              style={{
                wordBreak: "break-all",
                overflowWrap: "anywhere",
              }}
            >
              {searchQuery || selectedCategory !== "all" ? "尝试调整搜索条件或筛选选项" : "开始对话，发布第一个主题！"}
            </p>
            {!searchQuery && selectedCategory === "all" && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button asChild size="lg">
                  <Link href={`/forums/${forumSlug}/create-thread`}>发布主题</Link>
                </Button>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  )
}
