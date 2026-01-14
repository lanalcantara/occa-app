'use client'

import { useState, useEffect } from 'react'
import {
    DndContext,
    DragOverlay,
    useDraggable,
    useDroppable,
    DragEndEvent,
    DragStartEvent,
} from '@dnd-kit/core'
import { createClient } from '@/lib/supabase'
import { Plus, User, Coins, X, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

// --- Types ---
type Task = {
    id: string
    title: string
    description: string
    points_reward: number
    category_required: string
    assigned_to: string | null
    status: 'open' | 'in_progress' | 'completed'
    updated_at: string
    assignee?: { full_name: string, avatar_url: string }
}

type Member = {
    id: string
    full_name: string
    avatar_url: string
    category: string
}

type ColumnType = 'todo' | 'doing' | 'done'

interface TaskBoardProps {
    canCreate?: boolean
    canMove?: boolean
}

// --- Components ---

// Draggable Member Item (Sidebar)
function DraggableMember({ member, disabled }: { member: Member; disabled?: boolean }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: `member-${member.id}`,
        data: { type: 'member', member },
        disabled: disabled
    })

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={cn(
                "flex items-center gap-3 p-3 bg-surface border border-white/5 rounded-lg",
                !disabled && "cursor-grab hover:bg-white/5 active:cursor-grabbing",
                isDragging && "opacity-50",
                disabled && "opacity-70 cursor-default"
            )}
        >
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary border border-white/5">
                {member.avatar_url ? (
                    <img src={member.avatar_url} className="w-full h-full rounded-full object-cover" />
                ) : (
                    member.full_name.charAt(0)
                )}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{member.full_name}</p>
                <p className="text-[10px] text-muted-foreground uppercase">{member.category}</p>
            </div>
        </div>
    )
}

// Kanban Task Card
function TaskCard({ task, canMove }: { task: Task; canMove?: boolean }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: task.id,
        data: { type: 'task', task },
        disabled: !canMove || task.status === 'completed'
    })

    const { setNodeRef: setDropRef, isOver } = useDroppable({
        id: `drop-task-${task.id}`,
        data: { type: 'task-drop-zone', task },
        disabled: !canMove || task.status === 'completed'
    })

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={cn(
                "relative p-4 rounded-xl border transition-all group touch-none",
                task.status === 'completed' ? "bg-green-500/5 border-green-500/20" :
                    task.assigned_to
                        ? "bg-surface/50 border-white/5" // Assigned
                        : "glass-card border-white/10", // Open
                isDragging && "opacity-30 z-50 rotate-3",
                !canMove && "cursor-default"
            )}
        >
            {/* Drop Zone overlay for Members */}
            <div ref={setDropRef} className={cn(
                "absolute inset-0 z-10 rounded-xl transition-colors pointer-events-none",
                isOver && canMove && "bg-primary/20 border-2 border-primary"
            )} />

            <div className="flex justify-between items-start mb-2 relative z-20">
                <span className={cn(
                    "text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border",
                    task.category_required === 'senior' ? "border-purple-500/50 text-purple-400" :
                        task.category_required === 'pleno' ? "border-blue-500/50 text-blue-400" : "border-green-500/50 text-green-400"
                )}>
                    {task.category_required}
                </span>
                <div className="flex items-center gap-1 text-secondary text-sm font-mono font-bold">
                    <Coins className="w-3 h-3" />
                    {task.points_reward}
                </div>
            </div>

            <h3 className="font-bold text-sm mb-1 relative z-20 break-words">{task.title}</h3>
            {task.status !== 'completed' && (
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3 relative z-20 break-words">{task.description}</p>
            )}

            <div className="pt-2 border-t border-white/5 flex items-center justify-between mt-auto relative z-20">
                {task.assigned_to && task.assignee ? (
                    <div className="flex items-center gap-2 text-xs bg-white/5 px-2 py-1 rounded-full">
                        {task.assignee.avatar_url && (
                            <img src={task.assignee.avatar_url} className="w-4 h-4 rounded-full" />
                        )}
                        <span className="truncate max-w-[100px]">{task.assignee.full_name}</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground opacity-50">
                        <div className="w-5 h-5 rounded-full border border-dashed border-white/30 flex items-center justify-center">
                            <Plus className="w-3 h-3" />
                        </div>
                        <span className='hidden xl:inline'>Arraste membro</span>
                    </div>
                )}
            </div>

            {task.status === 'completed' && (
                <div className="absolute top-2 right-2 text-green-400">
                    <CheckCircle className="w-4 h-4" />
                </div>
            )}
        </div>
    )
}

