'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Star, Send, User, MessageSquare } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

type Profile = {
    id: string
    full_name: string
    avatar_url: string
    category: string
    role: string
}

type Feedback = {
    id: string
    content: string
    rating: number
    created_at: string
    from_user?: { full_name: string, avatar_url: string }
}

export function FeedbackManager({ currentUserId }: { currentUserId: string }) {
    const [submitting, setSubmitting] = useState(false)
    const [profiles, setProfiles] = useState<Profile[]>([])
    const [myFeedbacks, setMyFeedbacks] = useState<Feedback[]>([])
    const [selectedUser, setSelectedUser] = useState<Profile | null>(null)
    const [feedbackForm, setFeedbackForm] = useState({ rating: 5, content: '' })
    const [activeTab, setActiveTab] = useState<'give' | 'received'>('give')

    const supabase = createClient()

    useEffect(() => {
        fetchData()
    }, [])

    async function fetchData() {
        // Fetch users to review (excluding self)
        const { data: profilesData } = await supabase
            .from('profiles')
            .select('*')
            .neq('id', currentUserId)
            .neq('role', 'admin') // Optional: Don't review admins?
            .order('full_name')

        if (profilesData) setProfiles(profilesData)

        // Fetch received feedbacks
        const { data: feedbacksData } = await supabase
            .from('feedbacks')
            .select(`
                *,
                from_user:profiles!from_user_id(full_name, avatar_url)
            `)
            .eq('to_user_id', currentUserId)
            .order('created_at', { ascending: false })

        if (feedbacksData) setMyFeedbacks(feedbacksData as any)
    }

    async function handleSubmit() {
        if (!selectedUser) return
        if (!feedbackForm.content.trim()) return alert('Escreva algum comentário.')

        setSubmitting(true)
        const { error } = await supabase.from('feedbacks').insert({
            from_user_id: currentUserId,
            to_user_id: selectedUser.id,
            rating: feedbackForm.rating,
            content: feedbackForm.content,
            week_start_date: new Date().toISOString().split('T')[0] // Simply today's date for now
        })

        if (error) {
            alert('Erro ao enviar feedback: ' + error.message)
        } else {
            alert('Feedback enviado com sucesso!')
            setSelectedUser(null)
            setFeedbackForm({ rating: 5, content: '' })
        }
        setSubmitting(false)
    }

    return (
        <div className="max-w-6xl mx-auto w-full">
            {/* Tabs */}
            <div className="flex gap-4 mb-8 border-b border-white/10 pb-4">
                <button
                    onClick={() => setActiveTab('give')}
                    className={cn(
                        "text-lg font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-2",
                        activeTab === 'give' ? "bg-white/10 text-primary" : "text-muted-foreground hover:text-white"
                    )}
                >
                    <Send className="w-5 h-5" />
                    Avaliar Colegas
                </button>
                <button
                    onClick={() => setActiveTab('received')}
                    className={cn(
                        "text-lg font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-2",
                        activeTab === 'received' ? "bg-white/10 text-purple-400" : "text-muted-foreground hover:text-white"
                    )}
                >
                    <Star className="w-5 h-5" />
                    Meus Feedbacks
                </button>
            </div>

            {/* GIVE FEEDBACK TAB */}
            {activeTab === 'give' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {profiles.map(profile => (
                        <motion.div
                            key={profile.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-surface/50 border border-white/5 rounded-2xl p-6 flex flex-col items-center text-center hover:bg-white/5 transition-colors group"
                        >
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 p-1 mb-4 group-hover:scale-105 transition-transform">
                                {profile.avatar_url ? (
                                    <img src={profile.avatar_url} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    <div className="w-full h-full rounded-full bg-black/40 flex items-center justify-center text-xl font-bold">
                                        {profile.full_name.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <h3 className="font-bold text-lg">{profile.full_name}</h3>
                            <p className="text-sm text-muted-foreground uppercase tracking-widest text-[10px] mb-6">{profile.category}</p>

                            <button
                                onClick={() => setSelectedUser(profile)}
                                className="mt-auto w-full py-2 bg-white/5 hover:bg-primary hover:text-white rounded-lg font-medium transition-all"
                            >
                                Avaliar
                            </button>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* RECEIVED FEEDBACK TAB */}
            {activeTab === 'received' && (
                <div className="space-y-4">
                    {myFeedbacks.length === 0 ? (
                        <div className="text-center py-20 text-muted-foreground">
                            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p>Você ainda não recebeu nenhum feedback.</p>
                        </div>
                    ) : (
                        myFeedbacks.map(fb => (
                            <div key={fb.id} className="bg-surface/30 border border-white/5 rounded-xl p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden">
                                            {fb.from_user?.avatar_url && <img src={fb.from_user.avatar_url} className="w-full h-full object-cover" />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm">{fb.from_user?.full_name || 'Anônimo'}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(fb.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <Star key={star} className={cn("w-4 h-4", star <= fb.rating ? "fill-yellow-400 text-yellow-400" : "text-white/10")} />
                                        ))}
                                    </div>
                                </div>
                                <p className="text-white/80 leading-relaxed italic">
                                    "{fb.content}"
                                </p>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* FEEDBACK MODAL */}
            <AnimatePresence>
                {selectedUser && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="w-full max-w-lg bg-surface border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-white/5 bg-zinc-900 flex justify-between items-center">
                                <h3 className="font-bold text-lg">Feedback para <span className="text-primary">{selectedUser.full_name}</span></h3>
                                <button onClick={() => setSelectedUser(null)} className="text-muted-foreground hover:text-white"><span className="sr-only">Fechar</span>✕</button>
                            </div>

                            <div className="p-8 space-y-6 bg-zinc-900/50">
                                <div className="text-center">
                                    <label className="block text-sm text-muted-foreground mb-3">Nota Geral</label>
                                    <div className="flex justify-center gap-2">
                                        {[1, 2, 3, 4, 5].map(value => (
                                            <button
                                                key={value}
                                                onClick={() => setFeedbackForm({ ...feedbackForm, rating: value })}
                                                className="transition-transform hover:scale-110 focus:outline-none"
                                            >
                                                <Star className={cn(
                                                    "w-10 h-10 transition-colors",
                                                    value <= feedbackForm.rating ? "fill-yellow-400 text-yellow-400" : "text-white/10 hover:text-white/30"
                                                )} />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm text-muted-foreground mb-2">Comentário</label>
                                    <textarea
                                        className="w-full h-32 bg-black/20 border border-white/10 rounded-xl p-4 resize-none focus:ring-1 focus:ring-primary outline-none transition-all"
                                        placeholder="Elogios, críticas construtivas ou observações..."
                                        value={feedbackForm.content}
                                        onChange={e => setFeedbackForm({ ...feedbackForm, content: e.target.value })}
                                    />
                                </div>

                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    className="w-full py-4 bg-primary hover:bg-primary/90 rounded-xl font-bold text-lg shadow-lg shadow-primary/20 transition-all disabled:opacity-50"
                                >
                                    {submitting ? 'Enviando...' : 'Enviar Feedback'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
