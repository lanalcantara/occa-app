'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Trophy, Users, Star } from 'lucide-react'

// Mock generic profiles for the landing page (or pass real ones)
export function ShowcaseView({ publicProfiles }: { publicProfiles: any[] }) {

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
            {/* Dynamic Background */}
            <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-primary/10 via-background/0 to-background/0 pointer-events-none" />
            <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

            {/* Header */}
            <header className="px-8 py-6 flex justify-between items-center relative z-10 glass-card mx-8 mt-6 rounded-2xl border-white/5">
                <div className="text-2xl font-black tracking-tighter bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
                    OCCA
                </div>
                <div className="flex items-center gap-4">
                    <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors">
                        Membros
                    </Link>
                    <Link href="/login" className="px-5 py-2 bg-white text-black font-bold rounded-lg hover:opacity-90 transition-opacity">
                        Entrar
                    </Link>
                </div>
            </header>

            {/* Hero Section */}
            <main className="flex-1 flex flex-col items-center justify-center text-center p-8 relative z-10 my-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-3xl space-y-6"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium uppercase tracking-widest text-primary mb-4">
                        <Star className="w-3 h-3 fill-primary" />
                        Social Club & Tech Squad
                    </div>

                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none">
                        ELITE <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-secondary">TALENTS</span>
                    </h1>

                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        Conheça o time de alta performance da OCCA. Gamificação, evolução contínua e entregas de valor.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-4 pt-8">
                        <Link href="/login" className="px-8 py-4 bg-primary text-white rounded-xl font-bold text-lg hover:bg-primary/90 transition-all flex items-center gap-2 shadow-[0_0_40px_rgba(232,28,255,0.3)] hover:shadow-[0_0_60px_rgba(232,28,255,0.5)]">
                            Ver Desafios <ArrowRight className="w-5 h-5" />
                        </Link>
                        <button className="px-8 py-4 bg-white/5 border border-white/10 rounded-xl font-bold text-lg hover:bg-white/10 transition-all">
                            Sobre a OCCA
                        </button>
                    </div>
                </motion.div>

                {/* Status Ticker */}
                <div className="mt-20 w-full max-w-4xl grid grid-cols-3 gap-8 border-t border-white/10 pt-10">
                    <div>
                        <div className="text-4xl font-bold text-white mb-1">{publicProfiles.length}</div>
                        <div className="text-sm text-muted-foreground uppercase tracking-wider">Membros Ativos</div>
                    </div>
                    <div>
                        <div className="text-4xl font-bold text-white mb-1">12k+</div>
                        <div className="text-sm text-muted-foreground uppercase tracking-wider">XP Gerado</div>
                    </div>
                    <div>
                        <div className="text-4xl font-bold text-white mb-1">45</div>
                        <div className="text-sm text-muted-foreground uppercase tracking-wider">Projetos</div>
                    </div>
                </div>
            </main>

            {/* Talent Grid Preview */}
            <section className="py-20 px-8 relative z-10 border-t border-white/5 bg-black/20">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-end mb-12">
                        <h2 className="text-4xl font-bold">Nossos Talentos</h2>
                        <Link href="/login" className="text-primary hover:underline">Ver todos &rarr;</Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {publicProfiles.slice(0, 4).map((profile, i) => (
                            <motion.div
                                key={profile.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className="group relative bg-surface border border-white/10 rounded-2xl overflow-hidden hover:border-primary/50 transition-all hover:translate-y-[-5px]"
                            >
                                <div className="h-24 bg-gradient-to-br from-white/5 to-white/0" />
                                <div className="px-6 pb-6 relative mt-[-40px]">
                                    <div className="w-20 h-20 rounded-2xl bg-zinc-900 border-4 border-surface overflow-hidden mb-4 shadow-xl">
                                        {profile.avatar_url ? (
                                            <img src={profile.avatar_url} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xl font-bold text-white/20">
                                                {profile.full_name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-lg">{profile.full_name}</h3>
                                    <p className="text-sm text-primary font-medium mb-4 uppercase tracking-wider text-[10px]">{profile.category}</p>

                                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-white/5 p-2 rounded-lg">
                                        <Trophy className="w-3 h-3 text-yellow-400" />
                                        <span>{profile.points} XP</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}
