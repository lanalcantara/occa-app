import { createClient } from "@/lib/supabase-server"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ShieldCheck, History } from "lucide-react"

export default async function AuditPage() {
    const supabase = await createClient()

    // Fetch logs with admin details
    // Note: We need to manually join or fetch profiles because foreign key relation might strictly be auth.users which is not exposed directly via standard API joins easily without config.
    // Actually, profiles shares ID with auth.users. 
    // Let's try to select `*, profiles!audit_logs_admin_id_fkey(full_name)` if relation exists.
    // If not, we fetch simple and then fetch profiles map.
    // Let's assume standard query first.

    // Check if we can just fetch logs first.
    const { data: logs, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)

    if (error) {
        console.error("Error fetching audit logs", error)
        return <div className="p-8 text-red-400">Erro ao carregar logs de auditoria.</div>
    }

    // Fetch related profile names for admin_id and target_user_id
    const userIds = new Set<string>()
    logs?.forEach(log => {
        if (log.admin_id) userIds.add(log.admin_id)
        if (log.target_user_id) userIds.add(log.target_user_id)
    })

    const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .in('id', Array.from(userIds))

    const profileMap = new Map(profiles?.map(p => [p.id, p]))

    return (
        <div className="container mx-auto py-8 space-y-8">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                    <History className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Auditoria e Logs</h1>
                    <p className="text-muted-foreground">Registro de todas as ações administrativas sensíveis.</p>
                </div>
            </div>

            <div className="bg-surface border border-white/5 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-white/5 uppercase text-xs font-bold text-muted-foreground tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Data/Hora</th>
                                <th className="px-6 py-4">Admin Responsável</th>
                                <th className="px-6 py-4">Ação</th>
                                <th className="px-6 py-4">Alvo (Usuário)</th>
                                <th className="px-6 py-4">Detalhes</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {logs?.map((log) => {
                                const admin = profileMap.get(log.admin_id)
                                const target = log.target_user_id ? profileMap.get(log.target_user_id) : null

                                return (
                                    <tr key={log.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 font-mono text-muted-foreground whitespace-nowrap">
                                            {format(new Date(log.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold ring-1 ring-inset ring-indigo-500/30">
                                                    {admin?.full_name?.charAt(0) || '?'}
                                                </div>
                                                <span className="font-medium">{admin?.full_name || 'Desconhecido'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${log.action.includes('DELETE') ? 'bg-red-400/10 text-red-400 ring-red-400/20' :
                                                    log.action.includes('PROMOTE') ? 'bg-yellow-400/10 text-yellow-400 ring-yellow-400/20' :
                                                        'bg-blue-400/10 text-blue-400 ring-blue-400/20'
                                                }`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            {target ? (
                                                <div className="flex items-center gap-2">
                                                    <span>{target.full_name}</span>
                                                    <span className="text-[10px] uppercase bg-white/5 px-1 rounded">{target.role}</span>
                                                </div>
                                            ) : (
                                                log.target_user_id ? <span className="text-xs font-mono">{log.target_user_id.slice(0, 8)}...</span> : '-'
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <code className="text-[10px] bg-black/30 p-1 rounded font-mono text-gray-400">
                                                {JSON.stringify(log.details)}
                                            </code>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>

                    {(!logs || logs.length === 0) && (
                        <div className="p-12 text-center text-muted-foreground">
                            Nenhum registro de auditoria encontrado.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
