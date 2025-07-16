"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { signIn, signUp } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"

export default function AuthForm() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignIn = async (formData: FormData) => {
    setIsLoading(true)
    try {
      const email = formData.get("email") as string
      const password = formData.get("password") as string

      await signIn(email, password)
      toast({ title: "欢迎回来！" })
      router.push("/")
    } catch (error: any) {
      toast({
        title: "错误",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (formData: FormData) => {
    setIsLoading(true)
    try {
      const email = formData.get("email") as string
      const password = formData.get("password") as string
      const username = formData.get("username") as string
      const fullName = formData.get("fullName") as string

      await signUp(email, password, username, fullName)
      toast({ title: "账户创建成功！请查看邮箱进行验证。" })
      router.push("/")
    } catch (error: any) {
      toast({
        title: "错误",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4">
      <Card className="w-full max-w-lg shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-8">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
            <span className="text-white font-bold text-2xl">论</span>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">论坛社区</CardTitle>
          <CardDescription className="text-gray-600 text-base">加入我们的社区讨论</CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-gray-100">
              <TabsTrigger value="signin" className="text-base py-3">
                登录
              </TabsTrigger>
              <TabsTrigger value="signup" className="text-base py-3">
                注册
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-6">
              <form action={handleSignIn} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    邮箱地址
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="h-12 text-base"
                    placeholder="请输入您的邮箱"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    密码
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="h-12 text-base"
                    placeholder="请输入您的密码"
                  />
                </div>
                <Button type="submit" className="w-full h-12 text-base font-medium" disabled={isLoading}>
                  {isLoading ? "登录中..." : "立即登录"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-6">
              <form action={handleSignUp} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                    真实姓名
                  </Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    required
                    className="h-12 text-base"
                    placeholder="请输入您的真实姓名"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                    用户名
                  </Label>
                  <Input id="username" name="username" required className="h-12 text-base" placeholder="请输入用户名" />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    邮箱地址
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="h-12 text-base"
                    placeholder="请输入您的邮箱"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    密码
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="h-12 text-base"
                    placeholder="请设置密码（至少6位）"
                  />
                </div>
                <Button type="submit" className="w-full h-12 text-base font-medium" disabled={isLoading}>
                  {isLoading ? "注册中..." : "立即注册"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
