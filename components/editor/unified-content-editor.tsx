"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import {
  Bold,
  Italic,
  Underline,
  LinkIcon,
  FileText,
  Hash,
  Send,
  Eye,
  Save,
  X,
  Smile,
  AtSign,
  Pin,
  Lock,
  ImageIcon,
  Star,
  Loader2,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { uploadContentImage, deleteContentImage, validateContentImage, type UploadedImage } from "@/lib/content-storage"
import { supabase } from "@/lib/supabase"

interface ContentEditorProps {
  mode: "forum" | "thread" | "reply"
  contextId?: string
  contextData?: {
    forumName?: string
    threadTitle?: string
    parentContent?: string
  }
  onPublish: (content: ContentData) => Promise<void>
  onSaveDraft?: (content: ContentData) => Promise<void>
  initialData?: Partial<ContentData>
}

interface ContentData {
  title?: string
  content: string
  tags: string[]
  category?: string
  images: UploadedImage[]
  coverImage?: string
  isPinned?: boolean
  isLocked?: boolean
  publishType: "publish" | "draft"
  formatting: {
    bold: boolean
    italic: boolean
    underline: boolean
  }
}

export default function UnifiedContentEditor({
  mode,
  contextId,
  contextData,
  onPublish,
  onSaveDraft,
  initialData,
}: ContentEditorProps) {
  const [content, setContent] = useState<ContentData>({
    title: initialData?.title || "",
    content: initialData?.content || "",
    tags: initialData?.tags || [],
    category: initialData?.category || "",
    images: initialData?.images || [],
    coverImage: initialData?.coverImage || "",
    isPinned: initialData?.isPinned || false,
    isLocked: initialData?.isLocked || false,
    publishType: "publish",
    formatting: {
      bold: false,
      italic: false,
      underline: false,
    },
  })

  const [isPublishing, setIsPublishing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [currentTag, setCurrentTag] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const getEditorTitle = () => {
    switch (mode) {
      case "forum":
        return "创建新版块"
      case "thread":
        return `在 "${contextData?.forumName}" 发布新主题`
      case "reply":
        return `回复: ${contextData?.threadTitle}`
      default:
        return "发布内容"
    }
  }

  const getPublishButtonText = () => {
    switch (mode) {
      case "forum":
        return "创建版块"
      case "thread":
        return "发布主题"
      case "reply":
        return "发布回复"
      default:
        return "发布"
    }
  }

  const handleFormatting = (type: keyof ContentData["formatting"]) => {
    setContent((prev) => ({
      ...prev,
      formatting: {
        ...prev.formatting,
        [type]: !prev.formatting[type],
      },
    }))
  }

  const insertAtCursor = (text: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const currentContent = content.content
    const newContent = currentContent.substring(0, start) + text + currentContent.substring(end)

    setContent((prev) => ({ ...prev, content: newContent }))

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + text.length, start + text.length)
    }, 0)
  }

  const handleAddTag = () => {
    if (currentTag.trim() && !content.tags.includes(currentTag.trim())) {
      setContent((prev) => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()],
      }))
      setCurrentTag("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setContent((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

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

    setUploading(true)
    setUploadProgress(0)

    try {
      const uploadPromises = Array.from(files).map(async (file, index) => {
        // Validate file
        const validationError = validateContentImage(file)
        if (validationError) {
          throw new Error(validationError)
        }

        // Upload file
        const uploadedImage = await uploadContentImage(file, user.id)

        // Update progress
        setUploadProgress(((index + 1) / files.length) * 100)

        return uploadedImage
      })

      const uploadedImages = await Promise.all(uploadPromises)

      setContent((prev) => {
        const newImages = [...prev.images, ...uploadedImages]
        return {
          ...prev,
          images: newImages,
          // Set first uploaded image as cover if no cover exists
          coverImage: prev.coverImage || (newImages.length > 0 ? newImages[0].url : ""),
        }
      })

      toast({
        title: "上传成功",
        description: `成功上传 ${uploadedImages.length} 张图片`,
      })
    } catch (error: any) {
      toast({
        title: "上传失败",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }, [])

  const handleRemoveImage = async (imageToRemove: UploadedImage) => {
    try {
      await deleteContentImage(imageToRemove.id)

      setContent((prev) => {
        const newImages = prev.images.filter((img) => img.id !== imageToRemove.id)
        return {
          ...prev,
          images: newImages,
          // Update cover image if the removed image was the cover
          coverImage:
            prev.coverImage === imageToRemove.url ? (newImages.length > 0 ? newImages[0].url : "") : prev.coverImage,
        }
      })

      toast({
        title: "删除成功",
        description: "图片已删除",
      })
    } catch (error: any) {
      toast({
        title: "删除失败",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleSetCoverImage = (imageUrl: string) => {
    setContent((prev) => ({
      ...prev,
      coverImage: imageUrl,
    }))
    toast({
      title: "封面设置成功",
      description: "已设置为封面图片",
    })
  }

  const handlePublish = async () => {
    if (!content.content.trim()) {
      toast({
        title: "错误",
        description: "请输入内容",
        variant: "destructive",
      })
      return
    }

    if (mode !== "reply" && !content.title?.trim()) {
      toast({
        title: "错误",
        description: "请输入标题",
        variant: "destructive",
      })
      return
    }

    setIsPublishing(true)
    try {
      await onPublish({ ...content, publishType: "publish" })
      toast({ title: "发布成功！" })
    } catch (error: any) {
      toast({
        title: "发布失败",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsPublishing(false)
    }
  }

  const handleSaveDraft = async () => {
    if (!onSaveDraft) return

    setIsSaving(true)
    try {
      await onSaveDraft({ ...content, publishType: "draft" })
      toast({ title: "草稿已保存" })
    } catch (error: any) {
      toast({
        title: "保存失败",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl text-gray-900">{getEditorTitle()}</CardTitle>
          {contextData?.parentContent && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
              <p className="text-sm text-gray-600 mb-2">回复内容:</p>
              <p className="text-gray-800 line-clamp-3">{contextData.parentContent}</p>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="edit" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="edit" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                编辑
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                预览
              </TabsTrigger>
            </TabsList>

            <TabsContent value="edit" className="space-y-6 mt-6">
              {/* Title Input */}
              {mode !== "reply" && (
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium">
                    {mode === "forum" ? "版块名称" : "主题标题"}
                  </Label>
                  <Input
                    id="title"
                    placeholder={mode === "forum" ? "输入版块名称..." : "输入主题标题..."}
                    value={content.title}
                    onChange={(e) => setContent((prev) => ({ ...prev, title: e.target.value }))}
                    className="text-lg h-12"
                  />
                </div>
              )}

              {/* Category Selection */}
              {mode !== "reply" && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">分类</Label>
                  <Select
                    value={content.category}
                    onValueChange={(value) => setContent((prev) => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择分类..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">综合讨论</SelectItem>
                      <SelectItem value="technology">科技前沿</SelectItem>
                      <SelectItem value="gaming">游戏天地</SelectItem>
                      <SelectItem value="lifestyle">生活方式</SelectItem>
                      <SelectItem value="education">教育学习</SelectItem>
                      <SelectItem value="business">商业财经</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Formatting Toolbar */}
              <div className="border rounded-lg p-3 bg-gray-50">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant={content.formatting.bold ? "default" : "ghost"}
                      size="sm"
                      onClick={() => handleFormatting("bold")}
                    >
                      <Bold className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant={content.formatting.italic ? "default" : "ghost"}
                      size="sm"
                      onClick={() => handleFormatting("italic")}
                    >
                      <Italic className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant={content.formatting.underline ? "default" : "ghost"}
                      size="sm"
                      onClick={() => handleFormatting("underline")}
                    >
                      <Underline className="h-4 w-4" />
                    </Button>
                  </div>

                  <Separator orientation="vertical" className="h-6" />

                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => insertAtCursor("[链接](https://example.com)")}
                    >
                      <LinkIcon className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => insertAtCursor("@")}>
                      <AtSign className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => insertAtCursor("😊")}>
                      <Smile className="h-4 w-4" />
                    </Button>
                  </div>

                  <Separator orientation="vertical" className="h-6" />

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <ImageIcon className="mr-2 h-4 w-4" />
                    )}
                    <span>{uploading ? "上传中..." : "上传图片"}</span>
                  </Button>
                </div>

                {uploading && (
                  <div className="mt-3">
                    <Progress value={uploadProgress} className="w-full" />
                    <p className="text-sm text-gray-600 mt-1">上传进度: {Math.round(uploadProgress)}%</p>
                  </div>
                )}
              </div>

              {/* Content Textarea */}
              <div className="space-y-2">
                <Label htmlFor="content" className="text-sm font-medium">
                  内容
                </Label>
                <Textarea
                  ref={textareaRef}
                  id="content"
                  placeholder="输入您的内容..."
                  value={content.content}
                  onChange={(e) => setContent((prev) => ({ ...prev, content: e.target.value }))}
                  className="min-h-[200px] text-base leading-relaxed"
                />
              </div>

              {/* Images */}
              {content.images.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">图片 ({content.images.length})</Label>
                    {content.coverImage && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        已设置封面
                      </Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {content.images.map((image) => (
                      <div key={image.id} className="relative group">
                        <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-transparent hover:border-blue-500 transition-colors">
                          <img
                            src={image.url || "/placeholder.svg"}
                            alt={image.name}
                            className="w-full h-full object-cover"
                          />
                          {content.coverImage === image.url && (
                            <div className="absolute top-2 left-2">
                              <Badge className="bg-yellow-500 text-white">
                                <Star className="h-3 w-3 mr-1" />
                                封面
                              </Badge>
                            </div>
                          )}
                        </div>
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          {content.coverImage !== image.url && (
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => handleSetCoverImage(image.url)}
                              title="设为封面"
                            >
                              <Star className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => handleRemoveImage(image)}
                            title="删除图片"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 truncate">{image.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">标签</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="添加标签..."
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                    className="flex-1"
                  />
                  <Button type="button" onClick={handleAddTag} variant="outline">
                    <Hash className="h-4 w-4" />
                  </Button>
                </div>
                {content.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {content.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 hover:bg-transparent"
                          onClick={() => handleRemoveTag(tag)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Admin Options */}
              {mode === "thread" && (
                <div className="space-y-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <Label className="text-sm font-medium text-yellow-800">管理选项</Label>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Pin className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm">置顶主题</span>
                    </div>
                    <Switch
                      checked={content.isPinned}
                      onCheckedChange={(checked) => setContent((prev) => ({ ...prev, isPinned: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm">锁定主题</span>
                    </div>
                    <Switch
                      checked={content.isLocked}
                      onCheckedChange={(checked) => setContent((prev) => ({ ...prev, isLocked: checked }))}
                    />
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="preview" className="mt-6">
              <Card className="border border-gray-200">
                <CardHeader>
                  {content.title && <CardTitle className="text-xl">{content.title}</CardTitle>}
                  {content.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {content.tags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  {content.coverImage && (
                    <div className="mb-4">
                      <img
                        src={content.coverImage || "/placeholder.svg"}
                        alt="封面图片"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                  )}
                  <div className="prose max-w-none">
                    <p className="whitespace-pre-wrap leading-relaxed">{content.content || "暂无内容..."}</p>
                  </div>
                  {content.images.length > 1 && (
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                      {content.images
                        .filter((img) => img.url !== content.coverImage)
                        .map((image) => (
                          <div key={image.id} className="rounded-lg overflow-hidden">
                            <img
                              src={image.url || "/placeholder.svg"}
                              alt={image.name}
                              className="w-full h-32 object-cover"
                            />
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button onClick={handlePublish} disabled={isPublishing || uploading} className="flex-1 sm:flex-none">
              <Send className="mr-2 h-4 w-4" />
              {isPublishing ? "发布中..." : getPublishButtonText()}
            </Button>
            {onSaveDraft && (
              <Button variant="outline" onClick={handleSaveDraft} disabled={isSaving || uploading}>
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? "保存中..." : "保存草稿"}
              </Button>
            )}
            <Button variant="ghost" onClick={() => window.history.back()}>
              取消
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Hidden File Input */}
      <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleFileUpload} className="hidden" />
    </div>
  )
}
