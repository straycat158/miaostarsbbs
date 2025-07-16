"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, Filter, Grid3X3, List, Download, Clock, Star, RefreshCw, AlertCircle, Package } from "lucide-react"
import {
  searchProjects,
  type ModrinthProject,
  type ProjectType,
  type SortIndex,
  CATEGORIES,
  MINECRAFT_VERSIONS,
} from "@/lib/modrinth-api"
import ResourceCard from "./resource-card"
import LoadingSpinner from "@/components/ui/loading-spinner"

export default function ResourceCenter() {
  const [projects, setProjects] = useState<ModrinthProject[]>([])
  const [loading, setLoading] = useState(true)
  const [searchLoading, setSearchLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [hasActiveSearch, setHasActiveSearch] = useState(false)

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedProjectType, setSelectedProjectType] = useState<ProjectType>("all")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedVersion, setSelectedVersion] = useState<string>("all")
  const [sortBy, setSortBy] = useState<SortIndex>("relevance")
  const [currentPage, setCurrentPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  const ITEMS_PER_PAGE = 20

  // Load initial data
  useEffect(() => {
    loadInitialData()
  }, [])

  // Search when filters change
  useEffect(() => {
    if (!loading) {
      handleSearch(true)
    }
  }, [selectedProjectType, selectedCategory, selectedVersion, sortBy])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      setError(null)
      setHasActiveSearch(false)
      setCurrentPage(0) // 添加：重置页码

      const initial = await searchProjects({ limit: ITEMS_PER_PAGE, index: "downloads" })
      setProjects(initial.hits)
      setHasMore(initial.hits.length === ITEMS_PER_PAGE)
      setCurrentPage(1) // 添加：设置为第1页
    } catch (err: any) {
      console.error("Error loading initial data:", err)
      setError("加载资源时出现错误，请稍后重试")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (reset = false) => {
    try {
      setSearchLoading(true)
      setError(null)

      // 检查是否有活跃的搜索条件
      const isActiveSearch =
        searchQuery.trim() !== "" ||
        selectedProjectType !== "all" ||
        selectedCategory !== "all" ||
        selectedVersion !== "all" ||
        sortBy !== "downloads"

      setHasActiveSearch(isActiveSearch)

      // 修复：重置时将 currentPage 设为 0，非重置时使用当前页
      const offset = reset ? 0 : currentPage * ITEMS_PER_PAGE

      const searchParams = {
        query: searchQuery,
        projectType: selectedProjectType,
        categories: selectedCategory !== "all" ? [selectedCategory] : [],
        versions: selectedVersion !== "all" ? [selectedVersion] : [],
        index: sortBy,
        offset,
        limit: ITEMS_PER_PAGE,
      }

      const data = await searchProjects(searchParams)

      if (reset) {
        setProjects(data.hits)
        setCurrentPage(1) // 修复：重置后设为第1页（因为已经加载了第0页）
      } else {
        setProjects((prev) => [...prev, ...data.hits])
        setCurrentPage((prev) => prev + 1) // 修复：加载更多时递增页码
      }

      setHasMore(data.hits.length === ITEMS_PER_PAGE)
    } catch (err: any) {
      console.error("Error searching projects:", err)
      setError("搜索失败，请检查网络连接后重试")
    } finally {
      setSearchLoading(false)
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSearch(true)
  }

  const handleLoadMore = () => {
    if (!searchLoading && hasMore) {
      handleSearch(false)
    }
  }

  const handleRetry = () => {
    if (projects.length === 0) {
      loadInitialData()
    } else {
      handleSearch(true)
    }
  }

  const getAvailableCategories = () => {
    if (selectedProjectType === "all") {
      return Object.values(CATEGORIES).flat()
    }
    return CATEGORIES[selectedProjectType as keyof typeof CATEGORIES] || []
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <LoadingSpinner size="lg" variant="forum" text="正在加载资源中心..." />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
            <Package className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">资源中心</h1>
        </div>
        {!hasActiveSearch && (
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            探索来自 Modrinth 的优质 Minecraft 资源，包括模组、整合包、资源包和着色器
          </p>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={handleRetry}>
              <RefreshCw className="h-3 w-3 mr-1" />
              重试
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Search and Filters */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="搜索模组、整合包、资源包..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit" disabled={searchLoading}>
                {searchLoading ? <LoadingSpinner size="sm" /> : <Search className="h-4 w-4" />}
              </Button>
            </form>

            {/* Filters */}
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-3 flex-1">
                <Select
                  value={selectedProjectType}
                  onValueChange={(value) => setSelectedProjectType(value as ProjectType)}
                >
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部类型</SelectItem>
                    <SelectItem value="mod">模组</SelectItem>
                    <SelectItem value="modpack">整合包</SelectItem>
                    <SelectItem value="resourcepack">资源包</SelectItem>
                    <SelectItem value="shader">着色器</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full sm:w-40">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部分类</SelectItem>
                    {getAvailableCategories().map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedVersion} onValueChange={setSelectedVersion}>
                  <SelectTrigger className="w-full sm:w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部版本</SelectItem>
                    {MINECRAFT_VERSIONS.map((version) => (
                      <SelectItem key={version} value={version}>
                        {version}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortIndex)}>
                  <SelectTrigger className="w-full sm:w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">相关性</SelectItem>
                    <SelectItem value="downloads">
                      <div className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        下载量
                      </div>
                    </SelectItem>
                    <SelectItem value="follows">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        关注量
                      </div>
                    </SelectItem>
                    <SelectItem value="updated">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        最新更新
                      </div>
                    </SelectItem>
                    <SelectItem value="newest">最新发布</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-6">
        {/* Results count */}
        <div className="flex items-center justify-between">
          <div>
            {hasActiveSearch ? (
              <p className="text-sm text-gray-600">
                {projects.length > 0 ? `找到 ${projects.length} 个搜索结果` : "未找到匹配的资源"}
              </p>
            ) : (
              <p className="text-sm text-gray-600">
                {projects.length > 0 ? `热门资源 (${projects.length})` : "暂无资源"}
              </p>
            )}
          </div>
          {searchLoading && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <LoadingSpinner size="sm" />
              搜索中...
            </div>
          )}
        </div>

        {/* Projects Grid/List */}
        {projects.length > 0 ? (
          <div
            className={viewMode === "grid" ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "space-y-4"}
          >
            {projects.map((project) => (
              <ResourceCard key={project.slug} project={project} variant={viewMode} />
            ))}
          </div>
        ) : !searchLoading && !loading ? (
          <Card className="border-0 shadow-sm bg-gray-50">
            <CardContent className="text-center py-16">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">未找到匹配的资源</h3>
              <p className="text-gray-600 mb-4">尝试调整搜索条件或筛选选项</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("")
                  setSelectedProjectType("all")
                  setSelectedCategory("all")
                  setSelectedVersion("all")
                  setSortBy("downloads")
                  setHasActiveSearch(false)
                  setCurrentPage(0) // 添加：重置页码
                  handleSearch(true)
                }}
              >
                清除筛选条件
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {/* Load More */}
        {hasMore && projects.length > 0 && (
          <div className="text-center">
            <Button variant="outline" onClick={handleLoadMore} disabled={searchLoading} size="lg">
              {searchLoading ? (
                <>
                  <LoadingSpinner size="sm" />
                  加载中...
                </>
              ) : (
                "加载更多"
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
