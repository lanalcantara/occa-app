import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { UserLayoutClient } from "@/components/user-layout-client"

export default async function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return redirect("/login")

    // Optional: Check if user is admin and redirect to /admin? 
    // Or allow admins to see user view too? 
    // Usually admins might want to see user view. 
    // If we force redirect, admin can't see "My Profile" as user.
    // Let's keep it simple: Authenticated = Access.

    return <UserLayoutClient>{children}</UserLayoutClient>
}
