"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Bell, User, Settings, LogOut, Menu, Heart, Globe, MessageSquare, Info, Package, Shield } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { signOut } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { motion } from "framer-motion"
import VerificationBadge from "@/components/ui/verification-badge"

export default function EnhancedHeader() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [notifications, setNotifications] = useState<any[]>([])
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
        setProfile(profile)

        const { data: notifications } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", user.id)
          .eq("read", false)
          .order("created_at", { ascending: false })
        setNotifications(notifications || [])
      }
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN") {
        setUser(session?.user || null)
      } else if (event === "SIGNED_OUT") {
        setUser(null)
        setProfile(null)
        setNotifications([])
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  const navItems = [
    { href: "/", label: "首页", icon: Globe },
    { href: "/forums", label: "版块", icon: MessageSquare },
    { href: "/resources", label: "资源中心", icon: Package },
    { href: "/verification", label: "身份认证", icon: Shield },
    { href: "/about", label: "关于我们", icon: Info },
  ]

  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={mobile ? "flex flex-col space-y-2" : "flex items-center space-x-1"}>
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))

        return (
          <div key={item.href} className="relative">
            <Button
              variant={isActive ? "default" : "ghost"}
              size="sm"
              asChild
              className={`
                relative transition-all duration-200 
                ${mobile ? "w-full justify-start" : ""}
                ${isActive ? "bg-primary text-primary-foreground shadow-md" : "hover:bg-accent"}
              `}
            >
              <Link href={item.href}>
                <Icon className={`h-4 w-4 ${mobile ? "mr-2" : "mr-1"}`} />
                {item.label}
              </Link>
            </Button>
          </div>
        )
      })}
    </div>
  )

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-3">
            {/* Enhanced Logo */}
            <motion.div
              className="relative"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
                <div className="relative">
                  <MessageSquare className="h-5 w-5 text-white" />
                  <div className="absolute -top-1 -right-1 h-2 w-2 bg-yellow-400 rounded-full animate-pulse"></div>
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
            </motion.div>
            <div className="flex flex-col">
              <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                论坛社区
              </span>
              <span className="text-xs text-gray-500 -mt-1">Forum Community</span>
            </div>
          </Link>

          <nav className="hidden md:flex">
            <NavLinks />
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-4 w-4" />
                    {notifications.length > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                        {notifications.length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <DropdownMenuItem key={notification.id} className="flex flex-col items-start p-4">
                        <div className="font-medium">{notification.title}</div>
                        <div className="text-sm text-muted-foreground">{notification.message}</div>
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <DropdownMenuItem>暂无新通知</DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <div className="relative">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} alt={profile?.username} />
                        <AvatarFallback>{profile?.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                      </Avatar>
                      {profile?.is_verified && profile?.verification_type && (
                        <div className="absolute -bottom-1 -right-1">
                          <VerificationBadge verificationType={profile.verification_type} size="sm" />
                        </div>
                      )}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/profile/${profile?.username}`}>
                      <User className="mr-2 h-4 w-4" />
                      个人资料
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      设置
                    </Link>
                  </DropdownMenuItem>
                  {!profile?.is_verified && (
                    <DropdownMenuItem asChild>
                      <Link href="/verification">
                        <Shield className="mr-2 h-4 w-4" />
                        申请认证
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    退出登录
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link href="/auth">登录</Link>
              </Button>
              <Button asChild>
                <Link href="/auth">
                  <Heart className="mr-2 h-4 w-4" />
                  注册
                </Link>
              </Button>
            </div>
          )}

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex flex-col gap-6 mt-8">
                <div className="text-lg font-semibold text-gray-900">导航菜单</div>
                <NavLinks mobile />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
