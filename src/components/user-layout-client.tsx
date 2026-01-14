'use client'

import { useState } from "react"
import { Menu } from "lucide-react"
import { UserSidebar } from "./user-sidebar"

export function UserLayoutClient({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    return (
        <div className="flex h-screen w-full bg-background overflow-hidden relative">
            <UserSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <div className="flex-1 flex flex-col md:pl-64 h-full relative z-10 transition-all">
                {/* Mobile Header for Toggle */}
                <div className="md:hidden flex items-center p-4 pb-0">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 -ml-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <span className="ml-2 font-bold text-sm tracking-wide">OCCA</span>
                </div>

                <main className="flex-1 overflow-auto">
                    {children}
                </main>
            </div>

            {/* Ambient Background carried over from dashboard view idea, global for all user pages */}
            <div className="fixed top-[-20%] left-[20%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none z-0" />
        </div>
    )
}