// Kanban Column
function KanbanColumn({ id, title, tasks, canMove }: { id: ColumnType, title: string, tasks: Task[], canMove?: boolean }) {
    const { setNodeRef, isOver } = useDroppable({
        id: id,
        data: { type: 'column', columnId: id },
        disabled: !canMove
    })

    return (
        <div className="flex-1 flex flex-col min-w-[300px] bg-white/[0.02] rounded-xl border border-white/5 h-full">
            <div className={cn(
                "p-4 border-b border-white/5 flex justify-between items-center",
                id === 'todo' && "bg-white/[0.02]",
                id === 'doing' && "bg-blue-500/5",
                id === 'done' && "bg-green-500/5"
            )}>
                <h3 className="font-bold text-sm uppercase tracking-wider opacity-80">{title}</h3>
                <span className="text-xs bg-white/10 px-2 py-1 rounded opacity-50">{tasks.length}</span>
            </div>

            <div
                ref={setNodeRef}
                className={cn(
                    "flex-1 p-3 space-y-3 overflow-y-auto transition-colors",
                    isOver && canMove && "bg-white/5"
                )}>
                {tasks.map(task => (
                    <TaskCard key={task.id} task={task} canMove={canMove} />
                ))}

                {tasks.length === 0 && (
                    <div className="h-full flex items-center justify-center text-muted-foreground/20 text-sm italic">
                        Vazio
                    </div>
                )}
            </div>
        </div>
    )
}

