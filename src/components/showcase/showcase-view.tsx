'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Trophy, Users, Star, Lightbulb, GraduationCap, Leaf, Component } from 'lucide-react'

export function ShowcaseView({ publicProfiles, currentUser }: { publicProfiles: any[]; currentUser?: any }) {

    const pillars = [
        { title: "Criatividade", desc: "Fomento às múltiplas expressões artísticas e tecnológicas.", icon: Lightbulb },
        { title: "Educação", desc: "Ambiente voltado para o aprendizado contínuo e troca.", icon: GraduationCap },
        { title: "Comunidade", desc: "Ecossistema colaborativo e multidisciplinar.", icon: Users },
        { title: "Sustentabilidade", desc: "Desenvolvimento de novos modelos de impacto social.", icon: Leaf },
    ]

    const collectives = [
        "Fogo de OCCA", "Garagem", "Steam Camping", "Hacker Media", "Hactus Creative", "Arca de Papiro"
    ]

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden font-sans">
            {/* Dynamic Background */}
            <div className="fixed top-0 left-0 w-full h-[800px] bg-gradient-to-b from-white/5 via-background/0 to-background/0 pointer-events-none" />

            {/* Header */}
            <header className="px-6 md:px-12 py-6 flex justify-between items-center relative z-10 mx-auto w-full max-w-7xl">
                <Link href="/intro" className="flex items-center gap-3">
                    <img src="/occa-logo.png" alt="OCCA Logo" className="h-10 w-auto invert brightness-0" />
                </Link>
                <div className="flex items-center gap-4">
                    {/* Conditional navigation button */}
                    {currentUser ? (
                        <>
                            <Link href="/" className="px-6 py-2 bg-white text-black font-semibold rounded-full hover:bg-gray-200 transition-colors text-sm">
                                Home
                            </Link>
                            {/* Avatar linking to profile */}
                            <Link href="/profile">
                                <div className="flex items-center">
                                    {currentUser.avatar_url ? (
                                        <img src={currentUser.avatar_url} alt="Avatar" className="h-8 w-8 rounded-full object-cover" />
                                    ) : (
                                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-800">
                                            {currentUser.full_name?.charAt(0) ?? 'U'}
                                        </div>
                                    )}
                                </div>
                            </Link>
                        </>
                    ) : (
                        <Link href="/login" className="px-6 py-2 bg-white text-black font-semibold rounded-full hover:bg-gray-200 transition-colors text-sm">
                            Login
                        </Link>
                    )}
                    {currentUser && currentUser.role === 'admin' && (
                        <Link href="/admin" className="ml-4 px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:opacity-90 transition-colors">
                            Editar Página
                        </Link>
                    )}
                </div>
            </header>

            {/* Hero Section */}
            <main className="flex-1 flex flex-col items-center justify-center text-center px-4 relative z-10 mt-12 mb-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-4xl space-y-8"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium uppercase tracking-widest text-white/70">
                        <Component className="w-3 h-3" />
                        Olinda Creative Community Action
                    </div>

                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none">
                        SOMOS <br />
                        <span className="text-white">OCCA</span>
                    </h1>

                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-light">
                        Um ambiente e comunidade colaborativa, multidisciplinar e inovadora no coração do Sítio Histórico de Olinda.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                        {currentUser ? (
                            <Link href="/" className="px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:bg-gray-200 transition-all flex items-center gap-2">
                                Home <ArrowRight className="w-5 h-5" />
                            </Link>
                        ) : (
                            <Link href="/login" className="px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:bg-gray-200 transition-all flex items-center gap-2">
                                Fazer Parte <ArrowRight className="w-5 h-5" />
                            </Link>
                        )}
                    </div>
                </motion.div>
            </main>

            {/* About Section */}
            <section className="py-20 px-6 relative z-10 bg-surface/30">
                <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <h2 className="text-3xl font-bold tracking-tight">O que é a OCCA?</h2>
                        <div className="space-y-4 text-muted-foreground leading-relaxed">
                            <p>
                                A OCCA funciona como um hub de coletivos e membros que atuam em diversas frentes,
                                unindo tradição e inovação. Nosso objetivo é fomentar a criatividade e a educação
                                em suas múltiplas expressões artísticas e tecnológicas.
                            </p>
                            <p>
                                Acreditamos que a gambiarra é a forma oficial de resolver problemas e que o rabisco
                                é o principal meio de comunicação. Que as barreiras entre as áreas do conhecimento sejam menores.
                            </p>
                        </div>

                        <div className="pt-4 flex flex-wrap gap-2">
                            {collectives.map((c) => (
                                <span key={c} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-medium text-white/70">
                                    {c}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {pillars.map((p, i) => (
                            <motion.div
                                key={p.title}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className="p-6 rounded-2xl bg-background border border-white/5 hover:border-white/20 transition-colors"
                            >
                                <p.icon className="w-8 h-8 mb-4 text-white" />
                                <h3 className="font-bold mb-2">{p.title}</h3>
                                <p className="text-xs text-muted-foreground leading-snug">{p.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Talentos Grid (Preview) */}
            <section className="py-24 px-6 relative z-10">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">Talentos em Destaque</h2>
                        <p className="text-muted-foreground">Conheça quem faz a OCCA acontecer</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {publicProfiles.length > 0 ? publicProfiles.slice(0, 4).map((profile, i) => (
                            <motion.div
                                key={profile.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className="group relative bg-surface border border-white/5 rounded-2xl overflow-hidden hover:border-white/20 transition-all hover:-translate-y-1"
                            >
                                <div className="h-32 bg-gradient-to-br from-white/10 to-transparent" />
                                <div className="px-6 pb-6 relative -mt-10">
                                    <div className="w-20 h-20 rounded-xl bg-black border-4 border-surface overflow-hidden mb-4">
                                        {profile.avatar_url ? (
                                            <img src={profile.avatar_url} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xl font-bold text-white/20 bg-zinc-900">
                                                {profile.full_name?.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-lg">{profile.full_name}</h3>
                                    <p className="text-xs text-white/50 font-medium mb-4 uppercase tracking-wider">{profile.category || 'Membro'}</p>

                                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-white/5 p-2 rounded-lg w-fit">
                                        <Trophy className="w-3 h-3 text-white" />
                                        <span>{profile.points || 0} XP</span>
                                    </div>
                                </div>
                            </motion.div>
                        )) : (
                            <div className="col-span-4 text-center py-10 text-muted-foreground">
                                <p>Nenhum membro público encontrado.</p>
                            </div>
                        )}
                    </div>

                    <div className="mt-12 text-center">
                        <Link href="/login" className="text-sm text-muted-foreground hover:text-white underline underline-offset-4 transition-colors">
                            Ver todos os membros
                        </Link>
                    </div>
                </div>
            </section>

            <footer className="py-8 text-center text-xs text-muted-foreground border-t border-white/5">
                <p>&copy; {new Date().getFullYear()} OCCA - Olinda Creative Community Action.</p>
            </footer>
        </div>
    )
}
