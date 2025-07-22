"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Shield, Sparkles, Globe, Zap, Award, ArrowRight, TrendingUp } from "lucide-react"
import { motion } from "framer-motion"
import NotificationBanner from "@/components/home/notification-banner"
import EnhancedMobileCarousel from "@/components/home/enhanced-mobile-carousel"
import MobileOptimizedForums from "@/components/home/mobile-optimized-forums"
import RecentActivity from "@/components/home/recent-activity"

export default function HomePage() {
  // Enhanced carousel slides with mobile-optimized content
  const carouselSlides = [
    {
      id: "slide1",
      imageUrl: "/placeholder.svg?height=600&width=1400",
      title: "欢迎来到论坛社区",
      description: "加入我们的社区，分享知识，结交朋友，共同成长。",
      linkUrl: "/forums",
    },
    {
      id: "slide2",
      imageUrl: "/placeholder.svg?height=600&width=1400",
      title: "探索丰富的讨论版块",
      description: "从技术到生活，从学习到娱乐，总有一个话题适合你。",
      linkUrl: "/forums",
    },
    {
      id: "slide3",
      imageUrl: "/placeholder.svg?height=600&width=1400",
      title: "资源中心全新上线",
      description: "浏览和下载高质量的Minecraft模组、资源包和着色器。",
      linkUrl: "/resources",
    },
    {
      id: "slide4",
      imageUrl: "/placeholder.svg?height=600&width=1400",
      title: "移动端体验优化",
      description: "全新的移动端界面，让您随时随地参与社区讨论。",
      linkUrl: "/about",
    },
  ]

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Notification Banner */}
      <NotificationBanner
        title="移动端体验升级"
        message="我们优化了移动端界面，现在您可以更便捷地浏览和参与讨论！"
        linkText="了解详情"
        linkHref="/about"
      />

      {/* Enhanced Mobile Carousel */}
      <section className="mb-8 sm:mb-12">
        <EnhancedMobileCarousel slides={carouselSlides} />
      </section>

      {/* Main Content - Mobile-first responsive layout */}
      <div className="space-y-8 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-8">
        {/* Forums Section - Full width on mobile, 2/3 on desktop */}
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          {/* Mobile-Optimized Forums */}
          <section>
            <MobileOptimizedForums />
          </section>

          {/* Features Section - Responsive grid */}
          <section className="py-8 sm:py-12">
            <div className="text-center mb-6 sm:mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">为什么选择我们的社区？</h2>
              <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
                我们致力于创造一个开放、友好、富有价值的交流环境
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
              {[
                {
                  icon: Shield,
                  title: "安全可靠",
                  description: "采用先进的安全技术，保护用户隐私和数据安全",
                  color: "bg-blue-50 text-blue-600",
                  delay: 0,
                },
                {
                  icon: Zap,
                  title: "高效便捷",
                  description: "简洁直观的界面设计，让交流变得更加高效便捷",
                  color: "bg-yellow-50 text-yellow-600",
                  delay: 0.1,
                },
                {
                  icon: Users,
                  title: "社区驱动",
                  description: "由用户共同建设和维护的开放式社区平台",
                  color: "bg-green-50 text-green-600",
                  delay: 0.2,
                },
                {
                  icon: Award,
                  title: "品质保证",
                  description: "专业的内容审核和社区管理，确保高质量的讨论环境",
                  color: "bg-purple-50 text-purple-600",
                  delay: 0.3,
                },
              ].map((feature, index) => {
                const Icon = feature.icon
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: feature.delay }}
                    whileHover={{ y: -4, scale: 1.02 }}
                    className="group"
                  >
                    <Card className="text-center border-0 shadow-soft hover:shadow-strong transition-all duration-300 h-full bg-white/80 backdrop-blur-sm">
                      <CardHeader className="pb-3 sm:pb-4">
                        <motion.div
                          className={`mx-auto mb-3 sm:mb-6 h-12 w-12 sm:h-16 sm:w-16 rounded-xl sm:rounded-2xl ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                          whileHover={{ rotate: 5 }}
                        >
                          <Icon className="h-6 w-6 sm:h-8 sm:w-8" />
                        </motion.div>
                        <CardTitle className="text-lg sm:text-xl text-gray-900 group-hover:text-blue-600 transition-colors">
                          {feature.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="px-3 sm:px-6">
                        <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{feature.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </section>
        </div>

        {/* Sidebar - Full width on mobile, 1/3 on desktop */}
        <div className="space-y-6 sm:space-y-8">
          {/* Recent Activity */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                最新动态
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RecentActivity />
            </CardContent>
          </Card>

          {/* Quick Links - Mobile optimized */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg sm:text-xl">快速导航</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start bg-transparent h-12" asChild>
                <Link href="/forums/create">
                  <Globe className="mr-3 h-5 w-5" />
                  <span className="text-base">创建新版块</span>
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent h-12" asChild>
                <Link href="/resources">
                  <Award className="mr-3 h-5 w-5" />
                  <span className="text-base">浏览资源中心</span>
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent h-12" asChild>
                <Link href="/about">
                  <Users className="mr-3 h-5 w-5" />
                  <span className="text-base">关于我们</span>
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Stats Card - Mobile optimized */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                社区数据
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="text-center p-3 sm:p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-xl sm:text-2xl font-bold text-primary">1,234</div>
                  <div className="text-xs sm:text-sm text-gray-600">注册用户</div>
                </div>
                <div className="text-center p-3 sm:p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-xl sm:text-2xl font-bold text-primary">5,678</div>
                  <div className="text-xs sm:text-sm text-gray-600">主题数量</div>
                </div>
                <div className="text-center p-3 sm:p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-xl sm:text-2xl font-bold text-primary">9,012</div>
                  <div className="text-xs sm:text-sm text-gray-600">回复数量</div>
                </div>
                <div className="text-center p-3 sm:p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-xl sm:text-2xl font-bold text-primary">345</div>
                  <div className="text-xs sm:text-sm text-gray-600">今日活跃</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Call to Action - Mobile optimized */}
      <section className="text-center py-12 sm:py-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl sm:rounded-3xl text-white mx-2 sm:mx-0">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">准备好加入对话了吗？</h2>
          <p className="text-lg sm:text-xl mb-6 sm:mb-8 opacity-90">立即创建您的账户，成为我们不断成长的社区的一部分</p>
          <Button
            size="lg"
            variant="secondary"
            asChild
            className="text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 h-auto"
          >
            <Link href="/auth">
              立即开始
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
