"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"
import BlockBasedEditor from "@/components/editor/block-based-editor"

export default function CreateThreadPage() {
  const router = useRouter()
  const params = useParams()
  const [user, setUser] = useState<any>(null)
  const [forum, setForum] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUserAndForum()
  }, [params.slug])

  const checkUserAndForum = async () => {
    try {
      // Check user authentication
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        console.error("User authentication error:", userError)
        toast({
          title: "错误",
          description: "请先登录",
          variant: "destructive",
        })
        router.push("/auth")
        return
      }

      // Get forum slug from params
      const rawSlug = Array.isArray(params.slug) ? params.slug[0] : params.slug
      if (!rawSlug) {
        toast({
          title: "错误",
          description: "无效的版块地址",
          variant: "destructive",
        })
        router.push("/forums")
        return
      }

      // Decode and normalize the slug
      const slug = decodeURIComponent(rawSlug).toLowerCase()
      console.log("Looking for forum with slug:", slug)

      // Fetch forum data
      const { data: forumData, error: forumError } = await supabase
        .from("forums")
        .select("*")
        .eq("slug", slug)
        .maybeSingle()

      if (forumError) {
        console.error("Forum fetch error:", forumError)
        toast({
          title: "错误",
          description: "获取版块信息失败",
          variant: "destructive",
        })
        router.push("/forums")
        return
      }

      if (!forumData) {
        console.error("Forum not found for slug:", slug)
        // Try to find forum with case-insensitive search
        const { data: alternativeForums, error: altError } = await supabase
          .from("forums")
          .select("*")
          .ilike("slug", slug)
          .limit(1)

        if (altError || !alternativeForums || alternativeForums.length === 0) {
          toast({
            title: "错误",
            description: "版块不存在",
            variant: "destructive",
          })
          router.push("/forums")
          return
        }

        // Use the found forum
        setForum(alternativeForums[0])
        setUser(user)
      } else {
        setForum(forumData)
        setUser(user)
      }
    } catch (error) {
      console.error("Error in checkUserAndForum:", error)
      toast({
        title: "错误",
        description: "系统错误，请稍后重试",
        variant: "destructive",
      })
      router.push("/forums")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateThread = async (content: any) => {
    try {
      if (!user || !forum) {
        throw new Error("用户或版块信息缺失")
      }

      console.log("Creating thread with content:", content)

      const { data, error } = await supabase
        .from("threads")
        .insert({
          title: content.title,
          content: content.blocks?.find((b: any) => b.type === "text")?.content || "",
          forum_id: forum.id,
          created_by: user.id,
          blocks: content.blocks,
        })
        .select()
        .single()

      if (error) {
        console.error("Thread creation error:", error)
        throw error
      }

      console.log("Thread created successfully:", data)
      toast({ title: "主题发布成功！" })
      router.push(`/forums/${forum.slug}/threads/${data.id}`)
    } catch (error: any) {
      console.error("Error creating thread:", error)
      throw new Error(error.message || "发布主题失败")
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">加载中...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-600">请先登录</p>
        </div>
      </div>
    )
  }

  if (!forum) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-600">版块不存在</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <BlockBasedEditor mode="thread" contextData={{ forumName: forum.name }} onPublish={handleCreateThread} />
    </div>
  )
}
