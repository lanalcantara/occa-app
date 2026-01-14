'use client'

import { TaskBoard } from "@/components/kanban/task-board"
import { createClient } from "@/lib/supabase"
import { useEffect, useState } from "react"
import { ShieldAlert, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function TasksPage() {
    const [canMove, setCanMove] = useState(false)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        checkPermissions()
    }, [])

    async function checkPermissions() {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('can_move_tasks')
                .eq('id', user.id)
                .single()

            if (profile) {
                setCanMove(profile.can_move_tasks || false)
            }
        }
        setLoading(false)
    }

    if (loading) return null

    return (
        <div className="container mx-auto py-8 space-y-6">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors px-4 md:px-0 mb-[-1rem]">
                <ArrowLeft className="w-4 h-4" />
                Voltar ao Dashboard
            </Link>

            <div className="flex justify-between items-center px-4 md:px-0">
                <div>
                    <h1 className="text-2xl font-bold">Quadro de Tarefas</h1>
                    <p className="text-muted-foreground">Visualize o andamento das tarefas da agência.</p>
                </div>
                {!canMove && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                        <ShieldAlert className="w-3 h-3" />
                        <span>Modo Visualização</span>
                    </div>
                )}
            </div>

            <TaskBoard canCreate={false} canMove={canMove} />
        </div>
    )
}
