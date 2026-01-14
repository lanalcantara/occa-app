'use client'

import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

export function SignOutButton({ className, children }: { className?: string, children?: React.ReactNode }) {
    const router = useRouter()
    const supabase = createClient()

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.refresh()
        router.push('/login')
    }

    return (
        <button
            onClick={handleSignOut}
            className={className}
        >
            {children || (
                <>
                    <LogOut className="w-5 h-5" />
                    Sair
                </>
            )}
        </button>
    )
}
