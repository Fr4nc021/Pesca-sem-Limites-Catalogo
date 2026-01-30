import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";

export function useAuth() {
  const router = useRouter();
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error || !session) {
          // Se houver erro de token inválido ou se não houver sessão, limpa e redireciona
          if (error) {
            console.error("Erro na sessão:", error.message);
            await supabase.auth.signOut();
          }
          router.push("/login");
        } else {
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
      } else if (session) {
        setAuthLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  return { authLoading };
}

