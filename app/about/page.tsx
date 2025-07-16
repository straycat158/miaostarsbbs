"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Heart,
  Users,
  MessageSquare,
  Shield,
  Sparkles,
  Globe,
  Mail,
  Github,
  Twitter,
  Linkedin,
  Target,
  Award,
  Zap,
} from "lucide-react"
import Link from "next/link"

export default function AboutPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  }

  const stats = [
    { icon: Users, label: "活跃用户", value: "10,000+", color: "text-blue-600" },
    { icon: MessageSquare, label: "讨论主题", value: "50,000+", color: "text-green-600" },
    { icon: Heart, label: "社区互动", value: "200,000+", color: "text-red-600" },
    { icon: Globe, label: "覆盖地区", value: "全球", color: "text-purple-600" },
  ]

  const features = [
    {
      icon: Shield,
      title: "安全可靠",
      description: "采用先进的安全技术，保护用户隐私和数据安全",
      color: "bg-blue-50 text-blue-600",
    },
    {
      icon: Zap,
      title: "高效便捷",
      description: "简洁直观的界面设计，让交流变得更加高效便捷",
      color: "bg-yellow-50 text-yellow-600",
    },
    {
      icon: Users,
      title: "社区驱动",
      description: "由用户共同建设和维护的开放式社区平台",
      color: "bg-green-50 text-green-600",
    },
    {
      icon: Award,
      title: "品质保证",
      description: "专业的内容审核和社区管理，确保高质量的讨论环境",
      color: "bg-purple-50 text-purple-600",
    },
  ]

  const team = [
    {
      name: "张三",
      role: "创始人 & CEO",
      description: "拥有10年互联网产品经验，致力于打造最好的社区平台",
      avatar: "/placeholder.svg",
    },
    {
      name: "李四",
      role: "技术总监",
      description: "全栈工程师，专注于平台技术架构和用户体验优化",
      avatar: "/placeholder.svg",
    },
    {
      name: "王五",
      role: "社区运营",
      description: "社区管理专家，负责维护健康积极的社区氛围",
      avatar: "/placeholder.svg",
    },
  ]

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="container mx-auto px-4 py-8 space-y-16"
    >
      {/* Hero Section */}
      <motion.section variants={itemVariants} className="text-center space-y-6">
        <div className="space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full text-primary font-medium"
          >
            <Sparkles className="h-4 w-4" />
            关于我们
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
            连接思想，分享智慧
            <br />
            <span className="text-primary">构建知识社区</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            我们致力于创建一个开放、友好、富有价值的在线社区，让每个人都能在这里找到志同道合的朋友，分享知识，获得成长。
          </p>
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section variants={itemVariants}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div key={stat.label} variants={itemVariants} whileHover={{ scale: 1.05 }} className="text-center">
                <Card className="border-0 shadow-lg bg-white">
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className={`mx-auto w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center`}>
                        <Icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                        <div className="text-sm text-gray-600">{stat.label}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </motion.section>

      {/* Mission Section */}
      <motion.section variants={itemVariants} className="text-center space-y-8">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-gray-900">我们的使命</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            通过技术的力量，打破信息壁垒，让知识和智慧在这里自由流动，帮助每个人实现个人成长和价值创造。
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="border-0 shadow-lg h-full">
                  <CardContent className="pt-6 text-center space-y-4">
                    <div className={`mx-auto w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center`}>
                      <Icon className="h-7 w-7" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 mb-2">{feature.title}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </motion.section>

      {/* Team Section */}
      <motion.section variants={itemVariants} className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-gray-900">核心团队</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            我们是一群充满激情的创造者，致力于为用户提供最好的社区体验。
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {team.map((member, index) => (
            <motion.div
              key={member.name}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="border-0 shadow-lg">
                <CardContent className="pt-6 text-center space-y-4">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                    <span className="text-white font-bold text-2xl">{member.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{member.name}</h3>
                    <Badge variant="secondary" className="mb-3">
                      {member.role}
                    </Badge>
                    <p className="text-gray-600 text-sm leading-relaxed">{member.description}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Values Section */}
      <motion.section variants={itemVariants}>
        <Card className="border-0 shadow-xl bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="p-8 md:p-12">
            <div className="text-center space-y-6">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-gray-900">我们的价值观</h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">这些核心价值观指导着我们的每一个决策和行动</p>
              </div>

              <div className="grid md:grid-cols-3 gap-8 mt-8">
                <div className="space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900">用户至上</h3>
                  <p className="text-gray-600 text-sm">始终将用户需求放在首位，持续改进产品体验</p>
                </div>

                <div className="space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
                    <Heart className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900">开放包容</h3>
                  <p className="text-gray-600 text-sm">欢迎不同观点，尊重每一个声音和想法</p>
                </div>

                <div className="space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900">持续创新</h3>
                  <p className="text-gray-600 text-sm">不断探索新技术，为用户创造更多价值</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.section>

      {/* Contact Section */}
      <motion.section variants={itemVariants}>
        <Card className="border-0 shadow-xl">
          <CardContent className="p-8 md:p-12">
            <div className="text-center space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-gray-900">联系我们</h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">有任何问题或建议？我们很乐意听到您的声音</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="lg" asChild>
                    <Link href="mailto:contact@forum.com">
                      <Mail className="mr-2 h-5 w-5" />
                      发送邮件
                    </Link>
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="outline" size="lg" asChild>
                    <Link href="/forums">
                      <MessageSquare className="mr-2 h-5 w-5" />
                      加入讨论
                    </Link>
                  </Button>
                </motion.div>
              </div>

              <Separator className="my-8" />

              <div className="flex justify-center space-x-6">
                <motion.a
                  href="#"
                  whileHover={{ scale: 1.1 }}
                  className="text-gray-400 hover:text-primary transition-colors"
                >
                  <Github className="h-6 w-6" />
                </motion.a>
                <motion.a
                  href="#"
                  whileHover={{ scale: 1.1 }}
                  className="text-gray-400 hover:text-primary transition-colors"
                >
                  <Twitter className="h-6 w-6" />
                </motion.a>
                <motion.a
                  href="#"
                  whileHover={{ scale: 1.1 }}
                  className="text-gray-400 hover:text-primary transition-colors"
                >
                  <Linkedin className="h-6 w-6" />
                </motion.a>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.section>
    </motion.div>
  )
}
