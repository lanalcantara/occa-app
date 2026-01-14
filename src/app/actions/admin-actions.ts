'use server'

import { createClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { revalidatePath } from 'next/cache'

/**
 * Logs an action to the audit_logs table.
 */
async function logAction(adminId: string, action: string, targetUserId: string | null, details: any = {}) {
    await supabaseAdmin.from('audit_logs').insert({
        admin_id: adminId,
        action,
        target_user_id: targetUserId,
        details
    })
}

/**
 * Promote a user to Admin role.
 */
export async function promoteToAdmin(targetUserId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    // Verify requester is admin
    const { data: requesterProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (requesterProfile?.role !== 'admin') throw new Error('Unauthorized: Must be an admin')

    // Update target profile
    const { error } = await supabaseAdmin.from('profiles').update({ role: 'admin' }).eq('id', targetUserId)

    if (error) throw new Error('Failed to promote user: ' + error.message)

    await logAction(user.id, 'PROMOTE_ADMIN', targetUserId, { timestamp: new Date().toISOString() })
    revalidatePath('/admin/users')
    return { success: true }
}

/**
 * Delete a user (from auth and profiles).
 * Requires Admin Password for verification.
 */
export async function deleteUser(targetUserId: string, adminPassword: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !user.email) throw new Error('Unauthorized')

    // 1. Verify Request is Admin
    const { data: requesterProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (requesterProfile?.role !== 'admin') throw new Error('Unauthorized: Must be an admin')

    // 2. Verify Password (Re-authentication)
    // We create a temporary client just to verify credentials without processing a session
    const tempClient = await createClient() // Actually just use the same auth api
    // Use signInWithPassword to verify. 
    // Note: createClient uses cookies, so it's already logged in. 
    // We need to attempt a *fresh* login with specific credentials to verify "sudo" mode.

    // We use the REST API or a fresh Supabase client instance (not the nextjs helper which uses cookies)
    // to avoid messing with current session cookies.
    // Use the basic supabase-js client for verification?
    // Actually, we can use supabaseAdmin.auth.signInWithPassword but checking against the User's credentials? 
    // No, supabaseAdmin is Service Role. 

    // Let's use a fresh public client to verify credentials
    const { createClient: createPublicClient } = require('@supabase/supabase-js')
    const verifyClient = createPublicClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

    const { error: authError } = await verifyClient.auth.signInWithPassword({
        email: user.email,
        password: adminPassword
    })

    if (authError) {
        throw new Error('Senha incorreta. Ação cancelada.')
    }

    // 3. Perform Deletion
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(targetUserId)

    if (deleteError) throw new Error('Failed to delete user: ' + deleteError.message)

    // 4. Log Action
    await logAction(user.id, 'DELETE_USER', targetUserId, { timestamp: new Date().toISOString() })

    revalidatePath('/admin/users')
    return { success: true }
}

/**
 * Create a new Admin User directly.
 */
export async function createAdminUser(name: string, email: string, cpf: string, role: 'admin' | 'member' = 'member') {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    // Verify requester is admin
    const { data: requesterProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (requesterProfile?.role !== 'admin') throw new Error('Unauthorized: Must be an admin')

    // 1. Create User in Auth
    // Use generated password or specific? 
    // Requirement says "create other Admins", usually implies setting up their account.
    // Let's assume we set a temporary password (e.g. first 5 digits of CPF as per previous logic)
    const password = cpf.replace(/\D/g, '').slice(0, 5)

    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: name, cpf }
    })

    if (createError) throw new Error('Failed to create user: ' + createError.message)
    if (!newUser.user) throw new Error('User creation failed silently')

    // 2. Update Profile Role (if created successfully, profile trigger might run, or we update manually)
    // The previous implementation relied on triggers. 
    // Let's explicit update role just in case.

    // Give trigger a moment? Or just upsert.
    // With Service Role we can Upsert Profile
    const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
        id: newUser.user.id,
        full_name: name,
        role: role, // 'admin' or 'member'
        cpf: cpf,
        email: email,
        updated_at: new Date().toISOString()
    })

    if (profileError) {
        // Log error but user is created
        console.error('Profile update failed', profileError)
    }

    await logAction(user.id, 'CREATE_USER', newUser.user.id, { role, email, name })
    revalidatePath('/admin/users')
    return { success: true, tempPassword: password }
}

/**
 * Demote an Admin to Member role.
 */
export async function demoteToMember(targetUserId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    // Verify requester is admin
    const { data: requesterProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (requesterProfile?.role !== 'admin') throw new Error('Unauthorized: Must be an admin')

    // Prevent self-demotion (optional but good practice)
    if (user.id === targetUserId) throw new Error('You cannot demote yourself.')

    // Update target profile
    const { error } = await supabaseAdmin.from('profiles').update({ role: 'member' }).eq('id', targetUserId)

    if (error) throw new Error('Failed to demote user: ' + error.message)

    await logAction(user.id, 'DEMOTE_ADMIN', targetUserId, { timestamp: new Date().toISOString() })
    revalidatePath('/admin/users')
    return { success: true }
}
