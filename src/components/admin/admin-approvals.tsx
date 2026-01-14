'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Check, X, User } from 'lucide-react'

type Profile = {
    id: string
    full_name: string
    avatar_url: string | null
    pending_avatar_url: string | null
    role: string
}

export function AdminAvatarApprovals() {
    const [pendingProfiles, setPendingProfiles] = useState<Profile[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        fetchPending()
    }, [])

    async function fetchPending() {
        setLoading(true)
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .not('pending_avatar_url', 'is', null) // Only fetch those with pending avatars

        if (data) setPendingProfiles(data as Profile[])
        setLoading(false)
    }

    async function handleApprove(profile: Profile) {
        if (!confirm(`Aprovar foto de ${profile.full_name}?`)) return

        // 1. Move pending -> actual
        // 2. Clear pending
        const { error } = await supabase
            .from('profiles')
            .update({
                avatar_url: profile.pending_avatar_url,
                pending_avatar_url: null
            })
            .eq('id', profile.id)

        if (error) {
            alert('Erro ao aprovar: ' + error.message)
        } else {
            setPendingProfiles(prev => prev.filter(p => p.id !== profile.id))
        }
    }

    async function handleReject(profile: Profile) {
        if (!confirm(`Rejeitar foto de ${profile.full_name}?`)) return

        // 1. Just clear pending
        const { error } = await supabase
            .from('profiles')
            .update({
                pending_avatar_url: null
            })
            .eq('id', profile.id)

        if (error) {
            alert('Erro ao rejeitar: ' + error.message)
        } else {
            setPendingProfiles(prev => prev.filter(p => p.id !== profile.id))
        }
    }

    if (loading) return <div className="p-8 text-center text-muted-foreground">Carregando aprovações...</div>

    if (pendingProfiles.length === 0) {
        return (
            <div className="p-12 text-center border border-white/10 rounded-xl bg-surface/30">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-8 h-8 text-muted-foreground opacity-50" />
                </div>
                <h3 className="text-lg font-medium text-white">Tudo limpo!</h3>
                <p className="text-muted-foreground">Nenhuma foto pendente de aprovação.</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingProfiles.map(profile => (
                <div key={profile.id} className="bg-surface border border-white/10 rounded-xl overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-white/5 bg-white/[0.02]">
                        <h3 className="font-bold">{profile.full_name}</h3>
                        <p className="text-xs text-muted-foreground uppercase">{profile.role}</p>
                    </div>

                    <div className="flex-1 p-4 flex gap-4 items-center justify-center bg-black/20">
                        {/* Comparison: Old vs New */}
                        <div className="flex flex-col items-center gap-2">
                            <span className="text-xs text-muted-foreground mb-1">Atual</span>
                            <div className="w-20 h-20 rounded-full border border-white/10 bg-surface overflow-hidden">
                                {profile.avatar_url ? (
                                    <img src={profile.avatar_url} className="w-full h-full object-cover grayscale opacity-60" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white/20 font-bold">
                                        {profile.full_name.charAt(0)}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="text-muted-foreground">→</div>

                        <div className="flex flex-col items-center gap-2">
                            <span className="text-xs text-yellow-500 font-bold mb-1">Nova (Pendente)</span>
                            <div className="w-24 h-24 rounded-full border-2 border-yellow-500/50 bg-black overflow-hidden shadow-[0_0_20px_rgba(234,179,8,0.2)]">
                                {profile.pending_avatar_url && (
                                    <img src={profile.pending_avatar_url} className="w-full h-full object-cover" />
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="p-4 flex gap-3">
                        <button
                            onClick={() => handleReject(profile)}
                            className="flex-1 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2 font-medium"
                        >
                            <X className="w-4 h-4" /> Rejeitar
                        </button>
                        <button
                            onClick={() => handleApprove(profile)}
                            className="flex-1 py-2 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg hover:bg-green-500/20 transition-colors flex items-center justify-center gap-2 font-bold"
                        >
                            <Check className="w-4 h-4" /> Aprovar
                        </button>
                    </div>
                </div>
            ))}
        </div>
    )
}
