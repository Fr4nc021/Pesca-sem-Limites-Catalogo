import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";

export function useAuth() {
  const router = useRouter();
  const [authLoading, setAuthLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error || !session) {
          if (error) {
            console.error("Erro na sessão:", error.message);
            await supabase.auth.signOut();
          }
          router.push("/login");
        } else {
          // Buscar role do usuário
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", session.user.id)
            .single();

          if (!profileError && profile) {
            setUserRole(profile.role);
          }
          setAuthLoading(false);
        }
      } catch (err) {
        console.error("Erro inesperado no checkAuth:", err);
        await supabase.auth.signOut();
        router.push("/login");
      }
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!session && event === "SIGNED_OUT") {
        router.push("/login");
        setUserRole(null);
      } else if (session) {
        // Buscar role quando a sessão mudar
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        if (profile) {
          setUserRole(profile.role);
        }
        setAuthLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  return { authLoading, userRole, isAdmin: userRole === "admin" };
}