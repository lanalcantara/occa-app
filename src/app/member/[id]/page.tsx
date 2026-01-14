import { createClient } from "@/lib/supabase-server"
import { notFound } from "next/navigation"
import { LinkIcon, MapPin, Mail, Calendar, ExternalLink } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const { id } = await params

    // Fetch profile
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single()

    if (error) {
        console.error("Error fetching profile:", error)
    }

    if (!profile) return notFound()

    // Parse cards safely
    const customCards = Array.isArray(profile.custom_cards) ? profile.custom_cards : []

    return (
        <div className="min-h-screen bg-background text-foreground font-sans pb-20">
            {/* Cover Image */}
            <div className="h-64 md:h-80 w-full bg-zinc-900 relative overflow-hidden">
                {profile.cover_url ? (
                    <img
                        src={profile.cover_url}
                        alt="Cover"
                        className="w-full h-full object-cover opacity-80"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-r from-primary/20 via-background to-primary/10" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            </div>

            <div className="max-w-5xl mx-auto px-6 relative z-10 -mt-24 md:-mt-32">
                {/* Header Info */}
                <div className="flex flex-col md:flex-row items-end md:items-end gap-6 mb-8">
                    {/* Avatar */}
                    <div className="w-32 h-32 md:w-48 md:h-48 rounded-2xl bg-black border-4 border-background shadow-2xl overflow-hidden relative group">
                        {profile.avatar_url ? (
                            <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl font-bold bg-zinc-800 text-white/20">
                                {profile.full_name?.charAt(0)}
                            </div>
                        )}
                    </div>

                    {/* Name & Role */}
                    <div className="flex-1 pb-2 text-center md:text-left">
                        <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-2">{profile.full_name}</h1>
                        <p className="text-muted-foreground font-medium uppercase tracking-wider text-sm flex items-center justify-center md:justify-start gap-2">
                            {profile.category || 'Membro OCCA'}
                            {profile.role === 'admin' && <span className="bg-primary/20 text-primary px-2 py-0.5 rounded text-[10px]">ADMIN</span>}
                        </p>
                    </div>

                    {/* Contact / Actions */}
                    <div className="flex gap-3 pb-4">
                        {/* Add social links or contact button here later */}
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-10">
                    {/* Sidebar / Info */}
                    <div className="space-y-8">
                        {/* Bio Section */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold border-b border-white/10 pb-2">Sobre</h2>
                            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                {profile.bio || "Este membro ainda não escreveu uma biografia."}
                            </p>
                        </div>

                        {/* Contact Info */}
                        {profile.contact_info && (
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold border-b border-white/10 pb-2">Contato</h2>
                                <p className="text-muted-foreground whitespace-pre-wrap">{profile.contact_info}</p>
                            </div>
                        )}
                    </div>

                    {/* Main Content / Cards */}
                    <div className="md:col-span-2 space-y-8">
                        <h2 className="text-xl font-bold border-b border-white/10 pb-2">Destaques & Projetos</h2>

                        {customCards.length > 0 ? (
                            <div className="grid sm:grid-cols-2 gap-4">
                                {customCards.map((card: any, idx: number) => (
                                    <a
                                        key={idx}
                                        href={card.link || '#'}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group bg-surface border border-white/5 rounded-xl overflow-hidden hover:border-primary/50 transition-all hover:-translate-y-1 block"
                                    >
                                        <div className="h-40 bg-zinc-900 overflow-hidden relative">
                                            {card.image_url ? (
                                                <img src={card.image_url} alt={card.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-white/5 text-white/10">
                                                    <ExternalLink className="w-8 h-8" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">{card.title}</h3>
                                            <p className="text-sm text-muted-foreground line-clamp-3">{card.description}</p>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 border border-dashed border-white/10 rounded-xl text-center text-muted-foreground">
                                <p>Nenhum destaque adicionado ainda.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
