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
import { Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

export type UserType = {
    id: string
    full_name: string
    role: string
    category: 'junior' | 'pleno' | 'senior'
    avatar_url?: string
}

const CATEGORIES = ['junior', 'pleno', 'senior'] as const;

function SortableUser({ user }: { user: UserType }) {
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
            className="p-3 bg-surface border border-white/5 rounded-lg mb-2 cursor-grab active:cursor-grabbing hover:bg-white/5 flex items-center gap-3 group"
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
                <p className="text-[10px] text-muted-foreground uppercase">{user.role}</p>
            </div>
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

function UserColumn({ title, id, users }: { title: string, id: string, users: UserType[] }) {
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
                    {users.map(user => <SortableUser key={user.id} user={user} />)}
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
                    <UserColumn title="Junior" id="junior" users={users.filter(u => u.category === 'junior')} />
                    <UserColumn title="Pleno" id="pleno" users={users.filter(u => u.category === 'pleno')} />
                    <UserColumn title="Sênior" id="senior" users={users.filter(u => u.category === 'senior')} />
                </SortableContext>
            </div>

            <DragOverlay dropAnimation={dropAnimation}>
                {activeUser ? <UserCard user={activeUser} /> : null}
            </DragOverlay>
        </DndContext>
    )
}
