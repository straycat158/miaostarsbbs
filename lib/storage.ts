import { supabase } from "./supabase"

export const uploadAvatar = async (file: File, userId: string): Promise<string> => {
  try {
    // Generate unique filename
    const fileExt = file.name.split(".").pop()
    const fileName = `${userId}/${Date.now()}.${fileExt}`

    // Upload file to Supabase storage
    const { data, error } = await supabase.storage.from("avatars").upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (error) {
      throw error
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(fileName)

    return publicUrl
  } catch (error: any) {
    throw new Error(`头像上传失败: ${error.message}`)
  }
}

export const deleteAvatar = async (avatarUrl: string): Promise<void> => {
  try {
    // Extract file path from URL
    const urlParts = avatarUrl.split("/avatars/")
    if (urlParts.length < 2) return

    const filePath = urlParts[1]

    const { error } = await supabase.storage.from("avatars").remove([filePath])

    if (error) {
      console.error("Error deleting avatar:", error)
    }
  } catch (error) {
    console.error("Error deleting avatar:", error)
  }
}

export const validateImageFile = (file: File): string | null => {
  // Check file type
  if (!file.type.startsWith("image/")) {
    return "请选择图片文件"
  }

  // Check file size (5MB limit)
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    return "图片大小不能超过 5MB"
  }

  // Check image dimensions (optional)
  return null
}
