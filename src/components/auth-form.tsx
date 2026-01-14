'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function AuthForm({ isPartnerSignup = false }: { isPartnerSignup?: boolean }) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [isSignUp, setIsSignUp] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setSuccess(null)

        try {
            if (isSignUp) {
                const isGeneralMember = email.endsWith('@membro.com')

                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${location.origin}/auth/callback`,
                        data: {
                            full_name: email.split('@')[0],
                            avatar_url: '',
                            is_partner_signup: isPartnerSignup,
                            is_social_club: !isGeneralMember // If @membro.com, then NOT social club (General Member)
                        }
                    },
                })
                if (error) throw error
                setSuccess('Check your email to confirm signing up!')
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })
                if (error) throw error

                // Check role for redirect
                const { data: { user } } = await supabase.auth.getUser()
                if (user) {
                    const { data: profile } = await supabase.from('profiles').select('is_social_club').eq('id', user.id).single()
                    if (profile && profile.is_social_club === false) {
                        router.push('/profile')
                        router.refresh()
                        return
                    }
                }

                router.refresh()
                router.push('/dashboard')
            }
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="w-full max-w-md mx-auto p-6 md:p-8 rounded-2xl bg-card border border-white/10 shadow-xl backdrop-blur-md">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {isSignUp ? 'Junte-se ao Clube' : 'Bem-vindo de volta'}
                </h2>
                <p className="text-muted-foreground mt-2 text-sm">
                    {isSignUp ? 'Crie sua conta para começar' : 'Entre para acessar sua carteira'}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1 text-foreground/80">Email</label>
                    <input
                        type="email"
                        required
                        className="w-full px-4 py-2 rounded-lg bg-surface border border-white/5 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/50"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1 text-foreground/80">Senha</label>
                    <input
                        type="password"
                        required
                        className="w-full px-4 py-2 rounded-lg bg-surface border border-white/5 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/50"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-md"
                    >
                        {error}
                    </motion.div>
                )}

                {success && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 text-sm text-green-400 bg-green-400/10 border border-green-400/20 rounded-md"
                    >
                        {success}
                    </motion.div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded-lg font-medium bg-white text-black hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isSignUp ? 'Criar Conta' : 'Entrar'}
                </button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
                <button
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="hover:text-primary transition-colors hover:underline underline-offset-4"
                >
                    {isSignUp ? 'Já tem uma conta? Entre' : 'Não tem conta? Cadastre-se'}
                </button>
            </div>
        </div>
    )
}
