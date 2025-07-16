import { supabase } from "./supabase"

export interface UploadedImage {
  id: string
  url: string
  name: string
  size: number
}

export const uploadContentImage = async (file: File, userId: string): Promise<UploadedImage> => {
  try {
    // Generate unique filename
    const fileExt = file.name.split(".").pop()
    const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`

    // Upload file to Supabase storage
    const { data, error } = await supabase.storage.from("content-images").upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (error) {
      throw error
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("content-images").getPublicUrl(fileName)

    return {
      id: fileName,
      url: publicUrl,
      name: file.name,
      size: file.size,
    }
  } catch (error: any) {
    throw new Error(`图片上传失败: ${error.message}`)
  }
}

export const deleteContentImage = async (imageId: string): Promise<void> => {
  try {
    const { error } = await supabase.storage.from("content-images").remove([imageId])

    if (error) {
      console.error("Error deleting content image:", error)
    }
  } catch (error) {
    console.error("Error deleting content image:", error)
  }
}

export const validateContentImage = (file: File): string | null => {
  // Check file type
  if (!file.type.startsWith("image/")) {
    return "请选择图片文件"
  }

  // Check file size (10MB limit for content images)
  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    return "图片大小不能超过 10MB"
  }

  return null
}
