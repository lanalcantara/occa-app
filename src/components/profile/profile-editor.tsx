'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Loader2, Save, Upload, Trash2, Plus, ExternalLink, Image as ImageIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'

type CustomCard = {
    title: string
    description: string
    image_url: string
    link: string
}

export function ProfileEditor({ profile }: { profile: any }) {
    const supabase = createClient()
    const router = useRouter()

    const [loading, setLoading] = useState(false)
    const [bio, setBio] = useState(profile.bio || '')
    const [contactInfo, setContactInfo] = useState(profile.contact_info || '')
    const [coverUrl, setCoverUrl] = useState(profile.cover_url || '')
    const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || '')
    const [cards, setCards] = useState<CustomCard[]>(Array.isArray(profile.custom_cards) ? profile.custom_cards : [])

    // Card Form State
    const [isAddingCard, setIsAddingCard] = useState(false)
    const [newCard, setNewCard] = useState<CustomCard>({ title: '', description: '', image_url: '', link: '' })

    async function handleSave() {
        setLoading(true)
        try {
            const { error } = await supabase.from('profiles').update({
                bio,
                contact_info: contactInfo,
                cover_url: coverUrl,
                avatar_url: avatarUrl,
                custom_cards: cards
            }).eq('id', profile.id)

            if (error) throw error
            router.refresh()
            alert('Perfil atualizado com sucesso!')
        } catch (error: any) {
            alert('Erro ao salvar: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    function handleAddCard() {
        if (!newCard.title) return alert('O título é obrigatório')
        setCards([...cards, newCard])
        setNewCard({ title: '', description: '', image_url: '', link: '' })
        setIsAddingCard(false)
    }

    function removeCard(index: number) {
        setCards(cards.filter((_, i) => i !== index))
    }

    return (
        <div className="space-y-8 max-w-4xl mx-auto pb-20">
            {/* Header / Cover Edit */}
            <div className="space-y-4">
                <h2 className="text-2xl font-bold">Editar Perfil Público</h2>

                <div className="bg-surface border border-white/5 rounded-xl p-6 space-y-6">
                    {/* Cover & Avatar Group */}
                    <div className="space-y-6 border-b border-white/5 pb-6">
                        <div>
                            <label className="block text-sm font-bold mb-2">Imagem de Capa (URL)</label>
                            <input
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
                                placeholder="https://... (Recomendado: 1200x400px)"
                                value={coverUrl}
                                onChange={e => setCoverUrl(e.target.value)}
                            />
                            {coverUrl && (
                                <div className="mt-2 h-32 w-full rounded-lg overflow-hidden border border-white/10 relative">
                                    <img src={coverUrl} className="w-full h-full object-cover" />
                                </div>
                            )}
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-bold mb-2">Foto de Perfil (URL)</label>
                                <input
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
                                    placeholder="https://..."
                                    value={avatarUrl}
                                    onChange={e => setAvatarUrl(e.target.value)}
                                />
                            </div>
                            <div className="w-20 h-20 rounded-full bg-black/20 border border-white/10 overflow-hidden flex-shrink-0 relative top-1">
                                {avatarUrl ? (
                                    <img src={avatarUrl} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground bg-white/5">
                                        Foto
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold mb-2">Biografia</label>
                            <textarea
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm min-h-[120px] focus:outline-none focus:border-primary/50"
                                placeholder="Fale um pouco sobre você..."
                                value={bio}
                                onChange={e => setBio(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-2">Informações de Contato</label>
                            <textarea
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm min-h-[120px] focus:outline-none focus:border-primary/50"
                                placeholder="Email, Telefone, Social Media..."
                                value={contactInfo}
                                onChange={e => setContactInfo(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Cards Manager */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold">Meus Destaques / Projetos</h2>
                    <button
                        onClick={() => setIsAddingCard(true)}
                        className="bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
                    >
                        <Plus className="w-4 h-4" /> Adicionar Card
                    </button>
                </div>

                {/* Add Card Form */}
                {isAddingCard && (
                    <div className="bg-surface border border-primary/30 rounded-xl p-6 animate-in fade-in slide-in-from-top-4">
                        <h3 className="font-bold mb-4 flex items-center gap-2"><Plus className="w-4 h-4 text-primary" /> Novo Destaque</h3>
                        <div className="grid gap-4">
                            <input
                                className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm"
                                placeholder="Título do Card *"
                                value={newCard.title}
                                onChange={e => setNewCard({ ...newCard, title: e.target.value })}
                            />
                            <textarea
                                className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm"
                                placeholder="Descrição curta..."
                                value={newCard.description}
                                onChange={e => setNewCard({ ...newCard, description: e.target.value })}
                            />
                            <div className="grid md:grid-cols-2 gap-4">
                                <input
                                    className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm"
                                    placeholder="Link da Imagem (URL)"
                                    value={newCard.image_url}
                                    onChange={e => setNewCard({ ...newCard, image_url: e.target.value })}
                                />
                                <input
                                    className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm"
                                    placeholder="Link de destino (https://...)"
                                    value={newCard.link}
                                    onChange={e => setNewCard({ ...newCard, link: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-2 justify-end mt-2">
                                <button onClick={() => setIsAddingCard(false)} className="px-4 py-2 text-sm hover:bg-white/5 rounded-lg">Cancelar</button>
                                <button onClick={handleAddCard} className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90">Adicionar</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Cards List */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {cards.map((card, idx) => (
                        <div key={idx} className="group bg-surface border border-white/5 rounded-xl overflow-hidden relative">
                            <div className="h-32 bg-zinc-900 relative">
                                {card.image_url ? (
                                    <img src={card.image_url} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-white/5">
                                        <ImageIcon className="w-6 h-6 text-white/20" />
                                    </div>
                                )}
                                <button
                                    onClick={() => removeCard(idx)}
                                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="p-4">
                                <h4 className="font-bold flex items-center gap-2">
                                    {card.title}
                                    {card.link && <ExternalLink className="w-3 h-3 text-muted-foreground" />}
                                </h4>
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{card.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Floating Save Button */}
            <div className="fixed bottom-6 right-6 z-50">
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="bg-primary hover:bg-primary/90 text-white shadow-2xl px-6 py-4 rounded-full font-bold text-lg flex items-center gap-3 transition-all hover:scale-105 disabled:opacity-50 disabled:scale-100"
                >
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                    Salvar Alterações
                </button>
            </div>
        </div>
    )
}
