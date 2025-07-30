"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X, ZoomIn, Download, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"

interface ImageGalleryProps {
  images: string[]
  className?: string
}

export default function ImageGallery({ images, className = "" }: ImageGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  if (!images || images.length === 0) {
    return null
  }

  const handlePrevious = () => {
    setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
  }

  const handleNext = () => {
    setSelectedImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
  }

  const handleDownload = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `image-${Date.now()}.jpg`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error downloading image:", error)
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 图片网格 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((imageUrl, index) => (
          <Dialog key={index} open={isOpen && selectedImageIndex === index} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <div
                className="relative group cursor-pointer overflow-hidden rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200"
                onClick={() => {
                  setSelectedImageIndex(index)
                  setIsOpen(true)
                }}
              >
                <div className="aspect-video relative bg-gray-100">
                  <Image
                    src={imageUrl || "/placeholder.svg"}
                    alt={`图片 ${index + 1}`}
                    fill
                    className="object-cover transition-transform duration-200 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                    <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </div>
                </div>
              </div>
            </DialogTrigger>

            <DialogContent className="max-w-4xl w-full h-[90vh] p-0 bg-black">
              <div className="relative w-full h-full flex items-center justify-center">
                {/* 关闭按钮 */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-6 w-6" />
                </Button>

                {/* 下载按钮 */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-16 z-10 text-white hover:bg-white/20"
                  onClick={() => handleDownload(images[selectedImageIndex])}
                >
                  <Download className="h-6 w-6" />
                </Button>

                {/* 上一张按钮 */}
                {images.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
                    onClick={handlePrevious}
                  >
                    <ChevronLeft className="h-8 w-8" />
                  </Button>
                )}

                {/* 下一张按钮 */}
                {images.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
                    onClick={handleNext}
                  >
                    <ChevronRight className="h-8 w-8" />
                  </Button>
                )}

                {/* 主图片 */}
                <div className="relative w-full h-full flex items-center justify-center p-8">
                  <Image
                    src={images[selectedImageIndex] || "/placeholder.svg"}
                    alt={`图片 ${selectedImageIndex + 1}`}
                    fill
                    className="object-contain"
                    sizes="90vw"
                  />
                </div>

                {/* 图片计数器 */}
                {images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                    {selectedImageIndex + 1} / {images.length}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </div>
  )
}
