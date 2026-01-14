import { AuthForm } from "@/components/auth-form";
import { Briefcase } from "lucide-react";
import Link from "next/link";

export default function PartnerLoginPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-zinc-950">
            {/* Professional Background */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-zinc-950 to-zinc-950" />
            <div className="absolute top-0 left-0 w-full h-full bg-grid-white/[0.02] pointer-events-none" />

            <div className="relative z-10 w-full max-w-md space-y-8">
                <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto border border-blue-500/20 mb-6">
                        <Briefcase className="w-8 h-8 text-blue-400" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Portal do Parceiro</h1>
                    <p className="text-muted-foreground">Acesse sua área exclusiva para gerenciar demandas.</p>
                </div>

                <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-xl shadow-2xl">
                    <AuthForm isPartnerSignup={true} />
                </div>

                <div className="text-center">
                    <Link href="/login" className="text-xs text-muted-foreground hover:text-white transition-colors">
                        Sou um membro da equipe OCCA &rarr;
                    </Link>
                </div>
            </div>
        </div>
    );
}
