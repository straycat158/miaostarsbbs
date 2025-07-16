"use client"

import { useRouter } from "next/navigation"
import UnifiedContentEditor from "@/components/editor/unified-content-editor"
import { supabase } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"

export default function CreateForumPage() {
  const router = useRouter()

  const handleCreateForum = async (content: any) => {
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

      // Create slug from title
      const slug = content.title
        .toLowerCase()
        .replace(/[^a-z0-9\u4e00-\u9fff]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")

      const { data, error } = await supabase
        .from("forums")
        .insert({
          name: content.title,
          description: content.content,
          slug: slug,
          created_by: user.id,
          cover_image: content.coverImage || null,
          images: content.images || [],
        })
        .select()
        .single()

      if (error) throw error

      router.push(`/forums/${slug}`)
    } catch (error: any) {
      throw new Error(error.message || "创建版块失败")
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <UnifiedContentEditor mode="forum" onPublish={handleCreateForum} />
    </div>
  )
}
