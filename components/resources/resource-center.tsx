"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Grid, List, Package, Loader2 } from "lucide-react"
import ResourceCard from "./resource-card"
import { getProjects, type ModrinthProject } from "@/lib/modrinth-api"
import { toast } from "@/hooks/use-toast"

export default function ResourceCenter() {
  const [resources, setResources] = useState<ModrinthProject[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedVersion, setSelectedVersion] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState<string>("relevance")

  useEffect(() => {
    fetchResources()
  }, [])

  const fetchResources = async () => {
    try {
      setLoading(true)
      const data = await getProjects()
      setResources(data)
    } catch (error: any) {
      console.error("Error fetching resources:", error)
      toast({
        title: "加载失败",
        description: "无法加载资源列表",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchResources()
      return
    }

    try {
      setLoading(true)
      const data = await getProjects({
        query: searchTerm,
        categories: selectedCategory !== "all" ? [selectedCategory] : [],
        versions: selectedVersion !== "all" ? [selectedVersion] : [],
      })
      setResources(data)
    } catch (error: any) {
      console.error("Error searching resources:", error)
      toast({
        title: "搜索失败",
        description: "搜索时出现错误",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClearFilters = () => {
    setSearchTerm("")
    setSelectedCategory("all")
    setSelectedVersion("all")
    setSortBy("relevance")
    fetchResources()
  }

  const filteredResources = resources.sort((a, b) => {
    switch (sortBy) {
      case "downloads":
        return b.downloads - a.downloads
      case "updated":
        return new Date(b.date_modified).getTime() - new Date(a.date_modified).getTime()
      case "created":
        return new Date(b.date_created).getTime() - new Date(a.date_created).getTime()
      case "name":
        return a.title.localeCompare(b.title)
      default:
        return 0
    }
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">正在加载资源...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="搜索资源..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700 text-white">
                搜索
              </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-48 border-gray-300">
                  <SelectValue placeholder="项目类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有类型</SelectItem>
                  <SelectItem value="mod">模组</SelectItem>
                  <SelectItem value="resourcepack">资源包</SelectItem>
                  <SelectItem value="datapack">数据包</SelectItem>
                  <SelectItem value="shader">光影</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedVersion} onValueChange={setSelectedVersion}>
                <SelectTrigger className="w-full sm:w-48 border-gray-300">
                  <SelectValue placeholder="游戏版本" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有版本</SelectItem>
                  <SelectItem value="1.20.1">1.20.1</SelectItem>
                  <SelectItem value="1.19.4">1.19.4</SelectItem>
                  <SelectItem value="1.18.2">1.18.2</SelectItem>
                  <SelectItem value="1.16.5">1.16.5</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-48 border-gray-300">
                  <SelectValue placeholder="排序方式" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">相关性</SelectItem>
                  <SelectItem value="downloads">下载量</SelectItem>
                  <SelectItem value="updated">最近更新</SelectItem>
                  <SelectItem value="created">最新发布</SelectItem>
                  <SelectItem value="name">名称</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={handleClearFilters} className="border-gray-300 bg-transparent">
                清除筛选
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">找到 {filteredResources.length} 个资源</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
            className={viewMode === "grid" ? "bg-blue-600 text-white" : "border-gray-300"}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
            className={viewMode === "list" ? "bg-blue-600 text-white" : "border-gray-300"}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Resources Display */}
      {filteredResources.length === 0 ? (
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-12 text-center">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">暂无资源</h3>
            <p className="text-gray-500 mb-6">{searchTerm ? "没有找到匹配的资源" : "暂时没有可用的资源"}</p>
            <Button onClick={handleClearFilters} variant="outline" className="border-gray-300 bg-transparent">
              重新加载
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
          {filteredResources.map((project) => (
            <ResourceCard key={project.slug} project={project} variant={viewMode} />
          ))}
        </div>
      )}
    </div>
  )
}
