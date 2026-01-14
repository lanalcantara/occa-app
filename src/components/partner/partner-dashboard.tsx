'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { RequestForm } from './request-form'
import { Plus, Clock, CheckCircle, AlertCircle, LogOut } from 'lucide-react'
import { SignOutButton } from '@/components/sign-out-button'

export function PartnerDashboard({ profile }: { profile: any }) {
    const [requests, setRequests] = useState<any[]>([])
    const [isFormOpen, setIsFormOpen] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        fetchRequests()
    }, [])

    async function fetchRequests() {
        const { data } = await supabase
            .from('tasks')
            .select('*')
            .eq('created_by', profile.id) // Only my requests
            .order('created_at', { ascending: false })

        if (data) setRequests(data)
    }

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            {/* Header */}
            <header className="border-b border-white/10 bg-surface">
                <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                            Área do Parceiro
                        </h1>
                        <p className="text-sm text-muted-foreground">Bem-vindo, {profile.full_name}</p>
                    </div>
                    <SignOutButton className="text-sm text-red-400 hover:text-red-300" />
                </div>
            </header>

            <main className="flex-1 max-w-5xl mx-auto w-full p-6 grid md:grid-cols-[1fr_350px] gap-8">

                {/* Left Column: Request List */}
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold">Minhas Solicitações</h2>
                        <button
                            onClick={() => setIsFormOpen(true)}
                            className="md:hidden px-4 py-2 bg-primary text-white rounded-lg font-bold text-sm"
                        >
                            Nova Solicitação
                        </button>
                    </div>

                    <div className="grid gap-4">
                        {requests.length === 0 ? (
                            <div className="p-12 text-center border border-white/10 rounded-xl bg-surface/30 border-dashed">
                                <p className="text-muted-foreground">Você ainda não criou nenhuma solicitação.</p>
                            </div>
                        ) : (
                            requests.map(req => (
                                <div key={req.id} className="p-6 bg-surface border border-white/10 rounded-xl flex flex-col gap-2">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-lg">{req.title}</h3>
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1
                                            ${req.status === 'pending_approval' ? 'bg-yellow-500/10 text-yellow-500' :
                                                req.status === 'open' ? 'bg-blue-500/10 text-blue-500' :
                                                    req.status === 'completed' ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'}
                                        `}>
                                            {req.status === 'pending_approval' && <Clock className="w-3 h-3" />}
                                            {req.status === 'open' && <AlertCircle className="w-3 h-3" />}
                                            {req.status === 'completed' && <CheckCircle className="w-3 h-3" />}
                                            {req.status === 'pending_approval' ? 'Aguardando' :
                                                req.status === 'open' ? 'Em Andamento' :
                                                    req.status === 'completed' ? 'Concluído' : req.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{req.description}</p>
                                    <div className="pt-4 mt-2 border-t border-white/5 flex gap-4 text-xs font-mono opacity-60">
                                        <span>XP: {req.points_reward}</span>
                                        <span>{new Date(req.created_at).toLocaleDateString('pt-BR')}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Right Column: Form (Desktop) / Modal (Mobile) */}
                <div className={`
                    fixed inset-0 z-50 bg-background/80 backdrop-blur-sm p-4 flex items-center justify-center md:relative md:bg-transparent md:p-0 md:block
                    ${isFormOpen ? 'flex' : 'hidden md:block'}
                `}>
                    <div className="w-full max-w-lg bg-surface border border-white/10 rounded-2xl p-6 shadow-2xl md:shadow-none md:sticky md:top-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold">Criar Nova Missão</h3>
                            <button onClick={() => setIsFormOpen(false)} className="md:hidden p-2"><Plus className="rotate-45" /></button>
                        </div>

                        <RequestForm onSuccess={() => {
                            setIsFormOpen(false)
                            fetchRequests()
                        }} />
                    </div>
                </div>

            </main>
        </div>
    )
}
