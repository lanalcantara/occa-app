'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Check, X, Building2, Globe } from 'lucide-react'

type Profile = {
    id: string
    full_name: string // Company Name
    website: string
    bio: string
    approval_status: string
    avatar_url: string
}

export function AdminPartnerApprovals() {
    const [pendingPartners, setPendingPartners] = useState<Profile[]>([])
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
            .eq('approval_status', 'pending')

        if (data) setPendingPartners(data as any)
        setLoading(false)
    }

    async function handleApprove(profile: Profile) {
        if (!confirm(`Aprovar empresa ${profile.full_name}?`)) return

        const { error } = await supabase
            .from('profiles')
            .update({
                approval_status: 'verified',
                role: 'client' // Promote to client!
            })
            .eq('id', profile.id)

        if (error) {
            alert('Erro: ' + error.message)
        } else {
            setPendingPartners(prev => prev.filter(p => p.id !== profile.id))
        }
    }

    async function handleReject(profile: Profile) {
        if (!confirm(`Rejeitar empresa ${profile.full_name}?`)) return

        const { error } = await supabase
            .from('profiles')
            .update({
                approval_status: 'rejected'
            })
            .eq('id', profile.id)

        if (error) {
            alert('Erro: ' + error.message)
        } else {
            setPendingPartners(prev => prev.filter(p => p.id !== profile.id))
        }
    }

    if (loading) return <div>Checking partners...</div>
    if (pendingPartners.length === 0) return null // Don't show if empty

    return (
        <div className="space-y-4 mb-8">
            <div>
                <h2 className="text-xl font-bold flex items-center gap-2 text-blue-400">
                    <Building2 className="w-5 h-5" />
                    Novas Empresas Pendentes
                </h2>
                <p className="text-muted-foreground text-sm">Empresas aguardando acesso ao Portal do Parceiro.</p>
            </div>

            <div className="grid gap-4">
                {pendingPartners.map(p => (
                    <div key={p.id} className="bg-surface border border-blue-500/30 rounded-xl p-6 flex flex-col md:flex-row gap-6 items-start md:items-center">
                        <div className="flex-1">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                {p.full_name}
                                {p.website && (
                                    <a href={p.website} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline flex items-center gap-1">
                                        <Globe className="w-3 h-3" /> Site
                                    </a>
                                )}
                            </h3>
                            <p className="text-muted-foreground mt-2 text-sm bg-black/20 p-3 rounded-lg">{p.bio}</p>
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                            <button
                                onClick={() => handleReject(p)}
                                className="flex-1 md:flex-none px-4 py-2 border border-red-500/20 text-red-400 rounded-lg hover:bg-red-500/10 flex items-center justify-center gap-2"
                            >
                                <X className="w-4 h-4" /> Rejeitar
                            </button>
                            <button
                                onClick={() => handleApprove(p)}
                                className="flex-1 md:flex-none px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2 font-bold shadow-lg shadow-blue-500/20"
                            >
                                <Check className="w-4 h-4" /> Aprovar Acesso
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
