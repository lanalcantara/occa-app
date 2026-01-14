'use client'

import { useState, useEffect } from 'react'
import {
    DndContext,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    defaultDropAnimationSideEffects,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
    DropAnimation
} from '@dnd-kit/core'
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { createClient } from '@/lib/supabase'
import { Shield, Lock, Unlock } from 'lucide-react'
import { cn } from '@/lib/utils'

export type UserType = {
    id: string
    full_name: string
    role: string
    category: 'junior' | 'pleno' | 'senior'
    avatar_url?: string
    can_move_tasks?: boolean
}

const CATEGORIES = ['junior', 'pleno', 'senior'] as const;

function SortableUser({ user, onTogglePermission }: { user: UserType, onTogglePermission: (id: string, current: boolean) => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: user.id,
        data: {
            type: 'User',
            user,
        }
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
    };

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="p-3 bg-white/5 border border-primary/50 rounded-lg mb-2 opacity-30 h-[60px]"
            />
        )
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="p-3 bg-surface border border-white/5 rounded-lg mb-2 cursor-grab active:cursor-grabbing hover:bg-white/5 flex items-center gap-3 group relative"
        >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary/20 to-secondary/20 flex items-center justify-center text-xs font-bold text-primary border border-white/5">
                {user.avatar_url ? (
                    <img src={user.avatar_url} className="w-full h-full rounded-full object-cover" />
                ) : (
                    user.full_name?.charAt(0)
                )}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.full_name}</p>
                <div className="flex items-center gap-2">
                    <p className="text-[10px] text-muted-foreground uppercase">{user.role}</p>
                    {user.can_move_tasks && (
                        <span className="text-[10px] bg-green-500/20 text-green-400 px-1 rounded border border-green-500/20">Move Tasks</span>
                    )}
                </div>
            </div>

            <button
                onPointerDown={(e) => e.stopPropagation()} // Prevent drag start
                onClick={(e) => {
                    e.stopPropagation();
                    onTogglePermission(user.id, !!user.can_move_tasks);
                }}
                className={cn(
                    "p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity",
                    user.can_move_tasks ? "bg-green-500/10 text-green-400 hover:bg-green-500/20" : "bg-white/5 text-muted-foreground hover:bg-white/10"
                )}
                title={user.can_move_tasks ? "Revogar permissão de mover tarefas" : "Conceder permissão de mover tarefas"}
            >
                {user.can_move_tasks ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
            </button>
        </div>
    );
}

function UserCard({ user }: { user: UserType }) {
    return (
        <div className="p-3 bg-surface border border-primary rounded-lg mb-2 flex items-center gap-3 shadow-2xl cursor-grabbing">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-white">
                {user.full_name?.charAt(0)}
            </div>
            <div>
                <p className="text-sm font-medium">{user.full_name}</p>
                <p className="text-xs text-muted-foreground">{user.role}</p>
            </div>
        </div>
    )
}

function UserColumn({ title, id, users, onTogglePermission }: { title: string, id: string, users: UserType[], onTogglePermission: (id: string, current: boolean) => void }) {
    const { setNodeRef } = useSortable({ id });

    return (
        <div className="flex-1 min-w-[300px] flex flex-col">
            <div className={cn(
                "flex items-center gap-2 mb-4 pb-2 border-b-2",
                id === 'senior' ? 'border-purple-500/50' :
                    id === 'pleno' ? 'border-blue-500/50' : 'border-green-500/50'
            )}>
                <Shield className={cn("w-4 h-4",
                    id === 'senior' ? 'text-purple-400' :
                        id === 'pleno' ? 'text-blue-400' : 'text-green-400'
                )} />
                <h3 className="font-bold text-sm uppercase tracking-wider">{title}</h3>
                <span className="ml-auto bg-white/10 text-xs px-2 py-0.5 rounded-full font-mono">{users.length}</span>
            </div>

            <div ref={setNodeRef} className="bg-card/30 p-2 rounded-xl border border-white/5 flex-1 min-h-[500px]">
                <SortableContext items={users.map(u => u.id)} strategy={verticalListSortingStrategy}>
                    {users.map(user => <SortableUser key={user.id} user={user} onTogglePermission={onTogglePermission} />)}
                </SortableContext>
            </div>
        </div>
    )
}

export function UserBoard() {
    const [users, setUsers] = useState<UserType[]>([])
    const [activeUser, setActiveUser] = useState<UserType | null>(null)
    const supabase = createClient()

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), // Requires 5px move to start drag
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        loadUsers()
    }, [])

    async function loadUsers() {
        const { data } = await supabase.from('profiles').select('*').neq('role', 'admin')
        if (data) setUsers(data as UserType[])
    }

    async function handleTogglePermission(userId: string, current: boolean) {
        // Optimistic
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, can_move_tasks: !current } : u))

        const { error } = await supabase
            .from('profiles')
            .update({ can_move_tasks: !current })
            .eq('id', userId)

        if (error) {
            console.error('Error updating permission:', error)
            alert('Erro ao atualizar permissão')
            loadUsers() // Revert
        }
    }

    function handleDragStart(event: DragStartEvent) {
        if (event.active.data.current?.type === 'User') {
            setActiveUser(event.active.data.current.user)
        }
    }

    async function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        setActiveUser(null);

        if (!over) return;

        const activeId = active.id;
        const overId = over.id; // Could be a user ID or a container ID (category)

        const activeUser = users.find(u => u.id === activeId);
        if (!activeUser) return;

        // Determine target category
        let targetCategory: string | undefined;

        if (CATEGORIES.includes(overId as any)) {
            // Dropped directly on a column
            targetCategory = overId as string;
        } else {
            // Dropped on another user
            const overUser = users.find(u => u.id === overId);
            if (overUser) {
                targetCategory = overUser.category;
            }
        }

        if (targetCategory && targetCategory !== activeUser.category) {
            // Optimistic UI Update
            setUsers(users => users.map(u =>
                u.id === activeId ? { ...u, category: targetCategory as any } : u
            ));

            // DB Update
            await supabase.from('profiles').update({ category: targetCategory }).eq('id', activeId);
        }
    }

    const dropAnimation: DropAnimation = {
        sideEffects: defaultDropAnimationSideEffects({
            styles: {
                active: {
                    opacity: '0.5',
                },
            },
        }),
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex flex-col md:flex-row gap-6 overflow-x-auto pb-4 items-stretch">
                <SortableContext items={CATEGORIES as unknown as string[]} strategy={verticalListSortingStrategy}>
                    <UserColumn title="Junior" id="junior" users={users.filter(u => u.category === 'junior')} onTogglePermission={handleTogglePermission} />
                    <UserColumn title="Pleno" id="pleno" users={users.filter(u => u.category === 'pleno')} onTogglePermission={handleTogglePermission} />
                    <UserColumn title="Sênior" id="senior" users={users.filter(u => u.category === 'senior')} onTogglePermission={handleTogglePermission} />
                </SortableContext>
            </div>

            <DragOverlay dropAnimation={dropAnimation}>
                {activeUser ? <UserCard user={activeUser} /> : null}
            </DragOverlay>
        </DndContext>
    )
}
