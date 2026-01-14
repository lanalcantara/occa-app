import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { DashboardView } from '@/components/dashboard/dashboard-view'
import { ShowcaseView } from '@/components/showcase/showcase-view'

// Force dynamic since we check session
export const dynamic = 'force-dynamic'

export default async function Home() {
  const supabase = await createClient()

  // 1. Check Session
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    // --- AUTHENTICATED USER FLOW ---

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, role, category, points, onboarding_completed')
      .eq('id', user.id)
      .single()

    // Redirects based on role/status
    if (!profile?.onboarding_completed) redirect("/onboarding")
    if (profile?.role === 'admin') redirect("/admin")

    // Fetch User Data for Dashboard
    const { data: tasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('assigned_to', user.id)
      .neq('status', 'completed')
      .order('created_at', { ascending: false })

    return <DashboardView profile={profile} tasks={tasks || []} />

  } else {
    // --- PUBLIC VISITOR FLOW (SHOWCASE) ---

    // Fetch public profiles for the showcase (limit to e.g. 8 random or top sorted)
    const { data: publicProfiles } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, category, points')
      .neq('role', 'admin') // Don't show admins in talent list usually
      .limit(8)
      .order('points', { ascending: false }) // Show top performers?

    return <ShowcaseView publicProfiles={publicProfiles || []} />
  }
}
