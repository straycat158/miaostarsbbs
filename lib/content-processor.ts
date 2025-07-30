export interface ProcessedContent {
  html: string
  images: string[]
}

export function processContent(content: string): ProcessedContent {
  const images: string[] = []

  // 提取图片链接
  const imageRegex = /!\[([^\]]*)\]$$([^)]+)$$/g
  let match
  while ((match = imageRegex.exec(content)) !== null) {
    images.push(match[2])
  }

  // 处理图片链接 - 移除Markdown图片语法，因为我们会单独显示
  let processedContent = content.replace(imageRegex, "")

  // 处理普通链接
  const linkRegex = /\[([^\]]+)\]$$([^)]+)$$/g
  processedContent = processedContent.replace(
    linkRegex,
    '<a href="$2" class="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>',
  )

  // 处理@提及
  const mentionRegex = /@(\w+)/g
  processedContent = processedContent.replace(mentionRegex, '<span class="text-blue-600 font-medium">@$1</span>')

  // 处理粗体
  processedContent = processedContent.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")

  // 处理斜体
  processedContent = processedContent.replace(/\*(.*?)\*/g, "<em>$1</em>")

  // 处理代码
  processedContent = processedContent.replace(
    /`([^`]+)`/g,
    '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">$1</code>',
  )

  // 处理换行
  processedContent = processedContent.replace(/\n\n/g, "</p><p>")
  processedContent = processedContent.replace(/\n/g, "<br>")

  // 包装段落
  if (processedContent.trim()) {
    processedContent = `<p>${processedContent}</p>`
  }

  return {
    html: processedContent,
    images,
  }
}
