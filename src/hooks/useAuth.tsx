import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAdmin = async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc("has_role", {
        _user_id: userId,
        _role: "admin",
      });

      if (error) {
        console.error("checkAdmin error:", error);
        return false;
      }

      return !!data;
    } catch (err) {
      console.error("checkAdmin exception:", err);
      return false;
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        console.log('[AUTH] onAuthStateChange:', _event, { hasSession: !!nextSession, userId: nextSession?.user?.id });
        setSession(nextSession);
        setUser(nextSession?.user ?? null);

        if (!nextSession?.user) {
          console.log('[AUTH] setIsAdmin:', false, '(no session)');
          setIsAdmin(false);
          console.log('[AUTH] setLoading:', false, '(no session)');
          setLoading(false);
          return;
        }

        console.log('[AUTH] setLoading:', true, '(checkAdmin starting)');
        setLoading(true);
        void checkAdmin(nextSession.user.id)
          .then((admin) => {
            console.log('[AUTH] setIsAdmin:', admin, '(checkAdmin resolved)');
            setIsAdmin(admin);
          })
          .finally(() => {
            console.log('[AUTH] setLoading:', false, '(checkAdmin done)');
            setLoading(false);
          });
      }
    );

    void supabase.auth.getSession()
      .then(async ({ data: { session: currentSession } }) => {
        console.log('[AUTH] getSession:', { hasSession: !!currentSession, userId: currentSession?.user?.id });
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (!currentSession?.user) {
          console.log('[AUTH] setIsAdmin:', false, '(getSession no user)');
          setIsAdmin(false);
          console.log('[AUTH] setLoading:', false, '(getSession no user)');
          setLoading(false);
          return;
        }

        const admin = await checkAdmin(currentSession.user.id);
        console.log('[AUTH] setIsAdmin:', admin, '(getSession checkAdmin)');
        setIsAdmin(admin);
        console.log('[AUTH] setLoading:', false, '(getSession done)');
        setLoading(false);
      })
      .catch((err) => {
        console.error("getSession error:", err);
        console.log('[AUTH] setIsAdmin:', false, '(getSession error)');
        setIsAdmin(false);
        console.log('[AUTH] setLoading:', false, '(getSession error)');
        setLoading(false);
      });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error ? new Error(error.message) : null };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "로그인 중 예기치 못한 오류가 발생했습니다.";
      return { error: new Error(message) };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, isAdmin, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
