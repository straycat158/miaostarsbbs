"use client"

import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import UnifiedContentEditor from "@/components/editor/unified-content-editor"
import { supabase } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"

export default function CreateThreadPage() {
  const router = useRouter()
  const params = useParams()
  const [forum, setForum] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchForum = async () => {
      // Decode and normalize the slug
      const rawSlug = Array.isArray(params.slug) ? params.slug[0] : params.slug
      const slug = decodeURIComponent(rawSlug).toLowerCase()

      const { data, error } = await supabase.from("forums").select("*").eq("slug", slug).maybeSingle()

      if (error || !data) {
        console.error("Error fetching forum for thread creation:", error)
        toast({
          title: "错误",
          description: "版块不存在或无法加载",
          variant: "destructive",
        })
        router.push("/forums")
        return
      }

      setForum(data)
      setLoading(false)
    }

    fetchForum()
  }, [params.slug, router])

  const handleCreateThread = async (content: any) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast({
          title: "错误",
          description: "请先登录",
          variant: "destructive",
        })
        return
      }

      const { data, error } = await supabase
        .from("threads")
        .insert({
          title: content.title,
          content: content.content,
          forum_id: forum.id,
          created_by: user.id,
          is_pinned: content.isPinned || false,
          is_locked: content.isLocked || false,
          cover_image: content.coverImage || null,
          images: content.images || [],
        })
        .select()
        .single()

      if (error) throw error

      router.push(`/forums/${params.slug}/threads/${data.id}`)
    } catch (error: any) {
      throw new Error(error.message || "创建主题失败")
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <UnifiedContentEditor
        mode="thread"
        contextId={forum.id}
        contextData={{
          forumName: forum.name,
        }}
        onPublish={handleCreateThread}
      />
    </div>
  )
}
