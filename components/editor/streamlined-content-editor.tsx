"use client"

import type React from "react"
import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Send, ImageIcon, X, Loader2, Edit3 } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { uploadContentImage, deleteContentImage, validateContentImage, type UploadedImage } from "@/lib/content-storage"
import { supabase } from "@/lib/supabase"

interface StreamlinedEditorProps {
  mode: "forum" | "thread" | "reply"
  contextData?: {
    forumName?: string
    threadTitle?: string
    parentContent?: string
  }
  onPublish: (content: ContentData) => Promise<void>
  initialData?: Partial<ContentData>
}

interface ContentData {
  title?: string
  content: string
  images: UploadedImage[]
}

export default function StreamlinedContentEditor({
  mode,
  contextData,
  onPublish,
  initialData,
}: StreamlinedEditorProps) {
  const [content, setContent] = useState<ContentData>({
    title: initialData?.title || "",
    content: initialData?.content || "",
    images: initialData?.images || [],
  })

  const [isPublishing, setIsPublishing] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragOver, setDragOver] = useState(false)
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

  const insertImageAtCursor = (imageUrl: string, imageName: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const imageMarkdown = `\n![${imageName}](${imageUrl})\n`
    const currentContent = content.content
    const newContent = currentContent.substring(0, start) + imageMarkdown + currentContent.substring(end)

    setContent((prev) => ({ ...prev, content: newContent }))

    setTimeout(() => {
      textarea.focus()
      const newPosition = start + imageMarkdown.length
      textarea.setSelectionRange(newPosition, newPosition)
    }, 0)
  }

  const handleFileUpload = useCallback(async (files: FileList) => {
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

      setContent((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedImages],
      }))

      // Insert first image at cursor position
      if (uploadedImages.length > 0) {
        insertImageAtCursor(uploadedImages[0].url, uploadedImages[0].name)
      }

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

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      handleFileUpload(files)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const files = e.dataTransfer.files
    if (files) {
      handleFileUpload(files)
    }
  }

  const handleRemoveImage = async (imageToRemove: UploadedImage) => {
    try {
      await deleteContentImage(imageToRemove.id)

      setContent((prev) => ({
        ...prev,
        images: prev.images.filter((img) => img.id !== imageToRemove.id),
      }))

      // Remove image from content text
      const imageMarkdown = `![${imageToRemove.name}](${imageToRemove.url})`
      setContent((prev) => ({
        ...prev,
        content: prev.content.replace(imageMarkdown, ""),
      }))

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
      await onPublish(content)
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

  const renderContentWithImages = () => {
    if (!content.content) return "开始输入您的内容..."

    const lines = content.content.split("\n")
    return lines.map((line, index) => {
      // Check if line contains image markdown
      const imageMatch = line.match(/!\[([^\]]*)\]$$([^)]+)$$/)
      if (imageMatch) {
        const [, altText, imageUrl] = imageMatch
        const image = content.images.find((img) => img.url === imageUrl)

        return (
          <div key={index} className="my-4 relative group">
            <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
              <img src={imageUrl || "/placeholder.svg"} alt={altText} className="w-full max-h-96 object-contain" />
              {image && (
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleRemoveImage(image)}
                    title="删除图片"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-2 text-center">{altText || "图片"}</p>
          </div>
        )
      }

      return line ? (
        <p key={index} className="mb-2 leading-relaxed">
          {line}
        </p>
      ) : (
        <br key={index} />
      )
    })
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl text-gray-900 flex items-center gap-2">
            <Edit3 className="h-6 w-6 text-blue-600" />
            {getEditorTitle()}
          </CardTitle>
          {contextData?.parentContent && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
              <p className="text-sm text-gray-600 mb-2">回复内容:</p>
              <p className="text-gray-800 line-clamp-3">{contextData.parentContent}</p>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Title Input */}
          {mode !== "reply" && (
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                {mode === "forum" ? "版块名称" : "主题标题"}
              </Label>
              <Input
                id="title"
                placeholder={mode === "forum" ? "输入版块名称..." : "输入主题标题..."}
                value={content.title}
                onChange={(e) => setContent((prev) => ({ ...prev, title: e.target.value }))}
                className="text-lg h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Integrated Content Editor */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="content" className="text-sm font-medium text-gray-700">
                内容
              </Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2"
                >
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
                  <span>{uploading ? "上传中..." : "添加图片"}</span>
                </Button>
              </div>
            </div>

            {/* Upload Progress */}
            {uploading && (
              <div className="space-y-2">
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-sm text-gray-600 text-center">上传进度: {Math.round(uploadProgress)}%</p>
              </div>
            )}

            {/* Drag and Drop Area */}
            <div
              className={`relative border-2 border-dashed rounded-lg transition-colors ${
                dragOver ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Textarea
                ref={textareaRef}
                id="content"
                placeholder="输入您的内容... 您可以直接拖拽图片到此处或点击上方按钮上传图片"
                value={content.content}
                onChange={(e) => setContent((prev) => ({ ...prev, content: e.target.value }))}
                className="min-h-[300px] text-base leading-relaxed border-0 resize-none focus:ring-0 focus:outline-none bg-transparent"
              />

              {dragOver && (
                <div className="absolute inset-0 flex items-center justify-center bg-blue-50 bg-opacity-90 rounded-lg">
                  <div className="text-center">
                    <ImageIcon className="h-12 w-12 text-blue-500 mx-auto mb-2" />
                    <p className="text-blue-600 font-medium">拖放图片到此处上传</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Live Preview */}
          {content.content && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">预览</Label>
              <Card className="border border-gray-200 bg-gray-50">
                <CardContent className="p-4">
                  <div className="prose max-w-none">{renderContentWithImages()}</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
            <Button
              onClick={handlePublish}
              disabled={isPublishing || uploading}
              className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Send className="mr-2 h-4 w-4" />
              {isPublishing ? "发布中..." : getPublishButtonText()}
            </Button>
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              取消
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />
    </div>
  )
}
