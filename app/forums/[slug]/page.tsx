import EnhancedThreadList from "@/components/forum/enhanced-thread-list"
import { supabase } from "@/lib/supabase"
import { notFound } from "next/navigation"

interface ForumPageProps {
  params: {
    slug: string
  }
}

export default async function ForumPage({ params }: ForumPageProps) {
  const { data: forum } = await supabase.from("forums").select("name, slug").eq("slug", params.slug).single()

  if (!forum) {
    notFound()
  }

  return <EnhancedThreadList forumSlug={forum.slug} forumName={forum.name} />
}
