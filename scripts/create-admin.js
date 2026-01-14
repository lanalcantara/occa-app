const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing environment variables.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function createAdmin() {
    const email = 'admin@occa.com';
    const password = '12345678';

    console.log(`Creating admin user: ${email}...`);

    // 1. Create User
    const { data: user, error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: 'Admin OCCA' }
    });

    if (createError) {
        console.error('Error creating user:', createError.message);
        // If user already exists, try to fetch and update
        if (createError.message.includes('already has been registered')) {
            console.log('User exists, finding ID...');
            // We can't easily search by email with basic client without admin listUsers permission
            // But we can try to "update" profile blindly if we knew ID, or just ask user to verify.
            // Let's assume for this specific flow we want to overwrite or update.
        }
    } else {
        console.log('User created. ID:', user.user.id);

        // 2. Update Role in Profiles
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ role: 'admin', full_name: 'Admin OCCA', onboarding_completed: true })
            .eq('id', user.user.id);

        if (updateError) {
            console.error('Error updating profile role:', updateError);
        } else {
            console.log('SUCCESS: User promoted to ADMIN.');
        }
    }
}

createAdmin();
