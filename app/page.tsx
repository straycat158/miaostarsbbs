"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Shield, Sparkles, Globe, Heart, Zap, Award } from "lucide-react"
import PopularForumsPreview from "@/components/home/popular-forums-preview"
import { motion } from "framer-motion"
import { Button as EnhancedButton } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-24 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl relative overflow-hidden shadow-soft">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full text-sm text-blue-600 font-medium mb-8 shadow-soft">
              <Sparkles className="h-4 w-4" />
              欢迎来到我们的社区
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-8 text-gray-900 leading-tight">
              连接思想，分享智慧
              <br />
              <span className="text-blue-600 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                构建知识社区
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              加入数千名成员的有意义讨论，分享知识，与志同道合的人建立联系。在这里，每个声音都被倾听，每个想法都有价值。
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <EnhancedButton size="lg" asChild className="text-lg px-10 py-4 h-auto shadow-medium">
              <Link href="/forums">
                <Globe className="mr-2 h-5 w-5" />
                探索版块
              </Link>
            </EnhancedButton>
            <EnhancedButton
              size="lg"
              variant="outline"
              asChild
              className="text-lg px-10 py-4 h-auto bg-white/80 backdrop-blur-sm border-2 hover:bg-white"
            >
              <Link href="/auth">
                <Heart className="mr-2 h-5 w-5" />
                加入社区
              </Link>
            </EnhancedButton>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-6">为什么选择我们的社区？</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            我们致力于创造一个开放、友好、富有价值的交流环境
          </p>
        </motion.div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
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
                whileHover={{ y: -8, scale: 1.02 }}
                className="group"
              >
                <Card className="text-center border-0 shadow-soft hover:shadow-strong transition-all duration-300 h-full bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <motion.div
                      className={`mx-auto mb-6 h-16 w-16 rounded-2xl ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                      whileHover={{ rotate: 5 }}
                    >
                      <Icon className="h-8 w-8" />
                    </motion.div>
                    <CardTitle className="text-xl text-gray-900 group-hover:text-blue-600 transition-colors">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base text-gray-600 leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* Popular Forums Preview */}
      <section className="px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">热门版块</h2>
            <p className="text-lg text-gray-600">探索最受欢迎的讨论区域</p>
          </div>
          <Button
            variant="outline"
            asChild
            className="self-start sm:self-auto bg-transparent hover:bg-primary hover:text-primary-foreground transition-all duration-200"
          >
            <Link href="/forums">查看所有版块</Link>
          </Button>
        </div>
        <PopularForumsPreview />
      </section>

      {/* Call to Action */}
      <section className="text-center py-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl text-white">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-4">准备好加入对话了吗？</h2>
          <p className="text-xl mb-8 opacity-90">立即创建您的账户，成为我们不断成长的社区的一部分</p>
          <Button size="lg" variant="secondary" asChild className="text-lg px-8 py-4 h-auto">
            <Link href="/auth">立即开始</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
