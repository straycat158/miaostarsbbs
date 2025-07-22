"use client"

import { Suspense } from "react"
import EnhancedForumList from "@/components/forum/enhanced-forum-list"
import EnhancedSidebar from "@/components/layout/enhanced-sidebar"
import LoadingSpinner from "@/components/ui/loading-spinner"
import { MessageSquare } from "lucide-react"

export default function ForumsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <MessageSquare className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">讨论版块</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            探索各种话题，参与热烈讨论，与志同道合的朋友交流想法
          </p>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Forums List */}
          <div className="lg:col-span-3">
            <Suspense fallback={<LoadingSpinner />}>
              <EnhancedForumList />
            </Suspense>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <EnhancedSidebar />
          </div>
        </div>
      </div>
    </div>
  )
}
