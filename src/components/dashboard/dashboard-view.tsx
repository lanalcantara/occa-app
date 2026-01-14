'use client'

import { MemberCard } from "@/components/member-card"
import { SignOutButton } from "@/components/sign-out-button"

export function DashboardView({ profile, tasks }: { profile: any, tasks: any[] }) {
    return (
        <main className="flex min-h-screen flex-col items-center p-8 relative overflow-hidden bg-background">
            {/* Ambient Background */}
            <div className="fixed top-[-20%] left-[20%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="z-10 w-full max-w-5xl flex flex-col gap-8">
                <header className="flex justify-between items-center w-full pb-8 border-b border-white/5">
                    <div>
                        <h1 className="text-2xl font-bold">Dashboard</h1>
                        <p className="text-muted-foreground">Bem-vindo ao clube.</p>
                    </div>
                </header>

                <section className="flex flex-col md:flex-row gap-8 items-start">
                    {/* Left Column: Card */}
                    <div className="space-y-4 w-full md:w-auto">
                        <h2 className="text-lg font-semibold opacity-80">Sua Carteira</h2>
                        <MemberCard profile={profile} />
                    </div>

                    {/* Right Column: Tasks */}
                    <div className="flex-1 w-full space-y-4">
                        <h2 className="text-lg font-semibold opacity-80">Suas Missões Ativas</h2>

                        {tasks && tasks.length > 0 ? (
                            <div className="grid gap-4">
                                {tasks.map((task: any) => (
                                    <div key={task.id} className="p-4 bg-surface border border-white/10 rounded-xl relative overflow-hidden group hover:border-primary/50 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="bg-primary/20 text-primary text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                                                {task.category_required}
                                            </span>
                                            <span className="text-yellow-400 font-mono font-bold text-sm flex items-center gap-1">
                                                {task.points_reward} XP
                                            </span>
                                        </div>

                                        <h3 className="font-bold text-lg mb-1">{task.title}</h3>
                                        <p className="text-sm text-muted-foreground">{task.description}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="w-full glass-card p-8 flex flex-col items-center justify-center text-muted-foreground border-dashed border border-white/10 min-h-[200px]">
                                <p>Nenhuma missão ativa no momento.</p>
                                <p className="text-sm opacity-50">Aguarde seu líder atribuir novas tarefas.</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </main>
    )
}
