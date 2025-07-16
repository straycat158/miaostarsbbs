"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download, Heart, Calendar, ExternalLink, ImageIcon } from "lucide-react"
import type { ModrinthProject } from "@/lib/modrinth-api"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"

interface ResourceCardProps {
  project: ModrinthProject
  variant?: "grid" | "list"
}

export default function ResourceCard({ project, variant = "grid" }: ResourceCardProps) {
  const getProjectTypeLabel = (type: string) => {
    switch (type) {
      case "mod":
        return "模组"
      case "modpack":
        return "整合包"
      case "resourcepack":
        return "资源包"
      case "shader":
        return "着色器"
      default:
        return type
    }
  }

  const getProjectTypeColor = (type: string) => {
    switch (type) {
      case "mod":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "modpack":
        return "bg-green-50 text-green-700 border-green-200"
      case "resourcepack":
        return "bg-purple-50 text-purple-700 border-purple-200"
      case "shader":
        return "bg-orange-50 text-orange-700 border-orange-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M"
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K"
    }
    return num.toString()
  }

  if (variant === "list") {
    return (
      <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200">
        <CardContent className="p-4">
          <div className="flex gap-4">
            {/* Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 border">
                {project.icon_url ? (
                  <img
                    src={project.icon_url || "/placeholder.svg"}
                    alt={project.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg"
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-6 w-6 text-gray-400" />
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getProjectTypeColor(project.project_type)}>
                      {getProjectTypeLabel(project.project_type)}
                    </Badge>
                    {project.categories.slice(0, 2).map((category) => (
                      <Badge key={category} variant="outline" className="text-xs">
                        {category}
                      </Badge>
                    ))}
                  </div>

                  <h3 className="font-semibold text-lg text-gray-900 line-clamp-1 mb-1">{project.title}</h3>

                  <p className="text-gray-600 text-sm line-clamp-2 mb-3">{project.description}</p>

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Download className="h-3 w-3" />
                      {formatNumber(project.downloads)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      {formatNumber(project.follows)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDistanceToNow(new Date(project.date_modified), {
                        addSuffix: true,
                        locale: zhCN,
                      })}
                    </div>
                  </div>
                </div>

                <Button size="sm" variant="outline" asChild>
                  <a
                    href={`https://modrinth.com/${project.project_type}/${project.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    查看
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-white overflow-hidden group">
      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        {project.icon_url ? (
          <img
            src={project.icon_url || "/placeholder.svg"}
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.svg"
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="h-16 w-16 text-gray-400" />
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

        {/* Project Type Badge */}
        <div className="absolute top-3 left-3">
          <Badge className={getProjectTypeColor(project.project_type)}>
            {getProjectTypeLabel(project.project_type)}
          </Badge>
        </div>

        {/* Gallery indicator */}
        {project.gallery.length > 0 && (
          <div className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
            <ImageIcon className="h-3 w-3" />
            {project.gallery.length}
          </div>
        )}
      </div>

      {/* Content */}
      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg leading-tight line-clamp-2 mb-2">{project.title}</h3>
            <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">{project.description}</p>
          </div>

          {/* Categories */}
          {project.categories.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {project.categories.slice(0, 3).map((category) => (
                <Badge key={category} variant="outline" className="text-xs">
                  {category}
                </Badge>
              ))}
              {project.categories.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{project.categories.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Download className="h-3 w-3" />
                {formatNumber(project.downloads)}
              </div>
              <div className="flex items-center gap-1">
                <Heart className="h-3 w-3" />
                {formatNumber(project.follows)}
              </div>
            </div>

            <Button size="sm" variant="outline" asChild>
              <a
                href={`https://modrinth.com/${project.project_type}/${project.slug}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                查看
              </a>
            </Button>
          </div>

          {/* Last updated */}
          <div className="text-xs text-gray-400 flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            更新于 {formatDistanceToNow(new Date(project.date_modified), { addSuffix: true, locale: zhCN })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
