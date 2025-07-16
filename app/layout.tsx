import type React from "react"
import type { Metadata } from "next"
import { Inter, Noto_Sans_SC } from "next/font/google"
import "./globals.css"
import EnhancedHeader from "@/components/layout/enhanced-header"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })
const notoSansSC = Noto_Sans_SC({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-noto-sans-sc",
})

export const metadata: Metadata = {
  title: "论坛社区 - 连接思想，分享智慧",
  description: "现代化的论坛平台，为社区讨论而生",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={`${inter.className} ${notoSansSC.variable} font-sans antialiased`}>
        <EnhancedHeader />
        <main className="container mx-auto px-4 py-8 max-w-7xl">{children}</main>
        <Toaster />
      </body>
    </html>
  )
}
