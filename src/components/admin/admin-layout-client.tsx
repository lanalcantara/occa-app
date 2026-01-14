'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SignOutButton } from '@/components/sign-out-button'
import { cn } from '@/lib/utils'
import { BarChart3, Users, Award, ShoppingBag, History, Image as ImageIcon, Menu, X } from 'lucide-react'

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setSidebarOpen] = useState(false)
    const pathname = usePathname()

    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden">
            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 w-full h-16 bg-surface border-b border-white/10 z-50 flex items-center px-4 justify-between">
                <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    OCCA Admin
                </h1>
                <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 text-white hover:bg-white/5 rounded-lg">
                    {isSidebarOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Sidebar (Mobile Overlay + Desktop Fixed) */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-40 w-64 bg-surface border-r border-white/10 transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static flex flex-col pt-16 md:pt-0",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="hidden md:block p-6 border-b border-white/5">
                    <Link href="/intro" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <img src="/occa-logo.png" alt="OCCA" className="h-8 w-auto invert brightness-0" />
                    </Link>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    <Link href="/admin" onClick={() => setSidebarOpen(false)} className={cn("flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium", pathname === '/admin' ? 'bg-white text-black font-bold shadow-lg' : 'text-muted-foreground hover:bg-white/5 hover:text-white')}>
                        <BarChart3 className="w-5 h-5" />
                        Home
                    </Link>
                    <Link href="/admin/users" onClick={() => setSidebarOpen(false)} className={cn("flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium", pathname === '/admin/users' ? 'bg-white text-black font-bold shadow-lg' : 'text-muted-foreground hover:bg-white/5 hover:text-white')}>
                        <Users className="w-5 h-5" />
                        Membros e Perfis
                    </Link>
                    <Link href="/admin/tasks" onClick={() => setSidebarOpen(false)} className={cn("flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium", pathname === '/admin/tasks' ? 'bg-white text-black font-bold shadow-lg' : 'text-muted-foreground hover:bg-white/5 hover:text-white')}>
                        <Award className="w-5 h-5" />
                        Tarefas e Pontos
                    </Link>
                    <Link href="/admin/products" onClick={() => setSidebarOpen(false)} className={cn("flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium", pathname === '/admin/products' ? 'bg-white text-black font-bold shadow-lg' : 'text-muted-foreground hover:bg-white/5 hover:text-white')}>
                        <ShoppingBag className="w-5 h-5" />
                        Produtos
                    </Link>
                    <Link href="/admin/transactions" onClick={() => setSidebarOpen(false)} className={cn("flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium", pathname === '/admin/transactions' ? 'bg-white text-black font-bold shadow-lg' : 'text-muted-foreground hover:bg-white/5 hover:text-white')}>
                        <History className="w-5 h-5" />
                        Transações
                    </Link>
                </nav>

                <div className="p-4 border-t border-white/5">
                    <SignOutButton className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-red-400 cursor-pointer hover:bg-red-400/10 rounded-lg transition-colors" />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto relative pt-16 md:pt-0">
                <div className="fixed top-0 left-0 w-full h-full bg-grid-white/[0.02] pointer-events-none" />
                <div className="relative z-10 p-4 md:p-8 pb-24 md:pb-8">
                    {children}
                </div>
            </main>

            {/* Overlay for mobile sidebar */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    )
}
