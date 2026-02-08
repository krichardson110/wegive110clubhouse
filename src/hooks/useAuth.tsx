import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

const SUPER_ADMIN_EMAIL = 'krichardson@wegive110.com';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isSuperAdmin: boolean;
  forcePasswordChange: boolean;
  clearForcePasswordChange: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [forcePasswordChange, setForcePasswordChange] = useState(false);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // IMPORTANT: Always reset admin state immediately when auth changes
        // This prevents stale admin state from being shown to wrong users
        if (!session?.user) {
          setIsSuperAdmin(false);
          setForcePasswordChange(false);
        } else {
          // Reset first, then check - prevents brief flash of admin access
          setIsSuperAdmin(false);
          setForcePasswordChange(false);
          
          // Check super admin status using email match (fast, synchronous-feeling)
          // Also verify server-side with RPC for extra security
          const emailMatch = session.user.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
          
          if (emailMatch) {
            // Double-check with server-side RPC
            setTimeout(() => {
              checkSuperAdminRPC();
            }, 0);
          }
          
          // Check force password change
          setTimeout(() => {
            checkForcePasswordChange(session.user.id);
          }, 0);
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Quick client-side check first
        const emailMatch = session.user.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
        
        if (emailMatch) {
          checkSuperAdminRPC();
        } else {
          setIsSuperAdmin(false);
        }
        
        checkForcePasswordChange(session.user.id);
      } else {
        setIsSuperAdmin(false);
        setForcePasswordChange(false);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkSuperAdminRPC = async () => {
    try {
      const { data, error } = await supabase.rpc('is_super_admin');
      if (!error) {
        setIsSuperAdmin(data === true);
      } else {
        console.error('Error checking super admin status:', error);
        setIsSuperAdmin(false);
      }
    } catch (e) {
      console.error('Error checking super admin status:', e);
      setIsSuperAdmin(false);
    }
  };

  const checkForcePasswordChange = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('force_password_change')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (!error && data) {
        setForcePasswordChange(data.force_password_change === true);
      } else {
        setForcePasswordChange(false);
      }
    } catch (e) {
      console.error('Error checking force password change:', e);
      setForcePasswordChange(false);
    }
  };

  const clearForcePasswordChange = () => {
    setForcePasswordChange(false);
  };

  const signOut = async () => {
    // Reset state immediately before signout
    setIsSuperAdmin(false);
    setForcePasswordChange(false);
    
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      loading, 
      isSuperAdmin, 
      forcePasswordChange,
      clearForcePasswordChange,
      signOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
