'use client'

import { useState, useEffect } from 'react'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { deleteUser, promoteToAdmin, demoteToMember, createAdminUser } from '@/app/actions/admin-actions'
import { Trash2, Shield, UserPlus, AlertTriangle, X, Check, Loader2, ArrowDownCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

type UserProfile = {
    id: string
    full_name: string
    email: string
    role: 'admin' | 'member'
    avatar_url?: string
}

export function AdminUserManagement() {
    const [users, setUsers] = useState<UserProfile[]>([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')

    // Modals
    const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null)
    const [adminPassword, setAdminPassword] = useState('')
    const [isCreateOpen, setIsCreateOpen] = useState(false)

    // Create Form
    const [newAdmin, setNewAdmin] = useState({ name: '', email: '', cpf: '' })

    const supabase = createClient()

    useEffect(() => {
        fetchUsers()
    }, [])

    async function fetchUsers() {
        const { data } = await supabase.from('profiles').select('*').order('full_name')
        if (data) setUsers(data as UserProfile[])
        setLoading(false)
    }

    async function handleDeleteSubmit() {
        if (!userToDelete || !adminPassword) return

        setActionLoading(true)
        try {
            await deleteUser(userToDelete.id, adminPassword)
            setUsers(prev => prev.filter(u => u.id !== userToDelete.id))
            setUserToDelete(null)
            setAdminPassword('')
            alert('Usuário removido com sucesso.')
        } catch (error: any) {
            alert(error.message)
        } finally {
            setActionLoading(false)
        }
    }

    async function handlePromote(user: UserProfile) {
        if (!confirm(`Tem certeza que deseja promover ${user.full_name} para Admin?`)) return

        setActionLoading(true)
        try {
            await promoteToAdmin(user.id)
            setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: 'admin' } : u))
            alert('Usuário promovido com sucesso.')
        } catch (error: any) {
            alert(error.message)
        } finally {
            setActionLoading(false)
        }
    }

    async function handleCreateSubmit() {
        if (!newAdmin.name || !newAdmin.email || !newAdmin.cpf) {
            alert('Preencha todos os campos.')
            return
        }

        setActionLoading(true)
        try {
            const result = await createAdminUser(newAdmin.name, newAdmin.email, newAdmin.cpf, 'admin')
            alert(`Admin criado com sucesso!\nSenha temporária: ${result.tempPassword}`)
            setIsCreateOpen(false)
            setNewAdmin({ name: '', email: '', cpf: '' })
            fetchUsers()
        } catch (error: any) {
            alert(error.message)
        } finally {
            setActionLoading(false)
        }
    }

    const filteredUsers = users.filter(u =>
        u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="bg-surface border border-white/5 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 bg-white/[0.02]">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-primary" />
                        Gestão de Usuários
                    </h2>
                    <p className="text-muted-foreground text-sm">Crie admins, gerencie permissões e remova usuários.</p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <input
                        placeholder="Buscar usuário..."
                        className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm flex-1 md:w-64 focus:outline-none focus:border-primary/50"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    <button
                        onClick={() => setIsCreateOpen(true)}
                        className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 whitespace-nowrap transition-colors"
                    >
                        <UserPlus className="w-4 h-4" />
                        Novo Admin
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-white/5 uppercase text-xs font-bold text-muted-foreground tracking-wider">
                        <tr>
                            <th className="px-6 py-4">Usuário</th>
                            <th className="px-6 py-4">Email / Info</th>
                            <th className="px-6 py-4">Função</th>
                            <th className="px-6 py-4 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            <tr><td colSpan={4} className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></td></tr>
                        ) : filteredUsers.map(user => (
                            <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-lg overflow-hidden">
                                            {user.avatar_url ? (
                                                <img src={user.avatar_url} className="w-full h-full object-cover" />
                                            ) : (
                                                user.full_name?.charAt(0)
                                            )}
                                        </div>
                                        <span className="font-bold">{user.full_name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-muted-foreground">
                                    <div>{user.email || 'Sem email'}</div>
                                    <div className="text-xs opacity-50 font-mono">{user.id.slice(0, 8)}...</div>
                                </td>
                                <td className="px-6 py-4">
                                    {user.role === 'admin' ? (
                                        <span className="inline-flex items-center gap-1 bg-purple-500/10 text-purple-400 px-2 py-1 rounded border border-purple-500/20 text-xs font-bold">
                                            <Shield className="w-3 h-3" /> ADMIN
                                        </span>
                                    ) : (
                                        <span className="bg-white/5 text-muted-foreground px-2 py-1 rounded border border-white/5 text-xs">
                                            MEMBRO
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right flex justify-end gap-2">
                                    {user.role !== 'admin' && (
                                        <button
                                            onClick={() => handlePromote(user)}
                                            disabled={actionLoading}
                                            className="p-2 hover:bg-blue-500/10 text-muted-foreground hover:text-blue-400 rounded-lg transition-colors disabled:opacity-50"
                                            title="Promover a Admin"
                                        >
                                            <Shield className="w-4 h-4" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setUserToDelete(user)}
                                        disabled={actionLoading}
                                        className="p-2 hover:bg-red-500/10 text-muted-foreground hover:text-red-400 rounded-lg transition-colors disabled:opacity-50"
                                        title="Remover Usuário"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {userToDelete && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-surface border border-red-500/30 w-full max-w-md rounded-2xl p-6 shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-red-500" />
                            <h3 className="text-xl font-bold flex items-center gap-2 text-red-400 mb-2">
                                <AlertTriangle className="w-5 h-5" />
                                Confirmar Exclusão
                            </h3>
                            <p className="text-muted-foreground mb-6">
                                Você está prestes a remover <b>{userToDelete.full_name}</b> permanentemente.
                                Essa ação não pode ser desfeita.
                            </p>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-bold block mb-1">Confirme sua senha de Admin</label>
                                    <input
                                        type="password"
                                        className="w-full bg-black/20 border border-white/10 rounded-lg p-2 focus:border-red-500/50 focus:outline-none transition-colors"
                                        placeholder="Sua senha..."
                                        value={adminPassword}
                                        onChange={e => setAdminPassword(e.target.value)}
                                    />
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => { setUserToDelete(null); setAdminPassword('') }}
                                        className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg font-bold transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleDeleteSubmit}
                                        disabled={!adminPassword || actionLoading}
                                        className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : < Trash2 className="w-4 h-4" />}
                                        Deletar
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Create Admin Modal */}
            <AnimatePresence>
                {isCreateOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-surface border border-primary/30 w-full max-w-md rounded-2xl p-6 shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
                            <div className="flex justify-between items-start mb-6">
                                <h3 className="text-xl font-bold flex items-center gap-2 text-white">
                                    <UserPlus className="w-5 h-5 text-primary" />
                                    Novo Administrador
                                </h3>
                                <button onClick={() => setIsCreateOpen(false)} className="text-muted-foreground hover:text-white"><X className="w-5 h-5" /></button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-bold block mb-1">Nome Completo</label>
                                    <input
                                        className="w-full bg-black/20 border border-white/10 rounded-lg p-2 focus:border-primary/50 focus:outline-none"
                                        value={newAdmin.name}
                                        onChange={e => setNewAdmin({ ...newAdmin, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-bold block mb-1">Email</label>
                                    <input
                                        type="email"
                                        className="w-full bg-black/20 border border-white/10 rounded-lg p-2 focus:border-primary/50 focus:outline-none"
                                        value={newAdmin.email}
                                        onChange={e => setNewAdmin({ ...newAdmin, email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-bold block mb-1">CPF (apenas números)</label>
                                    <input
                                        className="w-full bg-black/20 border border-white/10 rounded-lg p-2 focus:border-primary/50 focus:outline-none"
                                        placeholder="Para senha inicial..."
                                        value={newAdmin.cpf}
                                        onChange={e => setNewAdmin({ ...newAdmin, cpf: e.target.value })}
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">A senha será os 5 primeiros dígitos do CPF.</p>
                                </div>

                                <button
                                    onClick={handleCreateSubmit}
                                    disabled={actionLoading}
                                    className="w-full py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
                                >
                                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                    Criar Admin
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
