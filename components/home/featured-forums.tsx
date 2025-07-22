"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageSquare, Users, TrendingUp, Clock, ArrowRight } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"

interface Forum {
  id: string
  name: string
  description: string
  slug: string
  cover_image?: string
  thread_count: number
  post_count: number
  latest_activity?: string
  category?: string
}

export default function FeaturedForums() {
  const [forums, setForums] = useState<Forum[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState("all")

  useEffect(() => {
    fetchForums()
  }, [])

  const fetchForums = async () => {
    try {
      const { data: forumsData, error } = await supabase
        .from("forums")
        .select(`
          id,
          name,
          description,
          slug,
          cover_image,
          category,
          threads!inner(
            id,
            created_at,
            posts(count)
          )
        `)
        .limit(12)

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
          category: forum.category || "general",
          thread_count: threadCount,
          post_count: postCount,
          latest_activity: latestThread?.created_at,
        }
      })

      // Sort by activity (thread count + post count)
      processedForums.sort((a, b) => b.thread_count + b.post_count - (a.thread_count + a.post_count))

      setForums(processedForums)
    } catch (error) {
      console.error("Error fetching forums:", error)
    } finally {
      setLoading(false)
    }
  }

  const getCategories = () => {
    const categories = forums.map((forum) => forum.category || "general")
    return ["all", ...Array.from(new Set(categories))]
  }

  const filteredForums = activeCategory === "all" ? forums : forums.filter((forum) => forum.category === activeCategory)

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
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
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

  return (
    <div className="space-y-6">
      {/* Category Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {getCategories().map((category) => (
          <Button
            key={category}
            variant={activeCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory(category)}
            className="capitalize"
          >
            {category === "all" ? "全部版块" : category}
          </Button>
        ))}
      </div>

      {/* Forums Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredForums.map((forum, index) => (
          <motion.div key={forum.id} variants={itemVariants} whileHover={{ y: -5 }} className="group">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-full bg-white/80 backdrop-blur-sm overflow-hidden">
              {/* Cover Image */}
              <div className="relative h-40 bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden">
                {forum.cover_image ? (
                  <img
                    src={forum.cover_image || "/placeholder.svg"}
                    alt={forum.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <MessageSquare className="h-12 w-12 text-gray-400" />
                  </div>
                )}

                {/* Category Badge */}
                {forum.category && (
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-white/80 backdrop-blur-sm text-gray-800 capitalize">{forum.category}</Badge>
                  </div>
                )}

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>

              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                      <Link href={`/forums/${forum.slug}`} className="hover:underline">
                        {forum.name}
                      </Link>
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

                  {/* View Forum Link */}
                  <div className="pt-2">
                    <Link
                      href={`/forums/${forum.slug}`}
                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 group-hover:gap-2 transition-all"
                    >
                      查看版块 <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* View All Button */}
      <div className="text-center mt-8">
        <Button asChild size="lg" className="px-8">
          <Link href="/forums">
            查看全部版块
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
