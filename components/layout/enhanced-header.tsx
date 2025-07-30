"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Bell, Menu, User, Settings, LogOut, Shield, Home, MessageSquare, Package, Info } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"
import VerificationBadge from "@/components/ui/verification-badge"
import NotificationCenter from "@/components/notifications/notification-center"
import { useNotifications } from "@/hooks/use-notifications"

export default function EnhancedHeader() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { unreadCount } = useNotifications()

  useEffect(() => {
    checkUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN") {
        checkUser()
      } else if (event === "SIGNED_OUT") {
        setUser(null)
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const checkUser = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
        setProfile(profile)
      }
    } catch (error) {
      console.error("Error checking user:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      toast({
        title: "已退出登录",
        description: "您已成功退出登录",
      })

      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
      toast({
        title: "退出失败",
        description: "退出登录时发生错误",
        variant: "destructive",
      })
    }
  }

  const handleNavigation = (path: string) => {
    router.push(path)
    setIsMobileMenuOpen(false)
  }

  const isActivePath = (path: string) => {
    return pathname === path || pathname.startsWith(path + "/")
  }

  const navigationItems = [
    { name: "首页", path: "/", icon: Home },
    { name: "版块", path: "/forums", icon: MessageSquare },
    { name: "资源", path: "/resources", icon: Package },
    { name: "关于", path: "/about", icon: Info },
  ]

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">F</span>
              </div>
              <span className="font-bold text-xl text-gray-900">论坛</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActivePath(item.path)
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Right Side */}
            <div className="flex items-center space-x-3">
              {/* Notifications */}
              {user && (
                <div className="relative">
                  <Button variant="ghost" size="icon" onClick={() => setIsNotificationOpen(true)} className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </Button>
                </div>
              )}

              {/* User Menu */}
              {loading ? (
                <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
              ) : user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} />
                        <AvatarFallback>
                          {profile?.username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{profile?.username || "用户"}</p>
                          {profile?.is_verified && profile?.verification_type && (
                            <VerificationBadge
                              verificationType={profile.verification_type}
                              size="sm"
                              showText={false}
                            />
                          )}
                        </div>
                        <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push(`/profile/${profile?.username}`)}>
                      <User className="mr-2 h-4 w-4" />
                      个人资料
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push("/settings")}>
                      <Settings className="mr-2 h-4 w-4" />
                      设置
                    </DropdownMenuItem>
                    {!profile?.is_verified && (
                      <DropdownMenuItem onClick={() => router.push("/verification")}>
                        <Shield className="mr-2 h-4 w-4" />
                        <span className="text-blue-600 font-medium">申请认证</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      退出登录
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="hidden md:flex items-center space-x-2">
                  <Button variant="ghost" onClick={() => router.push("/auth")}>
                    登录
                  </Button>
                  <Button onClick={() => router.push("/auth")}>注册</Button>
                </div>
              )}

              {/* Mobile Menu */}
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <div className="flex flex-col h-full">
                    {/* User Info */}
                    {user && profile ? (
                      <div className="flex items-center gap-3 p-4 border-b">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={profile.avatar_url || "/placeholder.svg"} />
                          <AvatarFallback>{profile.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{profile.username}</p>
                            {profile.is_verified && profile.verification_type && (
                              <VerificationBadge
                                verificationType={profile.verification_type}
                                size="sm"
                                showText={false}
                              />
                            )}
                          </div>
                          <p className="text-sm text-gray-500 truncate">{user.email}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 border-b">
                        <div className="space-y-2">
                          <Button className="w-full" onClick={() => handleNavigation("/auth")}>
                            登录
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full bg-transparent"
                            onClick={() => handleNavigation("/auth")}
                          >
                            注册
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Navigation */}
                    <nav className="flex-1 py-4">
                      <div className="space-y-1">
                        {navigationItems.map((item) => (
                          <button
                            key={item.path}
                            onClick={() => handleNavigation(item.path)}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors ${
                              isActivePath(item.path) ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"
                            }`}
                          >
                            <item.icon className="h-5 w-5" />
                            {item.name}
                          </button>
                        ))}
                      </div>

                      {user && (
                        <>
                          <div className="border-t my-4" />
                          <div className="space-y-1">
                            <button
                              onClick={() => handleNavigation(`/profile/${profile?.username}`)}
                              className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                              <User className="h-5 w-5" />
                              个人资料
                            </button>
                            <button
                              onClick={() => handleNavigation("/settings")}
                              className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                              <Settings className="h-5 w-5" />
                              设置
                            </button>
                            {!profile?.is_verified && (
                              <button
                                onClick={() => handleNavigation("/verification")}
                                className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                              >
                                <Shield className="h-5 w-5" />
                                <span className="font-medium">申请认证</span>
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </nav>

                    {/* Sign Out */}
                    {user && (
                      <div className="border-t p-4">
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="h-5 w-5" />
                          退出登录
                        </button>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Notification Center */}
      <NotificationCenter isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} />
    </>
  )
}
