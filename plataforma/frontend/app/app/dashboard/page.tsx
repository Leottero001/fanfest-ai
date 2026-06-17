import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../lib/supabaseServer";
import AppDashboardClient from "./AppDashboardClient";

/**
 * Server Component — /app/dashboard
 * Verifica la sesión server-side antes de renderizar.
 * Si no hay sesión, el middleware ya redirige; esto es una segunda capa de seguridad.
 */
export default async function AppDashboardPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  // Fetch profile data
  const { data: profileData } = await supabase
    .from("profiles")
    .select("full_name, avatar_url, phone, is_admin")
    .eq("id", user.id)
    .single();

  const profile = profileData as { full_name: string | null; avatar_url: string | null; phone: string | null; is_admin: boolean | null } | null;

  // Fetch businesses for this user via business_members
  const { data: memberships } = await supabase
    .from("business_members")
    .select("role, businesses(id, name, neighborhood, slug, tone_default, instagram_handle)")
    .eq("user_id", user.id);

  const businesses = (memberships ?? [])
    .map((m: any) => ({ ...m.businesses, role: m.role }))
    .filter(Boolean);

  return (
    <AppDashboardClient
      user={{
        id: user.id,
        email: user.email ?? "",
        fullName: profile?.full_name ?? "",
        avatarUrl: profile?.avatar_url ?? null,
        isAdmin: profile?.is_admin ?? false,
      }}
      businesses={businesses}
    />
  );
}
