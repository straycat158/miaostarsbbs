import EnhancedThreadList from "@/components/forum/enhanced-thread-list"
import { supabase } from "@/lib/supabase"
import { notFound } from "next/navigation"

interface ForumPageProps {
  params: { slug: string }
}

export default async function ForumPage({ params }: ForumPageProps) {
  // 1 Decode & normalize slug
  const rawSlug = Array.isArray(params.slug) ? params.slug[0] : params.slug
  const slug = decodeURIComponent(rawSlug).toLowerCase()

  // 2 Query Supabase (graceful error handling)
  const { data: forum, error } = await supabase.from("forums").select("name, slug").eq("slug", slug).maybeSingle()

  if (error || !forum) {
    notFound()
  }

  return <EnhancedThreadList forumSlug={forum.slug} forumName={forum.name} />
}
