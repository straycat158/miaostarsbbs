"use client"

import { Suspense } from "react"
import ResourceCenter from "@/components/resources/resource-center"
import EnhancedSidebar from "@/components/layout/enhanced-sidebar"
import LoadingSpinner from "@/components/ui/loading-spinner"
import { Package } from "lucide-react"

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-green-100 rounded-full">
              <Package className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">资源中心</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            发现优质的Minecraft资源，包括模组、材质包、地图等精彩内容
          </p>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Resource Center */}
          <div className="lg:col-span-3">
            <Suspense fallback={<LoadingSpinner />}>
              <ResourceCenter />
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
