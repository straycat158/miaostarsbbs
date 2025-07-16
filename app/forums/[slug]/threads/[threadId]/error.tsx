"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw } from "lucide-react"
import Link from "next/link"

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ThreadError({ error, reset }: ErrorPageProps) {
  console.error("Thread page error:", error)

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <AlertCircle className="h-12 w-12 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-red-800 mb-2">加载主题时出错</h2>
              <p className="text-red-700 mb-4">{error.message || "无法加载主题内容，请稍后重试"}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={reset}
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-100 bg-transparent"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                重试
              </Button>
              <Button asChild>
                <Link href="/forums">返回版块列表</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
