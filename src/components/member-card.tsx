'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { QrCode, Shield, Star, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ProfileData = {
    full_name: string
    role: string
    category: string
    points: number
    avatar_url?: string
    id: string
}

export function MemberCard({ profile }: { profile: ProfileData }) {
    const [isFlipped, setIsFlipped] = useState(false)

    return (
        <div className="perspective-1000 w-[350px] h-[220px] cursor-pointer group" onClick={() => setIsFlipped(!isFlipped)}>
            <motion.div
                initial={false}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                className="relative w-full h-full [transform-style:preserve-3d]"
            >
                {/* FRONT */}
                <div
                    className={cn(
                        "absolute w-full h-full [backface-visibility:hidden] rounded-2xl overflow-hidden glass-card border border-white/10 shadow-2xl",
                        isFlipped ? "pointer-events-none" : "pointer-events-auto"
                    )}
                >
                    {/* Background Art */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/20 pointer-events-none" />

                    <div className="relative p-6 flex flex-col justify-between h-full z-10">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary to-accent p-[2px]">
                                    <div className="w-full h-full rounded-full bg-black overflow-hidden relative">
                                        {profile.avatar_url ? (
                                            <img src={profile.avatar_url} alt="Profile" className="object-cover w-full h-full" />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-xl font-bold text-white bg-zinc-800">
                                                {profile.full_name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg leading-tight text-white">{profile.full_name}</h3>
                                    <span className="text-xs uppercase tracking-wider text-primary font-semibold border border-primary/30 px-2 py-0.5 rounded-full bg-primary/10">
                                        {profile.role}
                                    </span>
                                </div>
                            </div>
                            <Trophy className="text-yellow-500 w-6 h-6 drop-shadow-lg" />
                        </div>

                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Categoria</p>
                                <div className="flex items-center gap-2">
                                    <Shield className={cn("w-4 h-4",
                                        profile.category === 'senior' ? 'text-purple-400' :
                                            profile.category === 'pleno' ? 'text-blue-400' : 'text-green-400'
                                    )} />
                                    <span className="font-bold text-lg capitalize">{profile.category}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Pontos</p>
                                <div className="flex items-center gap-1 justify-end font-mono text-xl font-bold text-secondary">
                                    <Star className="w-4 h-4 fill-secondary" />
                                    {profile.points}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* BACK */}
                <div
                    className={cn(
                        "absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-2xl overflow-hidden glass-card border border-white/10 shadow-2xl",
                        !isFlipped ? "pointer-events-none" : "pointer-events-auto"
                    )}
                >
                    <div className="absolute inset-0 bg-zinc-900/95" />
                    <div className="relative p-6 flex flex-col items-center justify-center h-full text-center z-10">
                        <div className="bg-white p-2 rounded-lg mb-4">
                            <QrCode className="w-24 h-24 text-black" />
                        </div>
                        <p className="text-xs font-mono text-muted-foreground break-all max-w-[80%]">
                            ID: {profile.id}
                        </p>
                        {/* Removed 'Membro Oficial OCCA' text if it was causing visual clutter or just kept simple */}
                        <p className="text-xs text-muted-foreground mt-2">Membro Oficial OCCA</p>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
