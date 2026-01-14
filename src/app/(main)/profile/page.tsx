import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { ProfileEditor } from "@/components/profile/profile-editor"
import { Eye } from 'lucide-react'
import Link from 'next/link'

export default async function ProfilePage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    if (!profile) return <div>Perfil não encontrado</div>

    return (
        <div className="container mx-auto py-8 px-4 md:px-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Meu Perfil</h1>
                    <p className="text-muted-foreground">Gerencie suas informações públicas e destaques.</p>
                </div>
                <Link
                    href={`/member/${profile.id}`}
                    target="_blank"
                    className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-lg transition-colors font-medium text-sm"
                >
                    <Eye className="w-4 h-4" />
                    Ver Perfil Público
                </Link>
            </div>

            <ProfileEditor profile={profile} />
        </div>
    )
}
