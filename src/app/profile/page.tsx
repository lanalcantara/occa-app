import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { AvatarUpload } from "@/components/profile/avatar-upload"
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function ProfilePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return redirect("/login")

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    if (!profile) return redirect("/login")

    return (
        <main className="min-h-screen bg-background text-foreground flex flex-col items-center p-4 md:p-8">
            <div className="w-full max-w-2xl space-y-8">
                <header className="flex items-center gap-4 mb-8">
                    <Link href="/" className="p-2 hover:bg-white/5 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="text-2xl font-bold">Editar Perfil</h1>
                </header>

                <div className="space-y-8">
                    <AvatarUpload userId={user.id} currentAvatar={profile.avatar_url} />

                    <div className="bg-surface/30 border border-white/5 rounded-2xl p-6 space-y-4">
                        <h3 className="font-bold opacity-80">Informações Pessoais</h3>
                        <div className="grid gap-4">
                            <div>
                                <label className="text-xs text-muted-foreground uppercase tracking-widest block mb-1">Nome Completo</label>
                                <div className="p-3 bg-black/20 rounded-lg border border-white/5 text-sm">{profile.full_name}</div>
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground uppercase tracking-widest block mb-1">Email</label>
                                <div className="p-3 bg-black/20 rounded-lg border border-white/5 text-sm">{user.email}</div>
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground uppercase tracking-widest block mb-1">Categoria Atual</label>
                                <div className="p-3 bg-black/20 rounded-lg border border-white/5 text-sm text-primary font-bold uppercase">{profile.category}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
