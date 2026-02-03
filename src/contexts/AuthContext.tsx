"use client";

import { createContext, useContext, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";

type AuthContextType = {
  authLoading: boolean;
  userRole: string | null;
  isAdmin: boolean;
  userId: string | null;
};

const AuthContext = createContext<AuthContextType>({
  authLoading: true,
  userRole: null,
  isAdmin: false,
  userId: null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authLoading, setAuthLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    if (hasCheckedRef.current) return;

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
          setAuthLoading(false);
          return;
        }

        // Buscar role do usuário
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        if (!profileError && profile) {
          setUserRole(profile.role);
          setUserId(session.user.id);
        } else {
          // Se não tem perfil, não é admin
          setUserRole(null);
          setUserId(session.user.id);
        }
        setAuthLoading(false);
        hasCheckedRef.current = true;
      } catch (err) {
        console.error("Erro inesperado:", err);
        await supabase.auth.signOut();
        router.push("/login");
        setAuthLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!session && event === "SIGNED_OUT") {
          router.push("/login");
          setUserRole(null);
          setUserId(null);
          hasCheckedRef.current = false;
        } else if (session && event === "SIGNED_IN") {
          // Buscar role quando realmente fizer login
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", session.user.id)
            .single();

          if (profile) {
            setUserRole(profile.role);
            setUserId(session.user.id);
          } else {
            setUserRole(null);
            setUserId(session.user.id);
          }
          setAuthLoading(false);
          hasCheckedRef.current = true;
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []); // Removido router das dependências para evitar re-renders

  return (
    <AuthContext.Provider
      value={{
        authLoading,
        userRole,
        isAdmin: userRole === "admin",
        userId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

