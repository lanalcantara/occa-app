import { AuthForm } from "@/components/auth-form";
import Link from "next/link";

export default function LoginPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-background">
            {/* Background Gradients - Subtle */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-white/5 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-white/5 rounded-full blur-[100px]" />

            <div className="relative z-10 w-full">
                <div className="mb-8 text-center flex flex-col items-center">
                    <img src="/occa-logo.png" alt="OCCA" className="h-24 w-auto mb-4 invert brightness-0" />
                    <p className="text-muted-foreground">Olinda Creative Community Action</p>
                </div>
                <AuthForm />
                <div className="mt-8 text-center">
                    <Link href="/partner/login" className="text-sm text-white/50 hover:text-white transition-colors flex items-center justify-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-blue-500" />
                        Acesso para Parceiros/Clientes
                    </Link>
                </div>
            </div>
        </div>
    );
}
