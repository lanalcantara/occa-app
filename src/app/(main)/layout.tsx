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

    const { data: profile } = await supabase
        .from('profiles')
        .select('is_social_club')
        .eq('id', user.id)
        .single()

    const isSocialClub = profile?.is_social_club ?? false

    return <UserLayoutClient isSocialClub={isSocialClub}>{children}</UserLayoutClient>
}
