import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { FeedbackManager } from "@/components/feedback/feedback-manager"
import { SignOutButton } from "@/components/sign-out-button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function FeedbackPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return redirect("/login")

    return (
        <main className="min-h-screen bg-background text-foreground relative overflow-hidden flex flex-col">
            {/* Ambient Background */}
            <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

            <header className="p-6 md:p-8 flex justify-between items-center relative z-10 border-b border-white/5 bg-background/50 backdrop-blur-sm sticky top-0">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 hover:bg-white/5 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Evaluation 360°</h1>
                        <p className="text-sm text-muted-foreground">Feedback contínuo para evoluirmos juntos.</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <p className="hidden md:block text-sm font-medium">{user.email}</p>
                    <SignOutButton className="text-red-400 hover:bg-red-400/10 p-2 rounded-lg" />
                </div>
            </header>

            <div className="flex-1 p-6 md:p-8 relative z-10 overflow-y-auto">
                <FeedbackManager currentUserId={user.id} />
            </div>
        </main>
    )
}
