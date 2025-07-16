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
      <body
        className={`${inter.className} ${notoSansSC.variable} font-sans antialiased min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30`}
      >
        <div className="flex flex-col min-h-screen">
          <EnhancedHeader />
          <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
            <div className="space-y-8">{children}</div>
          </main>
          <footer className="border-t bg-gray-50/80 backdrop-blur-sm">
            <div className="container mx-auto px-4 py-6">
              <div className="text-center text-sm text-gray-600">
                <p>&copy; 2024 论坛社区. 保留所有权利.</p>
              </div>
            </div>
          </footer>
        </div>
        <Toaster />
      </body>
    </html>
  )
}
