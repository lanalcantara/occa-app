import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    // Default next path
    let next = searchParams.get("next") ?? "/dashboard";

    if (code) {
        const supabase = await createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            // Check Profile Role
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('is_social_club')
                    .eq('id', user.id)
                    .single();

                // Redirect General Members (non-Social Club) to their profile editor/view
                if (profile && profile.is_social_club === false) {
                    next = "/profile";
                } else {
                    // Force Dashboard for Social Club members (ignoring other 'next' params to ensure they see the dashboard)
                    next = "/dashboard";
                }
            }

            return NextResponse.redirect(`${origin}${next}`);
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
