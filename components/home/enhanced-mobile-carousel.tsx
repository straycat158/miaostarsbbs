"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence, type PanInfo } from "framer-motion"
import { useSwipeable } from "react-swipeable"

interface CarouselSlide {
  id: string
  imageUrl: string
  title: string
  description: string
  linkUrl?: string
}

interface EnhancedMobileCarouselProps {
  slides: CarouselSlide[]
  autoPlayInterval?: number
  showIndicators?: boolean
}

export default function EnhancedMobileCarousel({
  slides,
  autoPlayInterval = 5000,
  showIndicators = true,
}: EnhancedMobileCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [dragConstraints, setDragConstraints] = useState({ left: 0, right: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length)
  }, [slides.length])

  const prevSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length)
  }, [slides.length])

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  // Swipe handlers
  const handlers = useSwipeable({
    onSwipedLeft: nextSlide,
    onSwipedRight: prevSlide,
    trackMouse: true,
    trackTouch: true,
    preventScrollOnSwipe: true,
  })

  // Auto-play effect
  useEffect(() => {
    if (isPaused || !isAutoPlaying || autoPlayInterval <= 0 || slides.length <= 1) return

    const interval = setInterval(nextSlide, autoPlayInterval)
    return () => clearInterval(interval)
  }, [currentIndex, isPaused, isAutoPlaying, autoPlayInterval, nextSlide, slides.length])

  // Update drag constraints
  useEffect(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth
      setDragConstraints({
        left: -containerWidth * 0.3,
        right: containerWidth * 0.3,
      })
    }
  }, [])

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 50
    if (info.offset.x > threshold) {
      prevSlide()
    } else if (info.offset.x < -threshold) {
      nextSlide()
    }
  }

  const handleSlideClick = () => {
    if (slides[currentIndex].linkUrl) {
      window.location.href = slides[currentIndex].linkUrl
    }
  }

  if (!slides.length) return null

  return (
    <div
      {...handlers}
      ref={containerRef}
      className="relative overflow-hidden rounded-2xl bg-gray-900"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Main carousel container */}
      <div className="aspect-[16/9] sm:aspect-[21/9] w-full relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{
              duration: 0.5,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            drag="x"
            dragConstraints={dragConstraints}
            onDragEnd={handleDragEnd}
            className="absolute inset-0 cursor-pointer"
            onClick={handleSlideClick}
          >
            <div className="relative h-full w-full">
              <img
                src={slides[currentIndex].imageUrl || "/placeholder.svg"}
                alt={slides[currentIndex].title}
                className="h-full w-full object-cover"
                draggable={false}
              />

              {/* Enhanced gradient overlay for better text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Content overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white pointer-events-none">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 leading-tight">
                    {slides[currentIndex].title}
                  </h2>
                  <p className="text-sm sm:text-base opacity-90 max-w-xl leading-relaxed">
                    {slides[currentIndex].description}
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Enhanced indicators with smaller size */}
      {showIndicators && slides.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`relative h-1.5 rounded-full transition-all duration-300 ${
                index === currentIndex ? "w-6 bg-white" : "w-1.5 bg-white/50 hover:bg-white/70"
              }`}
              onClick={() => goToSlide(index)}
              aria-label={`转到第 ${index + 1} 张幻灯片`}
            >
              {/* Progress indicator for current slide */}
              {index === currentIndex && isAutoPlaying && (
                <motion.div
                  className="absolute inset-0 bg-white/60 rounded-full origin-left"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: autoPlayInterval / 1000, ease: "linear" }}
                  key={`progress-${currentIndex}`}
                />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Slide counter for mobile */}
      <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1 text-white text-sm border border-white/20">
        {currentIndex + 1} / {slides.length}
      </div>

      {/* Swipe hint for mobile users */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ delay: 3, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/70 text-xs bg-black/40 backdrop-blur-sm rounded-full px-3 py-1 sm:hidden"
      >
        滑动切换
      </motion.div>
    </div>
  )
}
