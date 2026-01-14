'use client'

import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext({})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const supabase = createClient()
    const router = useRouter()
    const [user, setUser] = useState(null)

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT') {
                router.push('/login')
                setUser(null)
            } else if (session?.user) {
                setUser(session.user as any)
            }
        })

        return () => {
            subscription.unsubscribe()
        }
    }, [router, supabase])

    return (
        <AuthContext.Provider value={{ user, supabase }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
