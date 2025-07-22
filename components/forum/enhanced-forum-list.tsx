"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"
import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import VerificationBadge from "@/components/ui/verification-badge"
import { useSupabaseClient } from "@supabase/auth-helpers-react"

interface Forum {
  id: string
  name: string
  description: string
  slug: string
  category: string
  created_at: string
  threads: { count: number }[]
  latest_thread?: {
    id: string
    title: string
    created_at: string
    profiles: {
      username: string
      avatar_url: string
      is_verified?: boolean
      verification_type?: string
    }
  }
}

interface EnhancedForumListProps {
  category?: string
}

const EnhancedForumList = ({ category }: EnhancedForumListProps) => {
  const [forums, setForums] = useState<Forum[] | null>(null)
  const supabase = useSupabaseClient()

  useEffect(() => {
    const fetchForums = async () => {
      let query = supabase
        .from("forums")
        .select(`
          *,
          threads(count),
          latest_thread:threads(
            id,
            title,
            created_at,
            profiles(username, avatar_url, is_verified, verification_type)
          )
        `)
        .order("created_at", { ascending: false })

      if (category) {
        query = query.eq("category", category)
      }

      const { data, error } = await query

      if (error) {
        console.error("Error fetching forums:", error)
      } else {
        setForums(data)
      }
    }

    fetchForums()
  }, [supabase, category])

  if (!forums) {
    return (
      <div className="grid gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="border rounded-md p-4">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      {forums.map((forum) => (
        <div key={forum.id} className="border rounded-md p-4">
          <h3 className="text-lg font-semibold">{forum.name}</h3>
          <p className="text-sm text-gray-500">{forum.description}</p>
          <div className="mt-2">
            <span className="text-sm text-gray-500">Threads: {forum.threads[0]?.count || 0}</span>
          </div>
          {forum.latest_thread && (
            <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
              <Avatar className="h-5 w-5">
                <AvatarImage src={forum.latest_thread.profiles?.avatar_url || "/placeholder.svg"} />
                <AvatarFallback className="text-xs">
                  {forum.latest_thread.profiles?.username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-1 min-w-0 flex-1">
                <span className="truncate">{forum.latest_thread.profiles?.username}</span>
                {forum.latest_thread.profiles?.is_verified && forum.latest_thread.profiles?.verification_type && (
                  <VerificationBadge verificationType={forum.latest_thread.profiles.verification_type} size="sm" />
                )}
              </div>
              <span className="text-xs whitespace-nowrap">
                {formatDistanceToNow(new Date(forum.latest_thread.created_at), {
                  addSuffix: true,
                  locale: zhCN,
                })}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default EnhancedForumList
