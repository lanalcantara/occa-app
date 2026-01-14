import { ShopGrid } from "@/components/shop/shop-grid";
import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/sign-out-button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function ShopPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('id, points')
        .eq('id', user.id)
        .single();

    if (!profile) redirect("/login");

    return (
        <main className="flex min-h-screen flex-col items-center p-4 md:p-8 relative overflow-hidden bg-background">
            {/* Ambient Background */}
            <div className="fixed top-[20%] right-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="z-10 w-full max-w-6xl flex flex-col gap-8">
                <header className="flex justify-between items-center w-full pb-8 border-b border-white/5">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 hover:bg-white/5 rounded-full transition-colors">
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">Loja OCCA</h1>
                            <p className="text-muted-foreground">Recompensas para quem faz acontecer.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden md:block text-right">
                            <p className="text-xs text-muted-foreground">Logado como</p>
                            <p className="text-sm font-bold">{user.email}</p>
                        </div>
                        <SignOutButton className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors" />
                    </div>
                </header>

                <ShopGrid userPoints={profile.points} userId={profile.id} />
            </div>
        </main>
    );
}
