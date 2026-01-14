import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { DashboardView } from '@/components/dashboard/dashboard-view'

export default async function DashboardPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")

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
}
