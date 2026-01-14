import { createClient } from "@/lib/supabase-server"

export default async function PublicProfileLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Only fetch session effectively, essentially a clean wrapper
    // We can add a simple back button header or similar here if needed
    return (
        <>
            {children}
        </>
    )
}
