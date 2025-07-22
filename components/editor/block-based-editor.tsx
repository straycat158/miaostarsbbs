"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd"
import { Plus, ImageIcon, Type, GripVertical, X, Upload, Loader2, Send, Eye, EyeOff } from "lucide-react"
import { uploadContentImage } from "@/lib/content-storage"

interface ContentBlock {
  id: string
  type: "text" | "image"
  content: string
  image?: {
    id: string
    url: string
    name: string
  }
  order: number
}

interface BlockBasedEditorProps {
  mode: "thread" | "forum" | "reply"
  contextData?: {
    forumSlug?: string
    forumName?: string
    threadTitle?: string
    parentContent?: string
  }
  onPublish: (content: { title?: string; blocks: ContentBlock[] }) => Promise<void>
}

export default function BlockBasedEditor({ mode, contextData, onPublish }: BlockBasedEditorProps) {
  const [title, setTitle] = useState("")
  const [blocks, setBlocks] = useState<ContentBlock[]>([
    {
      id: "text-1",
      type: "text",
      content: "",
      order: 0,
    },
  ])
  const [isPublishing, setIsPublishing] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const addTextBlock = () => {
    const newBlock: ContentBlock = {
      id: `text-${Date.now()}`,
      type: "text",
      content: "",
      order: blocks.length,
    }
    setBlocks([...blocks, newBlock])
  }

  const addImageBlock = () => {
    fileInputRef.current?.click()
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const imageData = await uploadContentImage(file)
      const newBlock: ContentBlock = {
        id: `image-${Date.now()}`,
        type: "image",
        content: "",
        image: imageData,
        order: blocks.length,
      }
      setBlocks([...blocks, newBlock])
      toast({ title: "图片上传成功" })
    } catch (error) {
      console.error("Error uploading image:", error)
      toast({
        title: "图片上传失败",
        description: "请重试",
        variant: "destructive",
      })
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const updateBlock = (id: string, updates: Partial<ContentBlock>) => {
    setBlocks(blocks.map((block) => (block.id === id ? { ...block, ...updates } : block)))
  }

  const deleteBlock = (id: string) => {
    if (blocks.length <= 1) {
      toast({
        title: "无法删除",
        description: "至少需要保留一个内容块",
        variant: "destructive",
      })
      return
    }
    setBlocks(blocks.filter((block) => block.id !== id))
  }

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const items = Array.from(blocks)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    // Update order values
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index,
    }))

    setBlocks(updatedItems)
  }

  const handlePublish = async () => {
    if (mode !== "reply" && !title.trim()) {
      toast({
        title: "请输入标题",
        variant: "destructive",
      })
      return
    }

    const hasContent = blocks.some((block) => {
      if (block.type === "text") return block.content.trim()
      if (block.type === "image") return block.image
      return false
    })

    if (!hasContent) {
      toast({
        title: "请添加内容",
        variant: "destructive",
      })
      return
    }

    try {
      setIsPublishing(true)
      await onPublish({
        title: mode !== "reply" ? title : undefined,
        blocks: blocks.filter((block) => {
          if (block.type === "text") return block.content.trim()
          if (block.type === "image") return block.image
          return false
        }),
      })
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

  const renderBlock = (block: ContentBlock, index: number) => (
    <Draggable key={block.id} draggableId={block.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`group relative ${snapshot.isDragging ? "opacity-50" : ""}`}
        >
          <Card className="border border-gray-200 hover:border-gray-300 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div
                  {...provided.dragHandleProps}
                  className="flex-shrink-0 mt-2 p-1 rounded hover:bg-gray-100 cursor-grab active:cursor-grabbing"
                >
                  <GripVertical className="h-4 w-4 text-gray-400" />
                </div>

                <div className="flex-1 min-w-0">
                  {block.type === "text" ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          <Type className="mr-1 h-3 w-3" />
                          文本
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteBlock(block.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <Textarea
                        placeholder="输入文本内容..."
                        value={block.content}
                        onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                        className="min-h-[100px] resize-none border-0 p-0 focus-visible:ring-0 text-base leading-relaxed"
                        style={{
                          wordBreak: "break-all",
                          overflowWrap: "anywhere",
                          hyphens: "auto",
                        }}
                      />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          <ImageIcon className="mr-1 h-3 w-3" />
                          图片
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteBlock(block.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      {block.image && (
                        <div className="space-y-2">
                          <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                            <img
                              src={block.image.url || "/placeholder.svg"}
                              alt={block.image.name}
                              style={{
                                width: "100%",
                                maxWidth: "600px",
                                maxHeight: "400px",
                                objectFit: "contain",
                                display: "block",
                                margin: "0 auto",
                              }}
                            />
                          </div>
                          <Input
                            placeholder="添加图片描述（可选）"
                            value={block.content}
                            onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                            className="text-sm"
                            style={{
                              wordBreak: "break-all",
                              overflowWrap: "anywhere",
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Draggable>
  )

  const renderPreview = () => (
    <div className="space-y-6">
      {mode !== "reply" && (
        <div>
          <h1
            className="text-2xl font-bold text-gray-900 leading-tight"
            style={{
              wordBreak: "break-all",
              overflowWrap: "anywhere",
              hyphens: "auto",
            }}
          >
            {title || "未命名主题"}
          </h1>
        </div>
      )}
      <div className="space-y-4">
        {blocks
          .filter((block) => {
            if (block.type === "text") return block.content.trim()
            if (block.type === "image") return block.image
            return false
          })
          .sort((a, b) => a.order - b.order)
          .map((block) => (
            <div key={block.id}>
              {block.type === "text" ? (
                <div className="prose max-w-none">
                  <p
                    className="text-gray-800 leading-relaxed whitespace-pre-wrap"
                    style={{
                      wordBreak: "break-all",
                      overflowWrap: "anywhere",
                      hyphens: "auto",
                    }}
                  >
                    {block.content}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                    <img
                      src={block.image?.url || "/placeholder.svg"}
                      alt={block.image?.name || "图片"}
                      style={{
                        width: "100%",
                        maxWidth: "800px",
                        maxHeight: "600px",
                        objectFit: "contain",
                        display: "block",
                        margin: "0 auto",
                      }}
                    />
                  </div>
                  {block.content && (
                    <p
                      className="text-sm text-gray-600 text-center italic"
                      style={{
                        wordBreak: "break-all",
                        overflowWrap: "anywhere",
                        hyphens: "auto",
                      }}
                    >
                      {block.content}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Context Info */}
      {contextData && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm text-blue-800">
            {mode === "thread" && contextData.forumName && (
              <p>
                正在{" "}
                <span
                  className="font-medium"
                  style={{
                    wordBreak: "break-all",
                    overflowWrap: "anywhere",
                  }}
                >
                  {contextData.forumName}
                </span>{" "}
                版块发布主题
              </p>
            )}
            {mode === "forum" && <p>创建新版块</p>}
            {mode === "reply" && contextData.threadTitle && (
              <p>
                回复主题:{" "}
                <span
                  className="font-medium"
                  style={{
                    wordBreak: "break-all",
                    overflowWrap: "anywhere",
                  }}
                >
                  {contextData.threadTitle}
                </span>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Title Input (for threads and forums) */}
      {mode !== "reply" && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">标题</label>
          <Input
            placeholder={mode === "thread" ? "输入主题标题..." : "输入版块名称..."}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg font-medium"
            style={{
              wordBreak: "break-all",
              overflowWrap: "anywhere",
            }}
          />
        </div>
      )}

      {/* Preview Toggle */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">内容编辑</h3>
        <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)}>
          {showPreview ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
          {showPreview ? "编辑模式" : "预览模式"}
        </Button>
      </div>

      {showPreview ? (
        <Card className="border border-gray-200">
          <CardContent className="p-6">{renderPreview()}</CardContent>
        </Card>
      ) : (
        <>
          {/* Content Blocks */}
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="blocks">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                  {blocks.map((block, index) => renderBlock(block, index))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {/* Add Block Buttons */}
          <div className="flex gap-3 flex-wrap">
            <Button variant="outline" onClick={addTextBlock} className="flex-1 sm:flex-none bg-transparent">
              <Plus className="mr-2 h-4 w-4" />
              添加文本
            </Button>
            <Button variant="outline" onClick={addImageBlock} className="flex-1 sm:flex-none bg-transparent">
              <Upload className="mr-2 h-4 w-4" />
              添加图片
            </Button>
          </div>
        </>
      )}

      {/* Hidden File Input */}
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />

      {/* Publish Button */}
      <div className="flex justify-end pt-4 border-t">
        <Button onClick={handlePublish} disabled={isPublishing} size="lg" className="min-w-[120px]">
          {isPublishing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              发布中...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              {mode === "thread" ? "发布主题" : mode === "forum" ? "创建版块" : "发表回复"}
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
