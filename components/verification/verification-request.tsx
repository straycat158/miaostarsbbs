"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shield, Star, Award, Users, CheckCircle, Clock, XCircle, Eye, Send, Info } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface VerificationRequest {
  id: string
  verification_type: string
  reason: string
  evidence_urls: string[]
  contact_info: any
  status: string
  admin_notes?: string
  created_at: string
  updated_at: string
}

const verificationTypes = [
  {
    value: "official",
    label: "官方认证",
    icon: Shield,
    description: "官方机构、政府部门、知名企业等",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    value: "expert",
    label: "专家认证",
    icon: Star,
    description: "行业专家、学者、技术大牛等",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    value: "contributor",
    label: "贡献者认证",
    icon: Award,
    description: "社区活跃贡献者、优质内容创作者",
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    value: "partner",
    label: "合作伙伴",
    icon: Users,
    description: "合作机构、友好社区、媒体伙伴",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
]

const statusConfig = {
  pending: { label: "待审核", icon: Clock, color: "text-yellow-600" },
  under_review: { label: "审核中", icon: Eye, color: "text-blue-600" },
  approved: { label: "已通过", icon: CheckCircle, color: "text-green-600" },
  rejected: { label: "已拒绝", icon: XCircle, color: "text-red-600" },
}

export default function VerificationRequest() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [requests, setRequests] = useState<VerificationRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const [formData, setFormData] = useState({
    verification_type: "",
    reason: "",
    evidence_urls: [""],
    contact_info: {
      email: "",
      phone: "",
      organization: "",
      position: "",
    },
  })

  const router = useRouter()

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth")
        return
      }

      setUser(user)

      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      setProfile(profile)

      const { data: requests } = await supabase
        .from("verification_requests")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      setRequests(requests || [])
    } catch (error: any) {
      toast({
        title: "错误",
        description: "获取用户信息失败",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    if (field.startsWith("contact_info.")) {
      const contactField = field.split(".")[1]
      setFormData((prev) => ({
        ...prev,
        contact_info: {
          ...prev.contact_info,
          [contactField]: value,
        },
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }))
    }
  }

  const handleEvidenceUrlChange = (index: number, value: string) => {
    const newUrls = [...formData.evidence_urls]
    newUrls[index] = value
    setFormData((prev) => ({
      ...prev,
      evidence_urls: newUrls,
    }))
  }

  const addEvidenceUrl = () => {
    setFormData((prev) => ({
      ...prev,
      evidence_urls: [...prev.evidence_urls, ""],
    }))
  }

  const removeEvidenceUrl = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      evidence_urls: prev.evidence_urls.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.verification_type || !formData.reason.trim()) {
      toast({
        title: "表单错误",
        description: "请填写所有必填字段",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)

    try {
      const { error } = await supabase.from("verification_requests").insert({
        user_id: user.id,
        verification_type: formData.verification_type,
        reason: formData.reason.trim(),
        evidence_urls: formData.evidence_urls.filter((url) => url.trim()),
        contact_info: formData.contact_info,
      })

      if (error) throw error

      toast({
        title: "申请提交成功",
        description: "您的认证申请已提交，我们会尽快审核",
      })

      setShowForm(false)
      setFormData({
        verification_type: "",
        reason: "",
        evidence_urls: [""],
        contact_info: {
          email: "",
          phone: "",
          organization: "",
          position: "",
        },
      })

      fetchUserData()
    } catch (error: any) {
      toast({
        title: "提交失败",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const selectedType = verificationTypes.find((type) => type.value === formData.verification_type)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-gray-900 flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            身份认证申请
          </CardTitle>
          <p className="text-gray-600">通过身份认证，获得专属认证标志，提升您在社区的可信度和影响力</p>
        </CardHeader>
      </Card>

      {/* Current Status */}
      {profile?.is_verified && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            您已通过 {verificationTypes.find((t) => t.value === profile.verification_type)?.label} 认证
          </AlertDescription>
        </Alert>
      )}

      {/* Verification Types */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">认证类型说明</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {verificationTypes.map((type) => {
              const Icon = type.icon
              return (
                <div key={type.value} className={`p-4 rounded-lg border ${type.bgColor}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className={`h-5 w-5 ${type.color}`} />
                    <h3 className="font-semibold text-gray-900">{type.label}</h3>
                  </div>
                  <p className="text-sm text-gray-600">{type.description}</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Application Form */}
      {!showForm && !profile?.is_verified && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Button onClick={() => setShowForm(true)} size="lg">
                <Send className="mr-2 h-4 w-4" />
                申请认证
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>提交认证申请</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="verification_type">认证类型 *</Label>
                <Select
                  value={formData.verification_type}
                  onValueChange={(value) => handleInputChange("verification_type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择认证类型" />
                  </SelectTrigger>
                  <SelectContent>
                    {verificationTypes.map((type) => {
                      const Icon = type.icon
                      return (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <Icon className={`h-4 w-4 ${type.color}`} />
                            {type.label}
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
                {selectedType && <p className="text-sm text-gray-600">{selectedType.description}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">申请理由 *</Label>
                <Textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => handleInputChange("reason", e.target.value)}
                  placeholder="请详细说明您申请此类认证的理由和资格..."
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>证明材料链接</Label>
                {formData.evidence_urls.map((url, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={url}
                      onChange={(e) => handleEvidenceUrlChange(index, e.target.value)}
                      placeholder="https://example.com/证明材料"
                    />
                    {formData.evidence_urls.length > 1 && (
                      <Button type="button" variant="outline" onClick={() => removeEvidenceUrl(index)}>
                        删除
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addEvidenceUrl}>
                  添加链接
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">联系邮箱</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.contact_info.email}
                    onChange={(e) => handleInputChange("contact_info.email", e.target.value)}
                    placeholder="your@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">联系电话</Label>
                  <Input
                    id="phone"
                    value={formData.contact_info.phone}
                    onChange={(e) => handleInputChange("contact_info.phone", e.target.value)}
                    placeholder="手机号码"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="organization">所属机构</Label>
                  <Input
                    id="organization"
                    value={formData.contact_info.organization}
                    onChange={(e) => handleInputChange("contact_info.organization", e.target.value)}
                    placeholder="公司/机构名称"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">职位/头衔</Label>
                  <Input
                    id="position"
                    value={formData.contact_info.position}
                    onChange={(e) => handleInputChange("contact_info.position", e.target.value)}
                    placeholder="您的职位或头衔"
                  />
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  提交申请后，我们的审核团队会在3-7个工作日内处理您的申请。请确保提供的信息真实有效。
                </AlertDescription>
              </Alert>

              <div className="flex gap-3">
                <Button type="submit" disabled={submitting}>
                  {submitting ? "提交中..." : "提交申请"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  取消
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Application History */}
      {requests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>申请记录</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {requests.map((request) => {
                const type = verificationTypes.find((t) => t.value === request.verification_type)
                const status = statusConfig[request.status as keyof typeof statusConfig]
                const StatusIcon = status.icon
                const TypeIcon = type?.icon || Shield

                return (
                  <div key={request.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <TypeIcon className={`h-5 w-5 ${type?.color || "text-gray-600"}`} />
                        <span className="font-medium">{type?.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusIcon className={`h-4 w-4 ${status.color}`} />
                        <Badge variant="outline" className={status.color}>
                          {status.label}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{request.reason}</p>
                    <div className="text-xs text-gray-500">
                      申请时间: {new Date(request.created_at).toLocaleString("zh-CN")}
                    </div>
                    {request.admin_notes && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                        <strong>管理员备注:</strong> {request.admin_notes}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
