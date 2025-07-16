"use client"

import { createContext, useContext, type ReactNode } from "react"

interface ContentContext {
  mode: "forum" | "thread" | "reply"
  contextId?: string
  contextData?: {
    forumName?: string
    forumSlug?: string
    threadTitle?: string
    threadId?: string
    parentContent?: string
  }
}

const ContentContextContext = createContext<ContentContext | null>(null)

interface ContentContextProviderProps {
  children: ReactNode
  value: ContentContext
}

export function ContentContextProvider({ children, value }: ContentContextProviderProps) {
  return <ContentContextContext.Provider value={value}>{children}</ContentContextContext.Provider>
}

export function useContentContext() {
  const context = useContext(ContentContextContext)
  if (!context) {
    throw new Error("useContentContext must be used within a ContentContextProvider")
  }
  return context
}
