"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

export function useNotifications() {
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUnreadCount()

    // 设置实时订阅
    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${supabase.auth.getUser().then(({ data }) => data.user?.id)}`,
        },
        () => {
          fetchUnreadCount()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchUnreadCount = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setUnreadCount(0)
        setLoading(false)
        return
      }

      const { count, error } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_read", false)

      if (error) throw error

      setUnreadCount(count || 0)
    } catch (error) {
      console.error("Error fetching unread count:", error)
      setUnreadCount(0)
    } finally {
      setLoading(false)
    }
  }

  return { unreadCount, loading, refetch: fetchUnreadCount }
}