export function TaskBoard({ canCreate = false, canMove = false }: TaskBoardProps) {
    const [tasks, setTasks] = useState<Task[]>([])
    const [members, setMembers] = useState<Member[]>([])
    const [activeDragData, setActiveDragData] = useState<any>(null)
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const supabase = createClient()

    // Create Form State
    const [newTask, setNewTask] = useState({ title: '', description: '', points: 10, category: 'junior' })

    useEffect(() => {
        fetchData()

        // Real-time subscription for Tasks
        const tasksSubscription = supabase
            .channel('public:tasks')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload) => {
                console.log('Real-time change received!', payload)
                // Just refetch for simplicity and correctness (especially with joins)
                fetchData()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(tasksSubscription)
        }
    }, [])

    async function fetchData() {
        // Fetch Tasks
        const { data: tasksData } = await supabase
            .from('tasks')
            .select(`
            *,
            assignee:profiles!tasks_assigned_to_fkey(full_name, avatar_url)
        `)
            .order('created_at', { ascending: false })

        if (tasksData) {
            // Filter logic: 
            // Show all 'open' and 'in_progress'
            // Show 'completed' ONLY if updated_at is within last 3 days
            const threeDaysAgo = new Date()
            threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

            const visibleTasks = tasksData.filter(t => {
                if (t.status !== 'completed') return true
                return new Date(t.updated_at) > threeDaysAgo
            }) as Task[]

            setTasks(visibleTasks)
        }

        // Fetch Members
        const { data: membersData } = await supabase.from('profiles').select('*').neq('role', 'admin')
        if (membersData) setMembers(membersData)
    }

    async function handleCreateTask() {
        const { error } = await supabase.from('tasks').insert({
            title: newTask.title,
            description: newTask.description,
            points_reward: newTask.points,
            category_required: newTask.category,
            status: 'open'
        })

        if (!error) {
            setIsCreateOpen(false)
            setNewTask({ title: '', description: '', points: 10, category: 'junior' })
            fetchData()
        }
    }

    function handleDragStart(event: DragStartEvent) {
        if (!canMove) return
        setActiveDragData(event.active.data.current)
    }

    async function handleDragEnd(event: DragEndEvent) {
        if (!canMove) return
        const { active, over } = event
        setActiveDragData(null)

        if (!over) return

        const activeType = active.data.current?.type
        const overType = over.data.current?.type

        // 1. Assign Member -> Task (Drop on Task Card)
        if (activeType === 'member' && (overType === 'task' || overType === 'task-drop-zone')) {
            const memberId = active.data.current?.member.id
            const task = over.data.current?.task as Task

            if (task.status === 'completed') return // Cannot assign to completed

            // Optimistic Update
            const member = members.find(m => m.id === memberId)
            setTasks(prev => prev.map(t => t.id === task.id ? {
                ...t,
                assigned_to: memberId,
                status: 'in_progress',
                assignee: member ? { full_name: member.full_name, avatar_url: member.avatar_url } : undefined
            } : t))

            await supabase.from('tasks').update({
                assigned_to: memberId,
                status: 'in_progress'
            }).eq('id', task.id)

            return
        }

        // 2. Move Task -> Column
        if (activeType === 'task' && overType === 'column') {
            const taskId = active.id as string
            const task = tasks.find(t => t.id === taskId)
            const targetColumn = over.data.current?.columnId as ColumnType

            if (!task) return
            if (task.status === 'completed') return // Already done

            // Logic for transitions
            if (targetColumn === 'done') {
                if (!task.assigned_to) {
                    alert('Tarefa precisa de um responsável para ser concluída!')
                    return
                }

                if (!confirm(`Confirmar conclusão da tarefa "${task.title}"? \nIsso enviará ${task.points_reward} XP para ${task.assignee?.full_name}.`)) return

                // Call RPC
                // Optimistic update
                setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'completed', updated_at: new Date().toISOString() } : t))

                const { data, error } = await supabase.rpc('complete_task', { p_task_id: taskId })

                if (error || (data && !data.success)) {
                    console.error('RPC Error Details:', { error, data, taskId })
                    alert(`Erro ao concluir tarefa: ${error?.message || data?.message || 'Erro desconhecido'}`)
                    fetchData() // Revert UI on error
                }
            } else if (targetColumn === 'doing') {
                if (!task.assigned_to) {
                    alert('Atribua um membro primeiro para mover para Doing!')
                    return
                }
                setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'in_progress' } : t))
                await supabase.from('tasks').update({ status: 'in_progress' }).eq('id', taskId)
            } else if (targetColumn === 'todo') {
                // Move back to open?
                setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'open' } : t))
                await supabase.from('tasks').update({ status: 'open' }).eq('id', taskId)
            }
        }
    }

    const todoTasks = tasks.filter(t => t.status === 'open')
    const doingTasks = tasks.filter(t => t.status === 'in_progress')
    const doneTasks = tasks.filter(t => t.status === 'completed')

    const [activeMobileTab, setActiveMobileTab] = useState<ColumnType>('todo')

    return (
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="flex flex-col md:flex-row h-[calc(100vh-140px)] gap-6 relative">

                {/* LEFT: Members Sidebar (Hidden on Mobile for now or stackable?? Let's hide on specific mobile breakdown or keep it) 
                    Actually, let's keep members sidebar on Desktop, maybe hide or different view on mobile?
                    For this request "deixe o quadro de tarefas de uma forma mais legal no mobile", focusing on columns is key.
                */}
                <div
                    className={cn(
                        "hidden md:flex w-64 flex-col glass-card border rounded-xl overflow-hidden transition-colors flex-shrink-0",
                        "border-white/10"
                    )}
                >
                    <div className="p-4 border-b border-white/5 bg-surface/50">
                        <h3 className="font-bold flex items-center gap-2">
                            <User className="w-4 h-4 text-primary" />
                            Membros
                        </h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-2">
                        {members.map(member => (
                            <DraggableMember key={member.id} member={member} disabled={!canMove} />
                        ))}
                    </div>
                </div>

                {/* MOBILE TABS */}
                <div className="md:hidden flex gap-2 p-1 bg-white/5 rounded-lg mb-2 flex-shrink-0 mx-4">
                    <button onClick={() => setActiveMobileTab('todo')} className={cn("flex-1 py-2 text-xs font-bold rounded uppercase tracking-wider", activeMobileTab === 'todo' ? "bg-white text-black" : "text-muted-foreground")}>To Do</button>
                    <button onClick={() => setActiveMobileTab('doing')} className={cn("flex-1 py-2 text-xs font-bold rounded uppercase tracking-wider", activeMobileTab === 'doing' ? "bg-blue-500 text-white" : "text-muted-foreground")}>Doing</button>
                    <button onClick={() => setActiveMobileTab('done')} className={cn("flex-1 py-2 text-xs font-bold rounded uppercase tracking-wider", activeMobileTab === 'done' ? "bg-green-500 text-white" : "text-muted-foreground")}>Done</button>
                </div>

                {/* RIGHT: Kanban Columns */}
                <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden relative">
                    {/* Mobile: Show only active tab */}
                    <div className={cn("md:hidden flex-1 h-full px-4", activeMobileTab === 'todo' ? 'block' : 'hidden')}>
                        <KanbanColumn id="todo" title="To Do" tasks={todoTasks} canMove={canMove} />
                    </div>
                    <div className={cn("md:hidden flex-1 h-full px-4", activeMobileTab === 'doing' ? 'block' : 'hidden')}>
                        <KanbanColumn id="doing" title="Doing" tasks={doingTasks} canMove={canMove} />
                    </div>
                    <div className={cn("md:hidden flex-1 h-full px-4", activeMobileTab === 'done' ? 'block' : 'hidden')}>
                        <KanbanColumn id="done" title="Done" tasks={doneTasks} canMove={canMove} />
                    </div>

                    {/* Desktop: Show all */}
                    <div className="hidden md:flex flex-1 gap-4 overflow-x-auto pb-4 h-full">
                        <KanbanColumn id="todo" title="To Do" tasks={todoTasks} canMove={canMove} />
                        <KanbanColumn id="doing" title="Doing" tasks={doingTasks} canMove={canMove} />
                        <KanbanColumn id="done" title="Done" tasks={doneTasks} canMove={canMove} />
                    </div>
                </div>

                {/* Absolute Create Button */}
                {canCreate && (
                    <button
                        onClick={() => setIsCreateOpen(true)}
                        className="absolute bottom-6 right-6 md:top-0 md:right-0 md:bottom-auto md:translate-y-[-3rem] px-4 py-3 md:py-2 bg-white text-black hover:bg-white/90 rounded-full md:rounded-lg font-bold flex items-center gap-2 transition-colors shadow-lg z-50"
                    >
                        <Plus className="w-5 h-5 md:w-4 md:h-4" />
                        <span className="hidden md:inline">Nova Tarefa</span>
                    </button>
                )}

                <DragOverlay>
                    {activeDragData?.type === 'member' && canMove && (
                        <div className="flex items-center gap-3 p-3 bg-surface border border-primary/50 rounded-lg shadow-2xl w-64 opacity-90 cursor-grabbing">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                                {activeDragData.member.full_name.charAt(0)}
                            </div>
                            <p className="text-sm font-medium">{activeDragData.member.full_name}</p>
                        </div>
                    )}

                    {activeDragData?.type === 'task' && canMove && (
                        <div className="w-[300px] opacity-90 cursor-grabbing">
                            <TaskCard task={activeDragData.task} canMove={canMove} />
                        </div>
                    )}
                </DragOverlay>

                {/* Create Modal */}
                <AnimatePresence>
                    {isCreateOpen && canCreate && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="w-full max-w-md bg-surface border border-white/10 rounded-2xl shadow-xl overflow-hidden"
                            >
                                <div className="p-4 border-b border-white/5 flex justify-between items-center bg-zinc-900">
                                    <h3 className="font-bold">Nova Tarefa</h3>
                                    <button onClick={() => setIsCreateOpen(false)}><X className="w-5 h-5" /></button>
                                </div>
                                <div className="p-6 space-y-4 bg-zinc-900/50">
                                    <div>
                                        <label className="text-sm text-muted-foreground block mb-1">Título</label>
                                        <input
                                            className="w-full p-2 rounded bg-black/20 border border-white/10"
                                            value={newTask.title}
                                            onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-muted-foreground block mb-1">Descrição</label>
                                        <textarea
                                            className="w-full p-2 rounded bg-black/20 border border-white/10 h-24 resize-none"
                                            value={newTask.description}
                                            onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm text-muted-foreground block mb-1">Pontos</label>
                                            <input
                                                type="number"
                                                className="w-full p-2 rounded bg-black/20 border border-white/10"
                                                value={newTask.points}
                                                onChange={e => setNewTask({ ...newTask, points: parseInt(e.target.value) })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm text-muted-foreground block mb-1">Categoria Mínima</label>
                                            <select
                                                className="w-full p-2 rounded bg-black/20 border border-white/10"
                                                value={newTask.category}
                                                onChange={e => setNewTask({ ...newTask, category: e.target.value })}
                                            >
                                                <option value="junior">Junior</option>
                                                <option value="pleno">Pleno</option>
                                                <option value="senior">Sênior</option>
                                            </select>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleCreateTask}
                                        className="w-full py-2 bg-primary text-white rounded font-bold hover:opacity-90 mt-2"
                                    >
                                        Criar Tarefa
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

            </div>
        </DndContext>
    )
}
