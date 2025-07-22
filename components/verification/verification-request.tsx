"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Star, Award, Users, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"
import VerificationBadge from "@/components/ui/verification-badge"

interface VerificationRequest {
  id: string
  verification_type: string
  reason: string
  evidence?: string
  contact_info?: string
  status: string
  admin_note?: string
  created_at: string
  updated_at: string
}

const verificationTypes = [
  {
    value: "official",
    label: "官方认证",
    icon: Shield,
    description: "政府机构、官方组织、企业官方账号",
    requirements: "需要提供营业执照、组织机构代码证或其他官方证明文件",
    color: "text-blue-600",
  },
  {
    value: "expert",
    label: "专家认证",
    icon: Star,
    description: "行业专家、学者、技术大牛",
    requirements: "需要提供学历证明、职业资格证书、作品集或相关证明材料",
    color: "text-purple-600",
  },
  {
    value: "contributor",
    label: "贡献者认证",
    icon: Award,
    description: "社区活跃贡献者、优质内容创作者",
    requirements: "需要在社区有一定的活跃度和优质内容贡献",
    color: "text-green-600",
  },
  {
    value: "partner",
    label: "合作伙伴",
    icon: Users,
    description: "合作机构、友好社区、媒体伙伴",
    requirements: "需要提供合作协议或相关证明文件",
    color: "text-orange-600",
  },
]

export default function VerificationRequest() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [requests, setRequests] = useState<VerificationRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    verification_type: "",
    reason: "",
    evidence: "",
    contact_info: "",
  })

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast({
          title: "请先登录",
          description: "您需要登录后才能申请认证",
          variant: "destructive",
        })
        return
      }

      setUser(user)

      // 获取用户资料
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      setProfile(profile)

      // 获取认证申请记录
      const { data: requests } = await supabase
        .from("verification_requests")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      setRequests(requests || [])
    } catch (error) {
      console.error("Error fetching user data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "请先登录",
        variant: "destructive",
      })
      return
    }

    if (!formData.verification_type || !formData.reason) {
      toast({
        title: "请填写必填信息",
        description: "认证类型和申请理由为必填项",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)

    try {
      const { error } = await supabase.from("verification_requests").insert({
        user_id: user.id,
        verification_type: formData.verification_type,
        reason: formData.reason,
        evidence: formData.evidence,
        contact_info: formData.contact_info,
      })

      if (error) throw error

      toast({
        title: "申请提交成功",
        description: "我们将在3-5个工作日内审核您的申请",
      })

      // 重置表单
      setFormData({
        verification_type: "",
        reason: "",
        evidence: "",
        contact_info: "",
      })

      // 刷新申请记录
      fetchUserData()
    } catch (error: any) {
      console.error("Error submitting verification request:", error)
      toast({
        title: "提交失败",
        description: error.message || "请稍后重试",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "审核中"
      case "approved":
        return "已通过"
      case "rejected":
        return "已拒绝"
      default:
        return "未知状态"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>请先登录后再申请认证</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  // 如果用户已经认证
  if (profile?.is_verified) {
    return (
      <div className="space-y-6">
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              认证成功
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-green-700">您已获得认证：</span>
              <VerificationBadge verificationType={profile.verification_type} showLabel />
            </div>
            {profile.verification_note && <p className="text-green-700 text-sm">{profile.verification_note}</p>}
          </CardContent>
        </Card>

        {/* 显示申请历史 */}
        {requests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>申请历史</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {requests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <VerificationBadge verificationType={request.verification_type} />
                        <span className="font-medium">
                          {verificationTypes.find((t) => t.value === request.verification_type)?.label}
                        </span>
                      </div>
                      <Badge className={getStatusColor(request.status)}>
                        {getStatusIcon(request.status)}
                        <span className="ml-1">{getStatusText(request.status)}</span>
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{request.reason}</p>
                    {request.admin_note && (
                      <div className="bg-gray-50 p-3 rounded text-sm">
                        <strong>管理员备注：</strong> {request.admin_note}
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      申请时间：{new Date(request.created_at).toLocaleString("zh-CN")}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* 认证类型介绍 */}
      <div className="grid gap-6 md:grid-cols-2">
        {verificationTypes.map((type) => {
          const Icon = type.icon
          return (
            <Card key={type.value} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${type.color}`}>
                  <Icon className="h-5 w-5" />
                  {type.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-3">{type.description}</p>
                <div className="text-sm text-gray-500">
                  <strong>申请要求：</strong>
                  <p className="mt-1">{type.requirements}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* 申请表单 */}
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
                onValueChange={(value) => setFormData({ ...formData, verification_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="请选择认证类型" />
                </SelectTrigger>
                <SelectContent>
                  {verificationTypes.map((type) => {
                    const Icon = type.icon
                    return (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">申请理由 *</Label>
              <Textarea
                id="reason"
                placeholder="请详细说明您申请此认证的理由..."
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="evidence">证明材料</Label>
              <Textarea
                id="evidence"
                placeholder="请提供相关证明材料的链接或描述..."
                value={formData.evidence}
                onChange={(e) => setFormData({ ...formData, evidence: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_info">联系方式</Label>
              <Input
                id="contact_info"
                placeholder="邮箱、电话或其他联系方式"
                value={formData.contact_info}
                onChange={(e) => setFormData({ ...formData, contact_info: e.target.value })}
              />
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                提交申请后，我们将在3-5个工作日内进行审核。请确保提供的信息真实有效，虚假信息将导致申请被拒绝。
              </AlertDescription>
            </Alert>

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? "提交中..." : "提交申请"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* 申请历史 */}
      {requests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>申请历史</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {requests.map((request) => (
                <div key={request.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <VerificationBadge verificationType={request.verification_type} />
                      <span className="font-medium">
                        {verificationTypes.find((t) => t.value === request.verification_type)?.label}
                      </span>
                    </div>
                    <Badge className={getStatusColor(request.status)}>
                      {getStatusIcon(request.status)}
                      <span className="ml-1">{getStatusText(request.status)}</span>
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{request.reason}</p>
                  {request.admin_note && (
                    <div className="bg-gray-50 p-3 rounded text-sm">
                      <strong>管理员备注：</strong> {request.admin_note}
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    申请时间：{new Date(request.created_at).toLocaleString("zh-CN")}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
