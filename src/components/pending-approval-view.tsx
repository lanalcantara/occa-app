'use client'

import { Clock, CheckCircle2 } from 'lucide-react'
import { SignOutButton } from '@/components/sign-out-button'

export function PendingApprovalView() {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-900/20 via-black to-black" />

            <div className="relative z-10 max-w-md w-full text-center space-y-6">
                <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto border border-yellow-500/20 animate-pulse">
                    <Clock className="w-10 h-10 text-yellow-500" />
                </div>

                <h1 className="text-3xl font-bold">Solicitação em Análise</h1>

                <p className="text-muted-foreground leading-relaxed">
                    Recebemos o cadastro da sua empresa. Nossa equipe administrativa está validando suas informações.
                </p>

                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-left space-y-2">
                    <div className="flex items-center gap-2 text-green-400">
                        <CheckCircle2 className="w-4 h-4" /> Cadastro Enviado
                    </div>
                    <div className="flex items-center gap-2 text-yellow-400 font-bold">
                        <Clock className="w-4 h-4" /> Aguardando Aprovação
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground opacity-50">
                        <div className="w-4 h-4 rounded-full border border-white/20" /> Acesso Liberado
                    </div>
                </div>

                <div className="pt-8">
                    <SignOutButton className="text-sm text-muted-foreground hover:text-white underline underline-offset-4" />
                </div>
            </div>
        </div>
    )
}
