"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Camera,
  Upload,
  Save,
  User,
  Mail,
  Calendar,
  MapPin,
  LinkIcon,
  Loader2,
  Check,
  X,
  AlertCircle,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { uploadAvatar, deleteAvatar, validateImageFile } from "@/lib/storage"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface ProfileData {
  id: string
  username: string
  full_name: string
  bio: string
  avatar_url: string
  email: string
  created_at: string
  role: string
  location?: string
  website?: string
}

export default function ProfileEditor() {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [successMessage, setSuccessMessage] = useState("")

  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth")
        return
      }

      const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      if (error) {
        throw error
      }

      setProfile({
        ...profile,
        email: user.email || "",
      })
    } catch (error: any) {
      toast({
        title: "错误",
        description: "获取用户信息失败",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    if (!profile) return

    setProfile((prev) => (prev ? { ...prev, [field]: value } : null))

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file
    const validationError = validateImageFile(file)
    if (validationError) {
      toast({
        title: "文件错误",
        description: validationError,
        variant: "destructive",
      })
      return
    }

    setSelectedFile(file)

    // Create preview URL
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleAvatarUpload = async (): Promise<string | null> => {
    if (!selectedFile || !profile) return null

    setUploading(true)
    try {
      // Delete old avatar if exists
      if (profile.avatar_url) {
        await deleteAvatar(profile.avatar_url)
      }

      // Upload new avatar
      const avatarUrl = await uploadAvatar(selectedFile, profile.id)
      return avatarUrl
    } catch (error: any) {
      toast({
        title: "上传失败",
        description: error.message,
        variant: "destructive",
      })
      return null
    } finally {
      setUploading(false)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!profile?.username?.trim()) {
      newErrors.username = "用户名不能为空"
    } else if (profile.username.length < 2) {
      newErrors.username = "用户名至少需要2个字符"
    } else if (!/^[a-zA-Z0-9_\u4e00-\u9fff]+$/.test(profile.username)) {
      newErrors.username = "用户名只能包含字母、数字、下划线和中文"
    }

    if (!profile?.full_name?.trim()) {
      newErrors.full_name = "显示名称不能为空"
    } else if (profile.full_name.length > 50) {
      newErrors.full_name = "显示名称不能超过50个字符"
    }

    if (profile?.bio && profile.bio.length > 500) {
      newErrors.bio = "个人简介不能超过500个字符"
    }

    if (profile?.website && profile.website.trim()) {
      try {
        new URL(profile.website)
      } catch {
        newErrors.website = "请输入有效的网址"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!profile || !validateForm()) return

    setSaving(true)
    setSuccessMessage("")

    try {
      let avatarUrl = profile.avatar_url

      // Upload new avatar if selected
      if (selectedFile) {
        const newAvatarUrl = await handleAvatarUpload()
        if (newAvatarUrl) {
          avatarUrl = newAvatarUrl
        } else {
          return // Upload failed
        }
      }

      // Update profile in database
      const { error } = await supabase
        .from("profiles")
        .update({
          username: profile.username.trim(),
          full_name: profile.full_name.trim(),
          bio: profile.bio?.trim() || null,
          avatar_url: avatarUrl,
          location: profile.location?.trim() || null,
          website: profile.website?.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id)

      if (error) {
        throw error
      }

      // Update local state
      setProfile((prev) => (prev ? { ...prev, avatar_url: avatarUrl } : null))
      setSelectedFile(null)
      setPreviewUrl(null)
      setSuccessMessage("个人资料更新成功！")

      toast({
        title: "保存成功",
        description: "您的个人资料已更新",
      })

      // Refresh the page to update header avatar
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error: any) {
      toast({
        title: "保存失败",
        description: error.message || "更新个人资料时出现错误",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCancelAvatarChange = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-24 w-24 bg-gray-200 rounded-full"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>无法加载用户信息，请刷新页面重试。</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Success Message */}
      {successMessage && (
        <Alert className="border-green-200 bg-green-50">
          <Check className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* Profile Header */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-gray-900 flex items-center gap-2">
            <User className="h-6 w-6" />
            编辑个人资料
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Avatar Section */}
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                <AvatarImage src={previewUrl || profile.avatar_url || "/placeholder.svg"} alt={profile.username} />
                <AvatarFallback className="text-2xl">{profile.username?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>

              {uploading && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                  <Loader2 className="h-6 w-6 text-white animate-spin" />
                </div>
              )}
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">头像设置</h3>
                <p className="text-sm text-gray-600 mb-4">支持 JPG、PNG 格式，文件大小不超过 5MB</p>

                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    选择图片
                  </Button>

                  {selectedFile && (
                    <Button type="button" variant="ghost" onClick={handleCancelAvatarChange} disabled={uploading}>
                      <X className="mr-2 h-4 w-4" />
                      取消
                    </Button>
                  )}
                </div>

                {selectedFile && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 text-sm text-blue-800">
                      <Upload className="h-4 w-4" />
                      <span>已选择: {selectedFile.name}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>加入于 {new Date(profile.created_at).toLocaleDateString("zh-CN")}</span>
                </div>
                <Badge variant={profile.role === "admin" ? "default" : "secondary"}>
                  {profile.role === "admin" ? "管理员" : profile.role === "moderator" ? "版主" : "用户"}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Basic Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">基本信息</h3>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium">
                  用户名 *
                </Label>
                <Input
                  id="username"
                  value={profile.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  className={errors.username ? "border-red-500" : ""}
                  placeholder="输入用户名"
                />
                {errors.username && <p className="text-sm text-red-600">{errors.username}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-sm font-medium">
                  显示名称 *
                </Label>
                <Input
                  id="full_name"
                  value={profile.full_name}
                  onChange={(e) => handleInputChange("full_name", e.target.value)}
                  className={errors.full_name ? "border-red-500" : ""}
                  placeholder="输入显示名称"
                />
                {errors.full_name && <p className="text-sm text-red-600">{errors.full_name}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                邮箱地址
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input id="email" value={profile.email} disabled className="pl-10 bg-gray-50" />
              </div>
              <p className="text-xs text-gray-500">邮箱地址无法修改</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="text-sm font-medium">
                个人简介
              </Label>
              <Textarea
                id="bio"
                value={profile.bio || ""}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                className={errors.bio ? "border-red-500" : ""}
                placeholder="介绍一下自己..."
                rows={4}
              />
              <div className="flex justify-between items-center">
                {errors.bio && <p className="text-sm text-red-600">{errors.bio}</p>}
                <p className="text-xs text-gray-500 ml-auto">{profile.bio?.length || 0}/500</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Additional Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">其他信息</h3>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm font-medium">
                  所在地
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="location"
                    value={profile.location || ""}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    className="pl-10"
                    placeholder="城市, 国家"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website" className="text-sm font-medium">
                  个人网站
                </Label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="website"
                    value={profile.website || ""}
                    onChange={(e) => handleInputChange("website", e.target.value)}
                    className={`pl-10 ${errors.website ? "border-red-500" : ""}`}
                    placeholder="https://example.com"
                  />
                </div>
                {errors.website && <p className="text-sm text-red-600">{errors.website}</p>}
              </div>
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button onClick={handleSave} disabled={saving || uploading} className="flex-1 sm:flex-none">
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  保存中...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  保存更改
                </>
              )}
            </Button>

            <Button variant="outline" onClick={() => router.back()} disabled={saving || uploading}>
              取消
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Hidden File Input */}
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
    </div>
  )
}
