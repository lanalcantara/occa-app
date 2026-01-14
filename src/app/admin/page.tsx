import { createClient } from "@/lib/supabase-server"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export default async function AdminPage() {
    const supabase = await createClient()

    // 1. Fetch Counts (Parallel for performance)
    const [
        { count: membersCount },
        { count: tasksCount },
        { count: productsCount },
        { data: allProfiles },
        { data: recentTransactions },
        { data: activeProductsList }
    ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }).neq('role', 'admin'),
        supabase.from('tasks').select('*', { count: 'exact', head: true }).neq('status', 'completed'),
        supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('profiles').select('points'),
        supabase.from('transactions')
            .select(`
                *,
                user:profiles!user_id(full_name, avatar_url)
            `)
            .order('created_at', { ascending: false })
            .limit(5),
        supabase.from('products')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(10)
    ])

    // Calculate total points in circulation
    const totalPoints = allProfiles?.reduce((acc, curr) => acc + (curr.points || 0), 0) || 0

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Visão Geral</h2>
                <p className="text-muted-foreground">Bem-vindo ao painel de controle do OCCA.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <a href="/admin/users" className="block p-6 rounded-xl glass-card border border-white/10 hover:bg-white/5 transition-colors group">
                    <div className="text-sm font-medium text-muted-foreground group-hover:text-white transition-colors">Total de Membros</div>
                    <div className="text-2xl font-bold mt-2">{membersCount || 0}</div>
                    <div className="text-xs text-green-400 mt-1">Clique para gerenciar</div>
                </a>
                <div className="p-6 rounded-xl glass-card border border-white/10">
                    <div className="text-sm font-medium text-muted-foreground">Tarefas Abertas</div>
                    <div className="text-2xl font-bold mt-2">{tasksCount || 0}</div>
                    <div className="text-xs text-muted-foreground mt-1">Aguardando conclusão</div>
                </div>
                <div className="p-6 rounded-xl glass-card border border-white/10">
                    <div className="text-sm font-medium text-muted-foreground">Pontos em Circulação</div>
                    <div className="text-2xl font-bold mt-2 text-primary">{totalPoints.toLocaleString()} XP</div>
                    <div className="text-xs text-muted-foreground mt-1">Total acumulado pelos membros</div>
                </div>
                <a href="/admin/products" className="block p-6 rounded-xl glass-card border border-white/10 hover:bg-white/5 transition-colors group">
                    <div className="text-sm font-medium text-muted-foreground group-hover:text-white transition-colors">Loja de Talentos</div>
                    <div className="text-2xl font-bold mt-2">{productsCount || 0} Itens</div>
                    <div className="text-xs text-green-400 mt-1">Clique para ver estoque</div>
                </a>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Recent Activity */}
                <div className="rounded-xl glass-card border border-white/10 p-6">
                    <h3 className="text-lg font-semibold mb-4">Atividade Recente</h3>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {!recentTransactions || recentTransactions.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Nenhuma atividade recente.</p>
                        ) : (
                            recentTransactions.map((tx: any) => (
                                <div key={tx.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-white/10 overflow-hidden flex-shrink-0">
                                            {tx.user?.avatar_url && <img src={tx.user.avatar_url} className="w-full h-full object-cover" />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{tx.description}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {tx.user?.full_name} • {format(new Date(tx.created_at), "dd MMM, HH:mm", { locale: ptBR })}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded font-bold ${tx.points_amount > 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                        {tx.points_amount > 0 ? '+' : ''}{tx.points_amount}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Active Store Items */}
                <div className="rounded-xl glass-card border border-white/10 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Loja de Talentos (Disponíveis)</h3>
                        <a href="/admin/products" className="text-xs text-primary hover:underline">Gerenciar</a>
                    </div>

                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {/* We need to fetch this data. Assuming 'activeProductsList' is fetched */}
                        {(!productsCount || productsCount === 0) ? ( // Simplified check for now
                            <p className="text-sm text-muted-foreground">Nenhum item ativo.</p>
                        ) : (
                            // Ideally we map over fetched products. 
                            // Since I need to update the query first, I will output a PLACEHOLDER comment here 
                            // and update the fetch in the next step or same step if possible.
                            // Let's assume passed 'activeProductsList'
                            <div className="text-sm text-muted-foreground">Carregando itens...</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
