'use client'

import { useState, useEffect } from 'react'
import {
    DndContext,
    DragOverlay,
    useDraggable,
    useDroppable,
    DragEndEvent,
    DragStartEvent,
    DragOverEvent
} from '@dnd-kit/core'
import { createClient } from '@/lib/supabase'
import { Plus, User, Briefcase, Coins, X, CheckCircle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { format, differenceInDays, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

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

// --- Components ---

// Draggable Member Item (Sidebar)
function DraggableMember({ member }: { member: Member }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: `member-${member.id}`,
        data: { type: 'member', member }
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
                "flex items-center gap-3 p-3 bg-surface border border-white/5 rounded-lg cursor-grab hover:bg-white/5 active:cursor-grabbing",
                isDragging && "opacity-50"
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
function TaskCard({ task }: { task: Task }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: task.id,
        data: { type: 'task', task },
        disabled: task.status === 'completed' // Disable dragging if already done? Or allow moving back? 
        // Let's disable moving back from Done for now to keep payment simple.
    })

    // Also make it valid drop target for Members if it's in ToDo or Doing
    const { setNodeRef: setDropRef, isOver } = useDroppable({
        id: `drop-task-${task.id}`,
        data: { type: 'task-drop-zone', task },
        disabled: task.status === 'completed'
    })

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners} // Make the whole card draggable?
            {...attributes}
            className={cn(
                "relative p-4 rounded-xl border transition-all group touch-none", // touch-none for DnD
                task.status === 'completed' ? "bg-green-500/5 border-green-500/20" :
                    task.assigned_to
                        ? "bg-surface/50 border-white/5" // Assigned
                        : "glass-card border-white/10", // Open
                isDragging && "opacity-30 z-50 rotate-3",
            )}
        >
            {/* Drop Zone overlay for Members */}
            <div ref={setDropRef} className={cn(
                "absolute inset-0 z-10 rounded-xl transition-colors pointer-events-none", // pointer-events-none usually blocks drop? No, drop works on rect.
                // Wait, if pointer-events-none, useDroppable might not detect? 
                // Using a separate div for specific member drop might be tricky. 
                // Let's rely on the card ref itself being draggable AND having a logical droppable wrapper?
                // Actually @dnd-kit allows separate useDraggable and useDroppable on same node.
                isOver && "bg-primary/20 border-2 border-primary"
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

            <h3 className="font-bold text-sm mb-1 relative z-20">{task.title}</h3>
            {task.status !== 'completed' && (
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3 relative z-20">{task.description}</p>
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
function KanbanColumn({ id, title, tasks }: { id: ColumnType, title: string, tasks: Task[] }) {
    const { setNodeRef, isOver } = useDroppable({
        id: id,
        data: { type: 'column', columnId: id }
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
                    isOver && "bg-white/5"
                )}>
                {tasks.map(task => (
                    <TaskCard key={task.id} task={task} />
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

export function TaskBoard() {
    const [tasks, setTasks] = useState<Task[]>([])
    const [members, setMembers] = useState<Member[]>([])
    const [activeDragData, setActiveDragData] = useState<any>(null)
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const supabase = createClient()

    // Create Form State
    const [newTask, setNewTask] = useState({ title: '', description: '', points: 10, category: 'junior' })

    useEffect(() => {
        fetchData()
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
            }) as Task[] // forceful cast for type safety if needed

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
        setActiveDragData(event.active.data.current)
    }

    async function handleDragEnd(event: DragEndEvent) {
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

    return (
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="flex h-[calc(100vh-140px)] gap-6 relative">

                {/* LEFT: Members Sidebar */}
                <div
                    className={cn(
                        "w-64 flex flex-col glass-card border rounded-xl overflow-hidden transition-colors flex-shrink-0",
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
                            <DraggableMember key={member.id} member={member} />
                        ))}
                    </div>
                </div>

                {/* RIGHT: Kanban Columns */}
                <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-x-auto pb-4">
                    <KanbanColumn id="todo" title="To Do" tasks={todoTasks} />
                    <KanbanColumn id="doing" title="Doing" tasks={doingTasks} />
                    <KanbanColumn id="done" title="Done" tasks={doneTasks} />
                </div>

                {/* Absolute Create Button */}
                <button
                    onClick={() => setIsCreateOpen(true)}
                    className="absolute top-0 right-0 px-4 py-2 bg-primary hover:bg-primary/90 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-lg z-50 transform -translate-y-12" // Float above in header area
                >
                    <Plus className="w-4 h-4" />
                    Nova Tarefa
                </button>

                <DragOverlay>
                    {activeDragData?.type === 'member' && (
                        <div className="flex items-center gap-3 p-3 bg-surface border border-primary/50 rounded-lg shadow-2xl w-64 opacity-90 cursor-grabbing">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                                {activeDragData.member.full_name.charAt(0)}
                            </div>
                            <p className="text-sm font-medium">{activeDragData.member.full_name}</p>
                        </div>
                    )}

                    {activeDragData?.type === 'task' && (
                        <div className="w-[300px] opacity-90 cursor-grabbing">
                            <TaskCard task={activeDragData.task} />
                        </div>
                    )}
                </DragOverlay>

                {/* Create Modal */}
                <AnimatePresence>
                    {isCreateOpen && (
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
