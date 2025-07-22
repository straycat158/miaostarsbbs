"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"
import BlockBasedEditor from "@/components/editor/block-based-editor"

export default function CreateForumPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth")
        return
      }

      setUser(user)
    } catch (error) {
      console.error("Error checking user:", error)
      router.push("/auth")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateForum = async (content: any) => {
    try {
      if (!user) {
        throw new Error("请先登录")
      }

      const { data, error } = await supabase
        .from("forums")
        .insert({
          name: content.title,
          description: content.blocks?.find((b: any) => b.type === "text")?.content || "",
          slug: content.title
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^\w-]/g, ""),
          created_by: user.id,
          blocks: content.blocks,
        })
        .select()
        .single()

      if (error) throw error

      toast({ title: "版块创建成功！" })
      router.push(`/forums/${data.slug}`)
    } catch (error: any) {
      console.error("Error creating forum:", error)
      throw new Error(error.message || "创建版块失败")
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">加载中...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <BlockBasedEditor mode="forum" onPublish={handleCreateForum} />
    </div>
  )
}
