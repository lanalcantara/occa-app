import { createClient } from "@/lib/supabase-server"
import Link from "next/link"
import { ExternalLink } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function TalentsPage() {
    const supabase = await createClient()

    // Fetch only General Members (membro2 / is_social_club = false)
    const { data: members } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_social_club', false)
        .order('full_name')

    return (
        <div className="min-h-screen bg-background text-foreground font-sans">
            <div className="container mx-auto py-16 px-6">
                <header className="mb-16 text-center">
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4">
                        Talentos OCCA
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Conheça os membros da nossa comunidade criativa.
                    </p>
                </header>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
                    {members?.map((member) => (
                        <Link
                            key={member.id}
                            href={`/member/${member.id}`}
                            className="group flex flex-col items-center text-center"
                        >
                            <div className="w-40 h-40 md:w-56 md:h-56 rounded-full bg-zinc-900 overflow-hidden mb-6 border border-white/5 group-hover:border-primary/50 transition-colors relative">
                                {member.avatar_url ? (
                                    <img
                                        src={member.avatar_url}
                                        alt={member.full_name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-white/10">
                                        {member.full_name?.charAt(0)}
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <ExternalLink className="w-8 h-8 text-white" />
                                </div>
                            </div>

                            <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                                {member.full_name}
                            </h3>
                            <p className="text-sm text-muted-foreground uppercase tracking-wider mt-1">
                                {member.category || 'Membro OCCA'}
                            </p>
                        </Link>
                    ))}

                    {(!members || members.length === 0) && (
                        <div className="col-span-full text-center py-20 text-muted-foreground border border-dashed border-white/10 rounded-2xl">
                            Nenhum talento encontrado no momento.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
