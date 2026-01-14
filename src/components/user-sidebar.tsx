'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    ShoppingBag,
    MessageCircle,
    User,
    LogOut,
    Briefcase,
    Map
} from "lucide-react"
import { SignOutButton } from "./sign-out-button"

const sidebarItems = [
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        color: "text-blue-400",
        bgColor: "bg-blue-500/10",
        borderColor: "hover:border-blue-500/50"
    },
    {
        title: "Tarefas",
        href: "/tasks",
        icon: Briefcase,
        color: "text-blue-400",
        bgColor: "bg-blue-500/10",
        borderColor: "hover:border-blue-500/50"
    },
    {
        title: "Loja",
        href: "/shop",
        icon: ShoppingBag,
        color: "text-green-400",
        bgColor: "bg-green-500/10",
        borderColor: "hover:border-green-500/50"
    },
    {
        title: "Feedback",
        href: "/feedback",
        icon: MessageCircle,
        color: "text-purple-400",
        bgColor: "bg-purple-500/10",
        borderColor: "hover:border-purple-500/50"
    },
    {
        title: "Perfil",
        href: "/profile",
        icon: User,
        color: "text-yellow-400",
        bgColor: "bg-yellow-500/10",
        borderColor: "hover:border-yellow-500/50"
    }
]

export function UserSidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
    const pathname = usePathname()

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed left-0 top-0 h-full w-64 bg-background/80 backdrop-blur-xl border-r border-white/10 p-4 z-50 flex flex-col transition-transform duration-300 md:translate-x-0 cursor-default",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {/* Logo Area */}
                <div className="flex items-center gap-3 px-2 mb-8 mt-2 justify-between">
                    <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/20">
                            <span className="font-black text-primary">OC</span>
                        </div>
                        <div>
                            <h1 className="font-bold text-sm tracking-wide">OCCA</h1>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Membro</p>
                        </div>
                    </Link>
                    {/* Close Button Mobile */}
                    <button onClick={onClose} className="md:hidden p-1 hover:bg-white/10 rounded-md">
                        <LogOut className="w-5 h-5 rotate-180" /> {/* Using LogOut kind of as an exit icon or use X */}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-2">
                    {sidebarItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href))
                        const Icon = item.icon

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={onClose} // Close on navigation
                                className={cn(
                                    "group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all border border-transparent",
                                    isActive
                                        ? `bg-white/5 border-white/10 text-white`
                                        : "hover:bg-white/5 text-muted-foreground hover:text-white"
                                )}
                            >
                                <div className={cn(
                                    "w-8 h-8 rounded-md flex items-center justify-center transition-colors",
                                    isActive ? item.bgColor : "bg-white/5 group-hover:bg-white/10"
                                )}>
                                    <Icon className={cn("w-4 h-4", isActive ? item.color : "text-muted-foreground group-hover:text-white")} />
                                </div>
                                <span className="text-sm font-medium">{item.title}</span>

                                {isActive && (
                                    <div className={cn("ml-auto w-1.5 h-1.5 rounded-full", item.color.replace('text-', 'bg-'))} />
                                )}
                            </Link>
                        )
                    })}
                </nav>

                {/* Footer / Sign Out */}
                <div className="pt-4 border-t border-white/10">
                    <SignOutButton className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-all group border border-transparent hover:border-red-500/20" />
                </div>
            </aside>
        </>
    )
}
