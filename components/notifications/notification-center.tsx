"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bell, CheckCheck, MessageCircle, AtSign, FileText, X } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"

interface Notification {
  id: string
  type: "reply" | "mention" | "thread_update"
  title: string
  message: string
  is_read: boolean
  created_at: string
  thread_id?: string
  post_id?: string
  related_id?: string
  sender?: {
    username: string
    avatar_url?: string
  }
}

interface NotificationCenterProps {
  isOpen: boolean
  onClose: () => void
}

export default function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [notificationLinks, setNotificationLinks] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isOpen) {
      fetchNotifications()
    }
  }, [isOpen])

  const fetchNotifications = async () => {
    try {
      setLoading(true)

      // 获取当前用户
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // 获取通知
      const { data: notificationsData, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50)

      if (error) throw error

      // 获取发送者信息和生成链接
      const notificationsWithSenders = await Promise.all(
        (notificationsData || []).map(async (notification) => {
          let sender = null
          if (notification.sender_id) {
            const { data: senderData } = await supabase
              .from("profiles")
              .select("username, avatar_url")
              .eq("id", notification.sender_id)
              .single()
            sender = senderData
          }
          return { ...notification, sender }
        }),
      )

      // 生成通知链接
      const links: Record<string, string> = {}
      await Promise.all(
        notificationsWithSenders.map(async (notification) => {
          if (notification.thread_id) {
            try {
              const { data: threadData } = await supabase
                .from("threads")
                .select(`
                id,
                forums!inner(slug)
              `)
                .eq("id", notification.thread_id)
                .single()

              if (threadData && threadData.forums) {
                links[notification.id] = `/forums/${threadData.forums.slug}/threads/${notification.thread_id}`
              } else {
                links[notification.id] = "#"
              }
            } catch (error) {
              console.error("Error getting thread forum:", error)
              links[notification.id] = "#"
            }
          } else {
            links[notification.id] = "#"
          }
        }),
      )

      setNotificationLinks(links)
      setNotifications(notificationsWithSenders)
    } catch (error) {
      console.error("Error fetching notifications:", error)
      toast({
        title: "获取通知失败",
        description: "无法加载通知列表",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", notificationId)

      if (error) throw error

      setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n)))
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .eq("is_read", false)

      if (error) throw error

      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))

      toast({
        title: "已标记全部已读",
        description: "所有通知已标记为已读",
      })
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
      toast({
        title: "操作失败",
        description: "无法标记所有通知为已读",
        variant: "destructive",
      })
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "reply":
        return <MessageCircle className="h-4 w-4 text-blue-500" />
      case "mention":
        return <AtSign className="h-4 w-4 text-green-500" />
      case "thread_update":
        return <FileText className="h-4 w-4 text-orange-500" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id)
    }
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose}>
      <div
        className="fixed right-4 top-16 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-lg shadow-xl border"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">通知中心</CardTitle>
            <div className="flex items-center gap-2">
              {notifications.some((n) => !n.is_read) && (
                <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs">
                  <CheckCheck className="h-3 w-3 mr-1" />
                  全部已读
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <ScrollArea className="h-96">
            {loading ? (
              <div className="p-4 space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-start gap-3 p-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>暂无通知</p>
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map((notification) => (
                  <Link
                    key={notification.id}
                    href={notificationLinks[notification.id] || "#"}
                    onClick={() => handleNotificationClick(notification)}
                    className="block hover:bg-gray-50 transition-colors"
                  >
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p
                                className={`text-sm font-medium ${!notification.is_read ? "text-gray-900" : "text-gray-600"}`}
                              >
                                {notification.title}
                              </p>
                              <p
                                className={`text-xs mt-1 ${!notification.is_read ? "text-gray-700" : "text-gray-500"}`}
                              >
                                {notification.message}
                              </p>
                            </div>

                            {!notification.is_read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                            )}
                          </div>

                          <div className="flex items-center gap-2 mt-2">
                            {notification.sender && (
                              <div className="flex items-center gap-1">
                                <Avatar className="h-4 w-4">
                                  <AvatarImage src={notification.sender.avatar_url || "/placeholder.svg"} />
                                  <AvatarFallback className="text-xs">
                                    {notification.sender.username?.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs text-gray-500">{notification.sender.username}</span>
                              </div>
                            )}
                            <span className="text-xs text-gray-400">
                              {formatDistanceToNow(new Date(notification.created_at), {
                                addSuffix: true,
                                locale: zhCN,
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </div>
    </div>
  )
}
