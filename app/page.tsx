import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, Users, TrendingUp, Shield, Sparkles, Globe, Heart } from "lucide-react"

export default function HomePage() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-6">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full text-sm text-blue-600 font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              欢迎来到我们的社区
            </div>
            <h1 className="text-5xl font-bold mb-6 text-gray-900 leading-tight">
              连接思想，分享智慧
              <br />
              <span className="text-blue-600">构建知识社区</span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              加入数千名成员的有意义讨论，分享知识，与志同道合的人建立联系。在这里，每个声音都被倾听，每个想法都有价值。
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="text-lg px-8 py-4 h-auto">
              <Link href="/forums">
                <Globe className="mr-2 h-5 w-5" />
                探索版块
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="text-lg px-8 py-4 h-auto bg-white/80 backdrop-blur-sm"
            >
              <Link href="/auth">
                <Heart className="mr-2 h-5 w-5" />
                加入社区
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">为什么选择我们的社区？</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">我们致力于创造一个开放、友好、富有价值的交流环境</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card className="text-center border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
            <CardHeader className="pb-4">
              <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-blue-600 flex items-center justify-center">
                <MessageSquare className="h-7 w-7 text-white" />
              </div>
              <CardTitle className="text-xl text-gray-900">深度讨论</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base text-gray-600 leading-relaxed">
                参与有意义的对话，通过层级回复和实时通知进行深入交流
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
            <CardHeader className="pb-4">
              <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-green-600 flex items-center justify-center">
                <Users className="h-7 w-7 text-white" />
              </div>
              <CardTitle className="text-xl text-gray-900">活跃社区</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base text-gray-600 leading-relaxed">
                与数千名活跃成员连接，分享知识和经验，建立有价值的关系
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
            <CardHeader className="pb-4">
              <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-purple-600 flex items-center justify-center">
                <TrendingUp className="h-7 w-7 text-white" />
              </div>
              <CardTitle className="text-xl text-gray-900">热门话题</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base text-gray-600 leading-relaxed">
                紧跟最新趋势，参与您感兴趣领域的热门讨论和话题
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100">
            <CardHeader className="pb-4">
              <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-red-600 flex items-center justify-center">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <CardTitle className="text-xl text-gray-900">安全环境</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base text-gray-600 leading-relaxed">
                享受安全的交流环境，专业的内容审核和社区准则保障
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Popular Forums Preview */}
      <section className="px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">热门版块</h2>
            <p className="text-lg text-gray-600">探索最受欢迎的讨论区域</p>
          </div>
          <Button variant="outline" asChild className="self-start sm:self-auto bg-transparent">
            <Link href="/forums">查看所有版块</Link>
          </Button>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-gray-900">综合讨论</CardTitle>
              <CardDescription className="text-base text-gray-600">综合话题和日常讨论</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span className="font-medium">245</span>
                  <span>个主题</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span className="font-medium">1.2k</span>
                  <span>条回复</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-gray-900">科技前沿</CardTitle>
              <CardDescription className="text-base text-gray-600">科技新闻、编程和开发讨论</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span className="font-medium">189</span>
                  <span>个主题</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span className="font-medium">856</span>
                  <span>条回复</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-gray-900">游戏天地</CardTitle>
              <CardDescription className="text-base text-gray-600">电子游戏、评测和游戏文化</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span className="font-medium">156</span>
                  <span>个主题</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span className="font-medium">743</span>
                  <span>条回复</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
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
