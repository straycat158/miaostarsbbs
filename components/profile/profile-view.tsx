"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { User, Calendar, MapPin, LinkIcon, MessageSquare, Edit } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"
import Link from "next/link"

interface ProfileData {
  id: string
  username: string
  full_name: string
  bio: string
  avatar_url: string
  created_at: string
  role: string
  location?: string
  website?: string
}

interface ProfileViewProps {
  username: string
}

export default function ProfileView({ username }: ProfileViewProps) {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    threads: 0,
    posts: 0,
  })

  useEffect(() => {
    fetchProfile()
    getCurrentUser()
  }, [username])

  const getCurrentUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    setCurrentUser(user)
  }

  const fetchProfile = async () => {
    try {
      const { data: profile, error } = await supabase.from("profiles").select("*").eq("username", username).single()

      if (error) {
        throw error
      }

      setProfile(profile)

      // Fetch user stats
      const [threadsResult, postsResult] = await Promise.all([
        supabase.from("threads").select("id", { count: "exact" }).eq("created_by", profile.id),
        supabase.from("posts").select("id", { count: "exact" }).eq("created_by", profile.id),
      ])

      setStats({
        threads: threadsResult.count || 0,
        posts: postsResult.count || 0,
      })
    } catch (error: any) {
      console.error("Error fetching profile:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="animate-pulse">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 bg-gray-200 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-6 bg-gray-200 rounded w-32"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">用户不存在</h3>
        <p className="text-gray-600">找不到用户名为 "{username}" 的用户</p>
      </div>
    )
  }

  const isOwnProfile = currentUser?.id === profile.id

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
              <AvatarImage src={profile.avatar_url || "/placeholder.svg"} alt={profile.username} />
              <AvatarFallback className="text-2xl">{profile.username?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-3">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{profile.full_name}</h1>
                <p className="text-gray-600">@{profile.username}</p>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    加入于{" "}
                    {formatDistanceToNow(new Date(profile.created_at), {
                      addSuffix: true,
                      locale: zhCN,
                    })}
                  </span>
                </div>

                <Badge variant={profile.role === "admin" ? "default" : "secondary"}>
                  {profile.role === "admin" ? "管理员" : profile.role === "moderator" ? "版主" : "用户"}
                </Badge>
              </div>

              {isOwnProfile && (
                <div className="flex gap-2">
                  <Button asChild size="sm">
                    <Link href="/settings">
                      <Edit className="mr-2 h-4 w-4" />
                      编辑资料
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Bio */}
          {profile.bio && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">个人简介</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
            </div>
          )}

          <Separator />

          {/* Additional Info */}
          <div className="grid gap-4 sm:grid-cols-2">
            {profile.location && (
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{profile.location}</span>
              </div>
            )}

            {profile.website && (
              <div className="flex items-center gap-2 text-gray-600">
                <LinkIcon className="h-4 w-4" />
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  个人网站
                </a>
              </div>
            )}
          </div>

          <Separator />

          {/* Stats */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">活动统计</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.threads}</div>
                <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  发布的主题
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.posts}</div>
                <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  发布的回复
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
