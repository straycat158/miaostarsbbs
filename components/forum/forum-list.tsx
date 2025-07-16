"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, MessageSquare, TrendingUp, Users2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface Forum {
  id: string
  name: string
  description: string
  slug: string
  thread_count?: number
}

export default function ForumList() {
  const [forums, setForums] = useState<Forum[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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
      }
      setLoading(false)
    }

    fetchForums()
  }, [])

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
              <CardHeader className="pb-4">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
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
          <h1 className="text-3xl font-bold text-gray-900">论坛版块</h1>
          <p className="text-gray-600 text-lg">探索我们的社区讨论</p>
        </div>
        <Button asChild className="self-start sm:self-auto">
          <Link href="/forums/create">
            <Plus className="mr-2 h-4 w-4" />
            创建版块
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {forums.map((forum) => (
          <Card
            key={forum.id}
            className="group hover:shadow-lg transition-all duration-200 border-0 shadow-md bg-white"
          >
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl mb-2">
                    <Link
                      href={`/forums/${forum.slug}`}
                      className="text-gray-900 hover:text-blue-600 transition-colors group-hover:text-blue-600"
                    >
                      {forum.name}
                    </Link>
                  </CardTitle>
                  <CardDescription className="text-gray-600 text-base leading-relaxed">
                    {forum.description}
                  </CardDescription>
                </div>
                <TrendingUp className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
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
            </CardContent>
          </Card>
        ))}
      </div>

      {forums.length === 0 && (
        <div className="text-center py-16 bg-gray-50 rounded-2xl">
          <div className="max-w-md mx-auto">
            <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
              <MessageSquare className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">暂无版块</h3>
            <p className="text-gray-600 mb-6">成为第一个创建版块的用户！</p>
            <Button asChild size="lg">
              <Link href="/forums/create">创建版块</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
