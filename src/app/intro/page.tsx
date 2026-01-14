import { createClient } from "@/lib/supabase-server";
import { ShowcaseView } from "@/components/showcase/showcase-view";

export default async function IntroPage() {
    const supabase = await createClient();

    // Fetch public profiles for the showcase
    const { data: publicProfiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, category, points')
        .neq('role', 'admin')
        .limit(8)
        .order('points', { ascending: false });

    // Fetch current user session
    const { data: { user } } = await supabase.auth.getUser();

    return <ShowcaseView publicProfiles={publicProfiles || []} currentUser={user} />;
}

