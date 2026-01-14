'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Search, ArrowDownCircle, ArrowUpCircle, ShoppingBag, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

type Transaction = {
    id: string
    created_at: string
    points_amount: number
    description: string
    user: {
        full_name: string
        email: string // Joined from auth.users? No, profiles doesn't have email usually unless replicated. 
        // Wait, profiles table doesn't have email in my schema. 
        // I'll just show full_name / avatar.
        avatar_url: string
    } | null
    product: {
        name: string
        image_url: string
    } | null
}

export function TransactionList() {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const supabase = createClient()

    useEffect(() => {
        fetchTransactions()
    }, [])

    async function fetchTransactions() {
        setLoading(true)
        // Join with profiles (user_id) and products (product_id)
        // Note: Supabase join syntax: select('*, user:profiles(*), product:products(*)')

        const { data, error } = await supabase
            .from('transactions')
            .select(`
                *,
                user:profiles!user_id (full_name, avatar_url),
                product:products (name, image_url)
            `)
            .order('created_at', { ascending: false })
            .limit(50)

        if (error) {
            console.error('Error fetching transactions:', error)
        } else {
            setTransactions(data as any)
        }
        setLoading(false)
    }

    const filtered = transactions.filter(t =>
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold">Histórico de Transações</h2>
                    <p className="text-muted-foreground">Monitoramento de compras e recompensas.</p>
                </div>

                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                    <input
                        className="w-full pl-9 p-2 rounded-lg bg-black/20 border border-white/10 text-sm"
                        placeholder="Buscar por usuário ou descrição..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-surface/50 border border-white/5 rounded-xl overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-white/5 text-muted-foreground uppercase text-xs font-bold">
                        <tr>
                            <th className="px-6 py-4">Usuário</th>
                            <th className="px-6 py-4">Descrição</th>
                            <th className="px-6 py-4">Valor</th>
                            <th className="px-6 py-4">Data</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Carregando...</td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Nenhuma transação encontrada.</td></tr>
                        ) : (
                            filtered.map(tx => (
                                <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {tx.user?.avatar_url ? (
                                                <img src={tx.user.avatar_url} className="w-8 h-8 rounded-full object-cover" />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-white/10" />
                                            )}
                                            <span className="font-medium">{tx.user?.full_name || 'Desconhecido'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {tx.points_amount < 0 ? (
                                                <ShoppingBag className="w-4 h-4 text-primary" />
                                            ) : (
                                                <CheckCircle className="w-4 h-4 text-green-400" />
                                            )}
                                            <span>
                                                {tx.product ? `Comprou: ${tx.product.name}` : tx.description}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "font-mono font-bold px-2 py-1 rounded text-xs",
                                            tx.points_amount < 0
                                                ? "text-red-400 bg-red-400/10"
                                                : "text-green-400 bg-green-400/10"
                                        )}>
                                            {tx.points_amount > 0 ? '+' : ''}{tx.points_amount} XP
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground">
                                        {format(new Date(tx.created_at), "dd 'de' MMM, HH:mm", { locale: ptBR })}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
