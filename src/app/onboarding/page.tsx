'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Sparkles, Building2, Globe, FileText, User } from 'lucide-react'

export default function OnboardingPage() {
    // Shared state
    const [isLoading, setIsLoading] = useState(true)
    const [isPartner, setIsPartner] = useState(false)
    const [user, setUser] = useState<any>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Member State
    const [step, setStep] = useState(1) // 1: Bio/Name, 2: DISC/Traits
    const [fullName, setFullName] = useState('')
    const [bio, setBio] = useState('')
    const [traits, setTraits] = useState<string[]>([])

    // Partner State
    const [companyName, setCompanyName] = useState('')
    const [website, setWebsite] = useState('')
    const [companyDesc, setCompanyDesc] = useState('')

    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        checkUser()
    }, [])

    async function checkUser() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return router.push('/login')

        setUser(user)
        // Check metadata to see if they signed up via Partner Login
        if (user.user_metadata?.is_partner_signup) {
            setIsPartner(true)
        }

        // Also check profile just in case already partially set
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        if (profile?.full_name) setFullName(profile.full_name)

        setIsLoading(false)
    }

    async function handleMemberSubmit() {
        setIsSubmitting(true)
        const { error } = await supabase.from('profiles').update({
            full_name: fullName,
            bio: bio,
            onboarding_completed: true,
            // Store traits in a JSONB column or separate table ideally, 
            // but for now let's append to bio or ignore if no schema support yet.
            // Let's assume we just update what we have.
        }).eq('id', user.id)

        if (!error) {
            router.push('/')
        } else {
            alert(error.message)
        }
        setIsSubmitting(false)
    }

    async function handlePartnerSubmit() {
        setIsSubmitting(true)
        console.log('Submitting partner profile...')

        const { error } = await supabase.from('profiles').update({
            full_name: companyName,
            company_name: companyName,
            website: website,
            bio: companyDesc,
            approval_status: 'pending', // CRITICAL: This must be set!
            onboarding_completed: true
        }).eq('id', user.id)

        if (error) {
            console.error('Error updating profile:', error)
            alert('Erro ao salvar: ' + error.message)
            setIsSubmitting(false)
        } else {
            console.log('Profile updated. Redirecting...')
            router.refresh()
            // Force delay to ensure DB propagation
            setTimeout(() => {
                window.location.href = '/'
            }, 1000)
        }
    }

    if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Carregando...</div>

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background */}
            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-primary/20 to-black pointer-events-none" />

            <div className="relative z-10 w-full max-w-2xl">

                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold mb-2">
                        {isPartner ? 'Registro Corporativo' : 'Boas-vindas ao OCCA'}
                    </h1>
                    <p className="text-muted-foreground">
                        {isPartner
                            ? 'Vamos configurar o perfil da sua empresa para solicitar demandas.'
                            : 'Complete seu perfil para receber sua Carteirinha Digital.'}
                    </p>
                </div>

                {isPartner ? (
                    /* PARTNER FORM */
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 bg-zinc-900/50 p-8 rounded-2xl border border-white/10">
                        <div>
                            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-primary" /> Nome Corporativo
                            </label>
                            <input
                                value={companyName}
                                onChange={e => setCompanyName(e.target.value)}
                                className="w-full p-4 bg-black/40 border border-white/10 rounded-xl focus:border-primary outline-none"
                                placeholder="Ex: Tech Solutions Ltda"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                                <Globe className="w-4 h-4 text-primary" /> Website Oficial
                            </label>
                            <input
                                value={website}
                                onChange={e => setWebsite(e.target.value)}
                                className="w-full p-4 bg-black/40 border border-white/10 rounded-xl focus:border-primary outline-none"
                                placeholder="https://..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-primary" /> Sobre a Empresa (Para Análise)
                            </label>
                            <textarea
                                value={companyDesc}
                                onChange={e => setCompanyDesc(e.target.value)}
                                className="w-full p-4 bg-black/40 border border-white/10 rounded-xl focus:border-primary outline-none h-32 resize-none"
                                placeholder="Conte um pouco sobre o que vocês fazem..."
                            />
                        </div>

                        <button
                            onClick={handlePartnerSubmit}
                            disabled={isSubmitting || !companyName || !companyDesc}
                            className="w-full py-4 bg-primary rounded-xl font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            {isSubmitting ? 'Salvando...' : 'Concluir Cadastro'}
                        </button>
                    </motion.div>

                ) : (
                    /* MEMBER FORM (Existing logic simplified/enhanced) */
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 bg-zinc-900/50 p-8 rounded-2xl border border-white/10">
                        <div>
                            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                                <User className="w-4 h-4 text-secondary" /> Nome Completo
                            </label>
                            <input
                                value={fullName}
                                onChange={e => setFullName(e.target.value)}
                                className="w-full p-4 bg-black/40 border border-white/10 rounded-xl focus:border-secondary outline-none"
                                placeholder="Seu nome artístico ou profissional"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-secondary" /> Bio / Mini Currículo
                            </label>
                            <textarea
                                value={bio}
                                onChange={e => setBio(e.target.value)}
                                className="w-full p-4 bg-black/40 border border-white/10 rounded-xl focus:border-secondary outline-none h-32 resize-none"
                                placeholder="Quais suas principais skills?"
                            />
                        </div>

                        <button
                            onClick={handleMemberSubmit}
                            disabled={isSubmitting || !fullName}
                            className="w-full py-4 bg-secondary text-black rounded-xl font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            {isSubmitting ? 'Gerando Carteirinha...' : 'Entrar para o Clube'}
                        </button>
                    </motion.div>
                )}
            </div>
        </div>
    )
}
