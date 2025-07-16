"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, MessageSquare, Users2, Search, Sparkles } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { motion, AnimatePresence } from "framer-motion"

interface Forum {
  id: string
  name: string
  description: string
  slug: string
  cover_image?: string
  thread_count?: number
  latest_thread?: {
    title: string
    created_at: string
    profiles: {
      username: string
    }
  }
}

export default function EnhancedForumList() {
  const [forums, setForums] = useState<Forum[]>([])
  const [filteredForums, setFilteredForums] = useState<Forum[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [hoveredForum, setHoveredForum] = useState<string | null>(null)

  useEffect(() => {
    fetchForums()
  }, [])

  useEffect(() => {
    const filtered = forums.filter(
      (forum) =>
        forum.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        forum.description.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    setFilteredForums(filtered)
  }, [forums, searchQuery])

  const fetchForums = async () => {
    const { data: forumsData, error } = await supabase
      .from("forums")
      .select(`
        *,
        threads(count)
      `)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Error fetching forums:", error)
    } else {
      const formatted = (forumsData || []).map((forum: any) => ({
        ...forum,
        thread_count: forum.threads?.[0]?.count ?? 0,
      }))
      setForums(formatted)
      setFilteredForums(formatted)
    }
    setLoading(false)
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

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
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
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold text-gray-900">论坛版块</h1>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            >
              <Sparkles className="h-6 w-6 text-yellow-500" />
            </motion.div>
          </div>
          <p className="text-gray-600 text-lg">探索我们的社区讨论</p>
        </div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button asChild className="self-start sm:self-auto shadow-lg">
            <Link href="/forums/create">
              <Plus className="mr-2 h-4 w-4" />
              创建版块
            </Link>
          </Button>
        </motion.div>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="relative max-w-md"
      >
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="搜索版块..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 shadow-sm"
        />
      </motion.div>

      {/* Results count */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-sm text-gray-600"
      >
        共找到 {filteredForums.length} 个版块
      </motion.div>

      {/* Forums Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={searchQuery}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {filteredForums.map((forum) => (
            <motion.div
              key={forum.id}
              variants={itemVariants}
              layout
              onHoverStart={() => setHoveredForum(forum.id)}
              onHoverEnd={() => setHoveredForum(null)}
              className="group"
            >
              <Card className="border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-white overflow-hidden h-full">
                {/* Cover Image */}
                <div className="relative h-48 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden">
                  {forum.cover_image ? (
                    <motion.img
                      src={forum.cover_image}
                      alt={forum.name}
                      className="w-full h-full object-cover"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <motion.div
                        animate={{
                          scale: hoveredForum === forum.id ? 1.1 : 1,
                          rotate: hoveredForum === forum.id ? 5 : 0,
                        }}
                        transition={{ duration: 0.3 }}
                        className="text-center text-gray-400"
                      >
                        <MessageSquare className="h-16 w-16 mx-auto mb-3" />
                        <p className="text-sm font-medium">讨论版块</p>
                      </motion.div>
                    </div>
                  )}

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

                  {/* Hover overlay */}
                  <AnimatePresence>
                    {hoveredForum === forum.id && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-blue-600/20 flex items-center justify-center"
                      >
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium text-gray-700"
                        >
                          点击进入版块
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Thread count badge */}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium text-gray-700">
                    {forum.thread_count} 个主题
                  </div>
                </div>

                {/* Content */}
                <CardContent className="p-6 flex-1 flex flex-col">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-3">
                      <Link
                        href={`/forums/${forum.slug}`}
                        className="text-gray-900 hover:text-blue-600 transition-colors group-hover:text-blue-600"
                      >
                        {forum.name}
                      </Link>
                    </CardTitle>
                    <CardDescription className="text-gray-600 text-base leading-relaxed line-clamp-3">
                      {forum.description}
                    </CardDescription>
                  </div>

                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <MessageSquare className="h-4 w-4" />
                      <span className="font-medium">{forum.thread_count || 0}</span>
                      <span>个主题</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Users2 className="h-3 w-3" />
                      <span>活跃讨论</span>
                    </div>
                  </div>

                  {/* Activity indicator */}
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: hoveredForum === forum.id ? "100%" : "0%" }}
                    transition={{ duration: 0.3 }}
                    className="h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-3"
                  />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Empty State */}
      {filteredForums.length === 0 && !loading && (
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
              {searchQuery ? "未找到匹配的版块" : "暂无版块"}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery ? "尝试使用不同的关键词搜索" : "成为第一个创建版块的用户！"}
            </p>
            {!searchQuery && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button asChild size="lg">
                  <Link href="/forums/create">创建版块</Link>
                </Button>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  )
}
