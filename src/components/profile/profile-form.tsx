'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Save, Lock, User, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function ProfileForm({ initialName, userId }: { initialName: string, userId: string }) {
    const [fullName, setFullName] = useState(initialName || '')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const supabase = createClient()
    const router = useRouter()

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)

        try {
            // 1. Update Name (if changed)
            if (fullName !== initialName) {
                const { error: profileError } = await supabase
                    .from('profiles')
                    .update({ full_name: fullName })
                    .eq('id', userId)

                if (profileError) throw profileError
            }

            // 2. Update Password (if provided)
            if (password) {
                if (password !== confirmPassword) {
                    throw new Error('As senhas não coincidem')
                }
                if (password.length < 6) {
                    throw new Error('A senha deve ter pelo menos 6 caracteres')
                }

                const { error: authError } = await supabase.auth.updateUser({
                    password: password
                })

                if (authError) throw authError
            }

            alert('Perfil atualizado com sucesso!')
            setPassword('')
            setConfirmPassword('')
            router.refresh()

        } catch (error: any) {
            console.error(error)
            alert('Erro ao atualizar: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-surface/30 border border-white/5 rounded-2xl p-6">
            <h3 className="font-bold opacity-80 flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Dados Pessoais & Segurança
            </h3>

            <div className="space-y-4">
                {/* Nome */}
                <div className="space-y-2">
                    <label className="text-xs text-muted-foreground uppercase tracking-widest block">Nome Completo</label>
                    <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full p-3 bg-black/20 rounded-lg border border-white/5 text-sm focus:border-primary/50 focus:outline-none transition-colors"
                        placeholder="Seu nome"
                    />
                </div>

                <div className="h-px bg-white/5 my-6" />

                {/* Senha */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-yellow-400/80">
                        <Lock className="w-4 h-4" />
                        <span>Alterar Senha</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs text-muted-foreground uppercase tracking-widest block">Nova Senha</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-3 bg-black/20 rounded-lg border border-white/5 text-sm focus:border-primary/50 focus:outline-none transition-colors"
                                placeholder="••••••"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs text-muted-foreground uppercase tracking-widest block">Confirmar Senha</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full p-3 bg-black/20 rounded-lg border border-white/5 text-sm focus:border-primary/50 focus:outline-none transition-colors"
                                placeholder="••••••"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-4 flex justify-end">
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-white hover:bg-white/90 text-black px-6 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Salvar Alterações
                </button>
            </div>
        </form>
    )
}
