import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { ShowcaseView } from '@/components/showcase/showcase-view'

// Force dynamic since we check session
export const dynamic = 'force-dynamic'

export default async function Home() {
  const supabase = await createClient()

  // 1. Check Session
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    // Authenticated? Go to Dashboard
    redirect("/dashboard")
  }

  // --- PUBLIC VISITOR FLOW (SHOWCASE) ---
  const { data: publicProfiles } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, category, points')
    .neq('role', 'admin')
    .limit(8)
    .order('points', { ascending: false })

  return <ShowcaseView publicProfiles={publicProfiles || []} />
}
