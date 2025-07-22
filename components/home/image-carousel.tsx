"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CarouselSlide {
  id: string
  imageUrl: string
  title: string
  description: string
  linkUrl?: string
}

interface ImageCarouselProps {
  slides: CarouselSlide[]
  autoPlayInterval?: number
  showControls?: boolean
  showIndicators?: boolean
}

export default function ImageCarousel({
  slides,
  autoPlayInterval = 5000,
  showControls = true,
  showIndicators = true,
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length)
  }, [slides.length])

  const prevSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length)
  }, [slides.length])

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  useEffect(() => {
    if (isPaused || autoPlayInterval <= 0 || slides.length <= 1) return

    const interval = setInterval(nextSlide, autoPlayInterval)
    return () => clearInterval(interval)
  }, [currentIndex, isPaused, autoPlayInterval, nextSlide, slides.length])

  if (!slides.length) return null

  return (
    <div
      className="relative overflow-hidden rounded-2xl"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="aspect-[21/9] w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            <div className="relative h-full w-full">
              <img
                src={slides[currentIndex].imageUrl || "/placeholder.svg"}
                alt={slides[currentIndex].title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h2 className="text-2xl md:text-3xl font-bold mb-2">{slides[currentIndex].title}</h2>
                <p className="text-sm md:text-base opacity-90 max-w-xl">{slides[currentIndex].description}</p>
                {slides[currentIndex].linkUrl && (
                  <Button
                    variant="outline"
                    className="mt-4 bg-white/20 backdrop-blur-sm hover:bg-white/40 border-white/40"
                    asChild
                  >
                    <a href={slides[currentIndex].linkUrl}>了解更多</a>
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Controls */}
      {showControls && slides.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/30 text-white hover:bg-black/50"
            onClick={prevSlide}
            aria-label="上一张"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/30 text-white hover:bg-black/50"
            onClick={nextSlide}
            aria-label="下一张"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </>
      )}

      {/* Indicators */}
      {showIndicators && slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex ? "w-8 bg-white" : "w-2 bg-white/50"
              }`}
              onClick={() => goToSlide(index)}
              aria-label={`转到第 ${index + 1} 张幻灯片`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
