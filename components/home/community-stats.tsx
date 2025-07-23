"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Users, MessageSquare, Calendar } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { motion } from "framer-motion"

interface CommunityStats {
  totalUsers: number
  totalThreads: number
  totalPosts: number
  todayActive: number
  totalViews: number
  forumsCount: number
}

export default function CommunityStats() {
  const [stats, setStats] = useState<CommunityStats>({
    totalUsers: 0,
    totalThreads: 0,
    totalPosts: 0,
    todayActive: 0,
    totalViews: 0,
    forumsCount: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // Get total users
      const { count: usersCount } = await supabase.from("profiles").select("*", { count: "exact", head: true })

      // Get total threads
      const { count: threadsCount } = await supabase.from("threads").select("*", { count: "exact", head: true })

      // Get total posts
      const { count: postsCount } = await supabase.from("posts").select("*", { count: "exact", head: true })

      // Get total forums
      const { count: forumsCount } = await supabase.from("forums").select("*", { count: "exact", head: true })

      // Get total views from threads
      const { data: viewsData } = await supabase.from("threads").select("view_count")

      const totalViews = viewsData?.reduce((sum, thread) => sum + (thread.view_count || 0), 0) || 0

      // Get today's active users (users who posted today)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const { count: todayActiveCount } = await supabase
        .from("posts")
        .select("user_id", { count: "exact", head: true })
        .gte("created_at", today.toISOString())

      setStats({
        totalUsers: usersCount || 0,
        totalThreads: threadsCount || 0,
        totalPosts: postsCount || 0,
        todayActive: todayActiveCount || 0,
        totalViews,
        forumsCount: forumsCount || 0,
      })
    } catch (error) {
      console.error("Error fetching community stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M"
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K"
    }
    return num.toString()
  }

  const statsData = [
    {
      title: "注册用户",
      value: stats.totalUsers,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "主题数量",
      value: stats.totalThreads,
      icon: MessageSquare,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "回复数量",
      value: stats.totalPosts,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "今日活跃",
      value: stats.todayActive,
      icon: Calendar,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ]

  if (loading) {
    return (
      <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary animate-pulse" />
            社区数据
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="text-center p-3 sm:p-4 bg-white rounded-lg shadow-sm animate-pulse">
                <div className="h-6 sm:h-8 bg-gray-200 rounded w-12 mx-auto mb-2"></div>
                <div className="h-3 sm:h-4 bg-gray-200 rounded w-16 mx-auto"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          社区数据
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {statsData.map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="text-center p-3 sm:p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${stat.bgColor} mb-2`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <div className="text-xl sm:text-2xl font-bold text-primary">{formatNumber(stat.value)}</div>
                <div className="text-xs sm:text-sm text-gray-600">{stat.title}</div>
              </motion.div>
            )
          })}
        </div>

        {/* Additional stats */}
        <div className="pt-3 border-t border-white/50">
          <div className="grid grid-cols-2 gap-3 text-center">
            <div>
              <div className="text-sm font-semibold text-gray-700">{formatNumber(stats.totalViews)}</div>
              <div className="text-xs text-gray-500">总浏览量</div>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-700">{stats.forumsCount}</div>
              <div className="text-xs text-gray-500">版块数量</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
