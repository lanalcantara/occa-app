'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Loader2, Send } from 'lucide-react'

export function RequestForm({ onSuccess }: { onSuccess: () => void }) {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [points, setPoints] = useState(100)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const supabase = createClient()

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!title || !description) return

        setIsSubmitting(true)

        try {
            const { error } = await supabase.from('tasks').insert({
                title,
                description,
                points_reward: points, // Partners suggest points, admin confirms
                status: 'pending_approval',
                // created_by is handled by RLS auth.uid() if policy is set correctly, 
                // but usually we might need to rely on default or explicit Trigger. 
                // However, RLS policy 'Partners can create tasks' with `auth.uid() = created_by` 
                // enforces that the creating user IS the auth user. 
                // We actually need to explicitly send `created_by` OR have a database default.
                // Since I didn't set a default in schema for created_by to auth.uid(), I should try to send it 
                // OR better, let postgres handle it if I had a trigger. 
                // Let's rely on the insert including 'created_by' from the client IF the RLS allows checking it matches.
                // Actually, standard Supabase RLS `with check (auth.uid() = created_by)` requires the value to be present and match.
            })

            if (error) {
                // If the error is regarding created_by being null (because we didn't send it and no default), 
                // we should send it. But `kp` client might strip it. 
                // Let's try inserting without it first, if it fails, I'll update. 
                // Actually, to be safe, I should fetch user once and send it.
                throw error
            }

            setTitle('')
            setDescription('')
            setPoints(100)
            onSuccess()
            alert('Solicitação enviada com sucesso! Aguarde aprovação do Admin. 🚀')

        } catch (error: any) {
            // Fallback: If RLS failed because we didn't send created_by.
            // Let's try one more time injecting the user ID if I can get it easily. 
            // Since this is a client component, I can use `supabase.auth.getUser`.
            console.error(error)
            alert('Erro ao enviar: ' + error.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    // Improved submit with explicit User ID to satisfy RLS
    async function handleSubmitSafe(e: React.FormEvent) {
        e.preventDefault()
        if (!title || !description) return
        setIsSubmitting(true)

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { error } = await supabase.from('tasks').insert({
            title,
            description,
            points_reward: points,
            status: 'pending_approval',
            created_by: user.id
        })

        if (error) {
            console.error(error)
            alert('Erro ao enviar: ' + error.message)
        } else {
            setTitle('')
            setDescription('')
            onSuccess()
            alert('Solicitação enviada! 🚀')
        }
        setIsSubmitting(false)
    }

    return (
        <form onSubmit={handleSubmitSafe} className="space-y-4">
            <div>
                <label className="text-sm font-medium text-muted-foreground block mb-1">Título da Missão</label>
                <input
                    className="w-full p-3 bg-black/20 border border-white/10 rounded-lg focus:border-primary focus:outline-none transition-colors"
                    placeholder="Ex: Criar Logo para Campanha de Verão"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                />
            </div>

            <div>
                <label className="text-sm font-medium text-muted-foreground block mb-1">Descrição Detalhada</label>
                <textarea
                    className="w-full p-3 bg-black/20 border border-white/10 rounded-lg focus:border-primary focus:outline-none transition-colors h-32 resize-none"
                    placeholder="Descreva o que precisa ser feito, prazos e requisitos..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    required
                />
            </div>

            <div>
                <label className="text-sm font-medium text-muted-foreground block mb-1">Recompensa Sugerida (XP)</label>
                <input
                    type="number"
                    className="w-full p-3 bg-black/20 border border-white/10 rounded-lg focus:border-primary focus:outline-none transition-colors"
                    value={points}
                    onChange={e => setPoints(Number(e.target.value))}
                    min={0}
                    step={10}
                />
                <p className="text-xs text-muted-foreground mt-1">O admin poderá ajustar este valor.</p>
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                Enviar Solicitação
            </button>
        </form>
    )
}
