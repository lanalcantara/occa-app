import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { AdminLayoutClient } from "@/components/admin/admin-layout-client"

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return redirect("/login")

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

    if (profile?.role !== "admin") {
        return redirect("/")
    }

    return <AdminLayoutClient>{children}</AdminLayoutClient>
}
